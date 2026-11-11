/**
 * Amanhecer Product Analytics & Intelligence SDK
 *
 * Princípios arquiteturais:
 * 1. Privacy by Design & Default: Zero coleta, zero identificadores e zero fila antes do consentimento.
 * 2. Sem bloqueio de UI: Fila assíncrona resiliente a modo offline com deduplicação por UUID (`eventId`).
 * 3. Preservação temporal: Eventos offline preservam `occurredAt` original e o servidor registra `receivedAt`.
 * 4. Minimização de dados: Sem IP completo, sem fingerprinting, sem coleta de textos pessoais ou anotações.
 */

import {
  isAnalyticsConsentGranted,
  onConsentChange,
  purgeLocalAnalyticsData,
} from '../consent/consent-manager';
import { CURRENT_UPDATE } from '../../content/updates/current-update';

export type AnalyticsEventName =
  // Landing & Funil de Instalação
  | 'landing_viewed'
  | 'landing_interacted'
  | 'landing_cta_clicked'
  | 'install_tutorial_opened'
  | 'install_tutorial_tab_changed'
  | 'install_prompt_triggered'
  | 'install_prompt_outcome'
  | 'pwa_appinstalled_detected'
  // Ciclo de Vida & Sessão
  | 'app_opened'
  | 'pwa_standalone_opened'
  | 'page_viewed'
  | 'session_heartbeat'
  // Leituras & Devocionais
  | 'devotional_opened'
  | 'reading_started'
  | 'devotional_completed'
  | 'devotional_favorited'
  // Versículo do Dia & Compartilhamento
  | 'verse_viewed'
  | 'verse_clicked'
  | 'verse_image_generated'
  | 'verse_image_downloaded'
  | 'verse_text_copied'
  | 'share_initiated'
  | 'share_completed'
  // Notificações
  | 'notification_permission_granted'
  | 'notification_permission_denied'
  | 'notification_scheduled'
  | 'notification_opened'
  | 'notification_converted_reading'
  | 'notification_disabled'
  // Configurações (agregadas)
  | 'settings_changed'
  | 'settings_error'
  // Doação & Apoio Comunitário
  | 'donation_pix_copied'
  // Monitoramento Técnico & Web Vitals
  | 'technical_error'
  | 'web_vital_measured';

export interface UTMParameters {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrerCategory: string;
}

export interface AnalyticsEventPayload {
  eventId: string;
  eventName: AnalyticsEventName;
  occurredAt: string;
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  isStandalone: boolean;
  isOfflineAtCapture: boolean;
  appVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Outro';
  browser: 'Chrome' | 'Safari' | 'Samsung Internet' | 'Edge' | 'Firefox' | 'Outro';
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrerCategory: string;
  properties: Record<string, string | number | boolean | null>;
}

const VISITOR_KEY = 'amanhecer_analytics_visitor_id';
const SESSION_KEY = 'amanhecer_analytics_session_v1';
const QUEUE_KEY = 'amanhecer_analytics_queue_v1';
const UTM_KEY = 'amanhecer_analytics_utm_v1';
const FIRST_SEEN_KEY = 'amanhecer_analytics_first_seen_v1';
const ACTIVE_DAYS_KEY = 'amanhecer_analytics_active_days_v1';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const MAX_QUEUE_SIZE = 120;
const FLUSH_INTERVAL_MS = 8000;

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;
let sdkInitialized = false;
let sessionOpenedViaNotification = false;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Filtra bots automatizados, crawlers e prefetches de Service Worker.
 */
export function isAutomatedTraffic(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  if ((navigator as any).webdriver === true) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/bot|crawler|spider|headless|lighthouse|prerender|phantomjs|slurp|bingpreview/i.test(ua)) {
    return true;
  }
  return false;
}

/**
 * Sanitiza mensagens de erro para remover tokens, chaves, e-mails ou dados privados.
 */
export function sanitizeErrorMessage(raw: string): string {
  if (!raw) return 'unknown_error';
  return raw
    .slice(0, 280)
    // Remove e-mails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    // Remove Bearer tokens / JWTs / hex keys longas
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [TOKEN_REDACTED]')
    .replace(/eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*/g, '[JWT_REDACTED]')
    .replace(/\b[A-Fa-f0-9]{32,}\b/g, '[HEX_KEY_REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{30,}/g, '[API_KEY_REDACTED]')
    // Remove query strings potencialmente sensíveis em URLs
    .replace(/(\?|&)(token|key|secret|password|auth|endpoint)=([^&\s]+)/gi, '$1$2=[REDACTED]');
}

/**
 * Detecta categoria de dispositivo, SO e navegador sem fingerprinting invasivo.
 */
export function getBasicDeviceContext(): {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Outro';
  browser: 'Chrome' | 'Safari' | 'Samsung Internet' | 'Edge' | 'Firefox' | 'Outro';
  isStandalone: boolean;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { deviceType: 'desktop', os: 'Outro', browser: 'Outro', isStandalone: false };
  }

  const ua = navigator.userAgent || '';
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  let os: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Outro' = 'Outro';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) os = 'iOS';
  else if (/Win/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (os === 'Android' && !/Mobile/i.test(ua))) {
    deviceType = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android/i.test(ua)) {
    deviceType = 'mobile';
  }

  let browser: 'Chrome' | 'Safari' | 'Samsung Internet' | 'Edge' | 'Firefox' | 'Outro' = 'Outro';
  if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Chrome|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  return { deviceType, os, browser, isStandalone };
}

/**
 * Obtém ou cria o identificador pseudônimo de visitante (APENAS após consentimento válido).
 */
function getOrCreateVisitorIdentity(): { visitorId: string; isNewVisitor: boolean } {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  let isNewVisitor = false;
  if (!visitorId) {
    visitorId = `v_${generateUUID()}`;
    localStorage.setItem(VISITOR_KEY, visitorId);
    localStorage.setItem(FIRST_SEEN_KEY, new Date().toISOString().slice(0, 10));
    isNewVisitor = true;
  }
  return { visitorId, isNewVisitor };
}

/**
 * Calcula a sequência de dias consecutivos de leitura (streak) com base nos dias ativos locais.
 */
export function recordActiveReadingDayAndGetStreak(dateStr: string): number {
  if (!isAnalyticsConsentGranted() || typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(ACTIVE_DAYS_KEY);
    const days: string[] = raw ? JSON.parse(raw) : [];
    if (!days.includes(dateStr)) {
      days.push(dateStr);
      days.sort();
      localStorage.setItem(ACTIVE_DAYS_KEY, JSON.stringify(days.slice(-90)));
    }
    // Conta dias consecutivos até `dateStr`
    let streak = 1;
    const sorted = [...days].sort().reverse();
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(`${sorted[i]}T12:00:00Z`).getTime();
      const prev = new Date(`${sorted[i + 1]}T12:00:00Z`).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak++;
      else if (diffDays > 1) break;
    }
    return streak;
  } catch {
    return 1;
  }
}

interface SessionData {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
  utm: UTMParameters;
}

/**
 * Classifica a origem do tráfego sem inventar atribuições não verificáveis.
 */
export function resolveTrafficAttribution(): UTMParameters {
  if (typeof window === 'undefined') {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      referrerCategory: 'direct',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.trim().toLowerCase() || null;
  const utmMedium = params.get('utm_medium')?.trim().toLowerCase() || null;
  const utmCampaign = params.get('utm_campaign')?.trim().toLowerCase() || null;
  const utmContent = params.get('utm_content')?.trim().toLowerCase() || null;
  const utmTerm = params.get('utm_term')?.trim().toLowerCase() || null;
  const swSource = params.get('source')?.trim().toLowerCase() || null;

  let referrerCategory = 'direct';

  if (swSource && swSource.startsWith('sw-')) {
    referrerCategory = 'notification';
  } else if (utmMedium === 'share' || utmSource === 'app_share') {
    referrerCategory = 'share_link';
  } else if (utmSource) {
    if (utmSource.includes('insta')) referrerCategory = 'instagram';
    else if (utmSource.includes('youtube') || utmSource.includes('yt')) referrerCategory = 'youtube';
    else if (utmSource.includes('whats') || utmSource.includes('wa')) referrerCategory = 'whatsapp';
    else if (utmSource.includes('face') || utmSource.includes('fb')) referrerCategory = 'facebook';
    else if (utmSource.includes('qr') || utmMedium === 'qr' || utmMedium === 'qrcode') referrerCategory = 'qr_code';
    else if (utmSource.includes('igreja') || utmSource.includes('church')) referrerCategory = 'church';
    else if (utmSource.includes('radio')) referrerCategory = 'radio';
    else if (utmSource.includes('parceir') || utmMedium === 'partnership') referrerCategory = 'partnership';
    else referrerCategory = utmSource;
  } else if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      const host = refUrl.hostname.toLowerCase();
      if (host === window.location.hostname) {
        referrerCategory = 'direct';
      } else if (host.includes('instagram.com')) {
        referrerCategory = 'instagram';
      } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
        referrerCategory = 'youtube';
      } else if (host.includes('whatsapp.com') || host.includes('wa.me')) {
        referrerCategory = 'whatsapp';
      } else if (host.includes('facebook.com') || host.includes('fb.com')) {
        referrerCategory = 'facebook';
      } else if (
        host.includes('google.') ||
        host.includes('bing.com') ||
        host.includes('duckduckgo.com') ||
        host.includes('yahoo.com')
      ) {
        referrerCategory = 'organic_search';
      } else {
        referrerCategory = 'referral';
      }
    } catch {
      referrerCategory = 'direct';
    }
  }

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrerCategory,
  };
}

function getOrCreateSession(): SessionData {
  const now = Date.now();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionData;
      if (parsed.sessionId && now - parsed.lastActivityAt < SESSION_TIMEOUT_MS) {
        parsed.lastActivityAt = now;
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get('utm_source')) {
          parsed.utm = resolveTrafficAttribution();
        }
        const serialized = JSON.stringify(parsed);
        sessionStorage.setItem(SESSION_KEY, serialized);
        localStorage.setItem(SESSION_KEY, serialized);
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  const utm = resolveTrafficAttribution();
  const created: SessionData = {
    sessionId: `s_${generateUUID()}`,
    startedAt: now,
    lastActivityAt: now,
    utm,
  };
  try {
    const serialized = JSON.stringify(created);
    sessionStorage.setItem(SESSION_KEY, serialized);
    localStorage.setItem(SESSION_KEY, serialized);
    if (utm.utmSource || utm.referrerCategory !== 'direct') {
      localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch {
    // ignore
  }
  return created;
}

function readEventQueue(): AnalyticsEventPayload[] {
  if (!isAnalyticsConsentGranted() || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEventQueue(events: AnalyticsEventPayload[]): void {
  if (!isAnalyticsConsentGranted() || typeof window === 'undefined') return;
  try {
    const trimmed = events.slice(-MAX_QUEUE_SIZE);
    if (trimmed.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
    }
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Registra um evento de produto no Amanhecer.
 * Retorna `true` se o evento foi aceito e enfileirado (com consentimento válido),
 * ou `false` se foi bloqueado por falta de consentimento ou tráfego automatizado.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, string | number | boolean | null | undefined> = {}
): boolean {
  // REGRA PRIORITÁRIA (Seção 21): Bloqueio total antes do consentimento válido
  if (!isAnalyticsConsentGranted()) {
    return false;
  }

  if (isAutomatedTraffic()) {
    return false;
  }

  try {
    const { visitorId, isNewVisitor } = getOrCreateVisitorIdentity();
    const session = getOrCreateSession();
    const { deviceType, os, browser, isStandalone } = getBasicDeviceContext();

    // Limpa propriedades undefined e garante que nenhum campo privado seja enviado
    const cleanProps: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(properties)) {
      if (v === undefined) continue;
      // Jamais permitir envio acidental de campos pessoais
      if (['userName', 'diaryContent', 'note', 'email', 'phone', 'ip'].includes(k)) continue;
      if (typeof v === 'string') {
        cleanProps[k] = v.slice(0, 240);
      } else {
        cleanProps[k] = v;
      }
    }

    const sessionDurationSec = Math.max(
      0,
      Math.round((Date.now() - session.startedAt) / 1000)
    );
    cleanProps.session_duration_sec = sessionDurationSec;

    const payload: AnalyticsEventPayload = {
      eventId: `evt_${generateUUID()}`,
      eventName,
      occurredAt: new Date().toISOString(),
      visitorId,
      sessionId: session.sessionId,
      isNewVisitor,
      isStandalone,
      isOfflineAtCapture: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      appVersion: CURRENT_UPDATE.version,
      deviceType,
      os,
      browser,
      utmSource: session.utm.utmSource,
      utmMedium: session.utm.utmMedium,
      utmCampaign: session.utm.utmCampaign,
      utmContent: session.utm.utmContent,
      referrerCategory: session.utm.referrerCategory,
      properties: cleanProps,
    };

    const queue = readEventQueue();
    queue.push(payload);
    writeEventQueue(queue);

    // Se a sessão foi aberta por notificação e o usuário concluiu a leitura, registra conversão
    if (eventName === 'devotional_completed' && sessionOpenedViaNotification) {
      sessionOpenedViaNotification = false;
      const notifConversionPayload: AnalyticsEventPayload = {
        ...payload,
        eventId: `evt_${generateUUID()}`,
        eventName: 'notification_converted_reading',
      };
      const q2 = readEventQueue();
      q2.push(notifConversionPayload);
      writeEventQueue(q2);
    }

    scheduleFlush();
    return true;
  } catch {
    return false;
  }
}

function scheduleFlush(): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsConsentGranted()) return;

  const queue = readEventQueue();
  if (queue.length >= 6) {
    flushEventsNow();
    return;
  }

  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushEventsNow();
    }, FLUSH_INTERVAL_MS);
  }
}

/**
 * Envia imediatamente os eventos da fila para `/api/analytics?action=ingest`.
 * Se o consentimento tiver sido revogado antes do envio, limpa a fila e aborta.
 */
export async function flushEventsNow(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Se o consentimento foi revogado enquanto eventos estavam na fila offline, descarta tudo!
  if (!isAnalyticsConsentGranted()) {
    purgeLocalAnalyticsData();
    return false;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  if (isFlushing) return false;
  const queue = readEventQueue();
  if (queue.length === 0) return true;

  isFlushing = true;
  const batch = queue.slice(0, 40);

  try {
    const res = await fetch('/api/analytics?action=ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });

    if (res.ok) {
      // Remove os eventos enviados com sucesso da fila atual
      const sentIds = new Set(batch.map((e) => e.eventId));
      const remaining = readEventQueue().filter((e) => !sentIds.has(e.eventId));
      writeEventQueue(remaining);
      isFlushing = false;
      if (remaining.length > 0) {
        scheduleFlush();
      }
      return true;
    }
  } catch {
    // Mantém os eventos na fila local para tentativa posterior quando online
  }

  isFlushing = false;
  return false;
}

/**
 * Gera URL de compartilhamento com parâmetros rastreáveis de divulgação (`utm_medium=share`).
 */
export function getTrackableShareUrl(contentType: 'verse' | 'devotional'): string {
  const base = 'https://amanhecer-beta.vercel.app';
  if (!isAnalyticsConsentGranted()) {
    return base;
  }
  return `${base}/?utm_source=app_share&utm_medium=share&utm_campaign=${contentType}_share`;
}

/**
 * Inicializa os listeners globais do SDK (online/offline, erros sanitizados, Web Vitals,
 * abertura via notificação e limpeza imediata em revogação de consentimento).
 */
export function initAnalyticsSDK(): void {
  if (typeof window === 'undefined' || sdkInitialized) return;
  sdkInitialized = true;

  // 1. Reage imediatamente a mudanças de consentimento
  onConsentChange((record) => {
    if (!record.analyticsAllowed || record.status !== 'granted') {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      purgeLocalAnalyticsData();
    } else {
      // Quando o usuário concede consentimento pela primeira vez na sessão, registra abertura inicial
      const { isStandalone } = getBasicDeviceContext();
      trackEvent('app_opened', {
        mode: isStandalone ? 'standalone' : 'browser',
        consent_just_granted: true,
      });
      if (isStandalone) {
        trackEvent('pwa_standalone_opened', { trigger: 'consent_granted' });
      }
      flushEventsNow();
    }
  });

  // 2. Detecta se a abertura veio de clique em notificação do Service Worker
  try {
    const params = new URLSearchParams(window.location.search);
    const swSource = params.get('source');
    if (swSource && swSource.startsWith('sw-')) {
      sessionOpenedViaNotification = true;
      if (isAnalyticsConsentGranted()) {
        trackEvent('notification_opened', {
          notification_type: swSource,
          date: params.get('date') || new Date().toISOString().slice(0, 10),
        });
      }
    }
  } catch {
    // ignore
  }

  // 3. Sincroniza fila offline quando a conexão volta
  window.addEventListener('online', () => {
    if (isAnalyticsConsentGranted()) {
      flushEventsNow();
    }
  });

  // 4. Descarrega eventos pendentes e envia heartbeat de duração ao ocultar aba/app
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isAnalyticsConsentGranted()) {
      trackEvent('session_heartbeat', { state: 'hidden' });
      flushEventsNow();
    }
  });

  // 5. Monitoramento Técnico: Erros JavaScript sanitizados (apenas com consentimento)
  window.addEventListener('error', (event) => {
    if (!isAnalyticsConsentGranted()) return;
    const msg = sanitizeErrorMessage(event.message || 'runtime_error');
    trackEvent('technical_error', {
      error_type: 'js_error',
      message: msg,
      filename: event.filename ? event.filename.split('/').pop() || 'unknown' : 'unknown',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (!isAnalyticsConsentGranted()) return;
    const raw =
      typeof event.reason === 'string'
        ? event.reason
        : event.reason?.message || 'unhandled_promise_rejection';
    trackEvent('technical_error', {
      error_type: 'promise_rejection',
      message: sanitizeErrorMessage(raw),
    });
  });

  // 6. Coleta de Web Vitals / Tempo de Carregamento (após carregamento inicial, se autorizado)
  setTimeout(() => {
    if (!isAnalyticsConsentGranted()) return;
    try {
      const navEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];
        const loadTimeMs = Math.round(nav.loadEventEnd - nav.startTime);
        const ttfbMs = Math.round(nav.responseStart - nav.requestStart);
        const domInteractiveMs = Math.round(nav.domInteractive - nav.startTime);
        if (loadTimeMs > 0 && loadTimeMs < 60000) {
          trackEvent('web_vital_measured', {
            vital_name: 'PAGE_LOAD',
            value_ms: loadTimeMs,
            ttfb_ms: Math.max(0, ttfbMs),
            dom_interactive_ms: Math.max(0, domInteractiveMs),
          });
        }
      }

      const paintEntries = performance.getEntriesByType?.('paint') || [];
      for (const p of paintEntries) {
        if (p.name === 'first-contentful-paint' && p.startTime > 0) {
          trackEvent('web_vital_measured', {
            vital_name: 'FCP',
            value_ms: Math.round(p.startTime),
          });
        }
      }
    } catch {
      // ignore performance API limitations
    }
  }, 2500);
}
