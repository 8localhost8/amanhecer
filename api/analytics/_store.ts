import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { put, list } from '@vercel/blob';

export interface StoredAnalyticsEvent {
  eventId: string;
  eventName: string;
  occurredAt: string; // Horário original no cliente (preservado em sincronização offline)
  receivedAt: string; // Horário de recebimento no servidor
  dateStr: string;    // YYYY-MM-DD em America/Sao_Paulo
  hourOfDay: number;  // 0-23 em America/Sao_Paulo
  dayOfWeek: number;  // 0 (Dom) - 6 (Sáb) em America/Sao_Paulo
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  isStandalone: boolean;
  isOfflineAtCapture: boolean;
  appVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrerCategory: string;
  properties: Record<string, string | number | boolean | null>;
}

export interface StoredSessionRecord {
  sessionId: string;
  visitorId: string;
  dateStr: string;
  startedAt: string;
  lastActivityAt: string;
  durationSec: number;
  pageviews: number;
  eventsCount: number;
  engaged: boolean;
  isStandalone: boolean;
  deviceType: string;
  os: string;
  browser: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrerCategory: string;
  openedDevotional: boolean;
  completedReading: boolean;
  sharedContent: boolean;
  clickedInstall: boolean;
}

export interface StoredVisitorSummary {
  visitorId: string;
  firstSeenDate: string; // YYYY-MM-DD
  lastSeenDate: string;  // YYYY-MM-DD
  firstSeenDayOfWeek: number; // 0-6
  activeDates: string[]; // Lista ordenada de YYYY-MM-DD
  acquisitionSource: string;
  acquisitionMedium: string;
  acquisitionCampaign: string;
  deviceType: string;
  os: string;
  browser: string;
  everStandalone: boolean;
  everDetectedInstall: boolean;
  totalSessions: number;
  totalReadingsOpened: number;
  totalReadingsCompleted: number;
  totalShares: number;
}

export interface DailyAggregateRecord {
  date: string; // YYYY-MM-DD
  pageviews: number;
  landingViews: number;
  appOpens: number;
  pwaStandaloneOpens: number;
  installClicks: number;
  installTutorialsOpened: number;
  installsDetected: number;
  devotionalsOpened: number;
  readingsStarted: number;
  readingsCompleted: number;
  readingRepeatConfirmations: number;
  readingDurationTotalSec: number;
  readingDurationCount: number;
  versesViewed: number;
  versesClicked: number;
  verseImagesGenerated: number;
  verseImagesDownloaded: number;
  verseTextCopied: number;
  sharesInitiated: number;
  sharesCompleted: number;
  verseSharesCompleted: number;
  devotionalSharesCompleted: number;
  notifPermissionGranted: number;
  notifPermissionDenied: number;
  notifScheduled: number;
  notifOpened: number;
  notifConvertedReading: number;
  notifDisabled: number;
  errorsCount: number;
  byHourReadings: number[]; // 24 posições (0..23)
  byHourOpens: number[];    // 24 posições (0..23)
}

export interface SavedCampaignLink {
  id: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  fullUrl: string;
  createdAt: string;
}

export interface TechnicalHealthRecord {
  id: string;
  timestamp: string;
  dateStr: string;
  kind: 'error' | 'vital';
  errorType?: string;
  message?: string;
  vitalName?: string;
  vitalValueMs?: number;
  ttfbMs?: number;
  domInteractiveMs?: number;
  appVersion: string;
  deviceType: string;
  os: string;
  browser: string;
  isStandalone: boolean;
}

export interface ConsentAuditEntry {
  id: string;
  timestamp: string;
  purpose: string;
  policyVersion: string;
  status: string;
  origin: string;
  hmacSignature: string;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'failure' | 'blocked';
  ipHash: string;
  note?: string;
}

export interface AnalyticsAdminSettings {
  retentionDays: number;
  policyVersion: string;
  updatedAt: string;
}

export interface AnalyticsDatabase {
  schemaVersion: number;
  updatedAt: string;
  dedupEventIds: string[];
  events: StoredAnalyticsEvent[];
  sessions: Record<string, StoredSessionRecord>;
  visitors: Record<string, StoredVisitorSummary>;
  dailyAggregates: Record<string, DailyAggregateRecord>;
  campaigns: SavedCampaignLink[];
  technicalRecords: TechnicalHealthRecord[];
  consentAudit: ConsentAuditEntry[];
  securityAudit: SecurityAuditEntry[];
  settings: AnalyticsAdminSettings;
}

const BLOB_PATHNAME = 'amanhecer/analytics-store-v1.enc.json';
const REDIS_KEY = 'amanhecer:analytics:db:v1';

const MAX_RAW_EVENTS = 4500;
const MAX_DEDUP_IDS = 6000;
const MAX_TECH_RECORDS = 600;
const MAX_AUDIT_RECORDS = 400;

export function createEmptyDatabase(): AnalyticsDatabase {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    dedupEventIds: [],
    events: [],
    sessions: {},
    visitors: {},
    dailyAggregates: {},
    campaigns: [
      {
        id: 'camp_default_ig',
        name: 'Instagram Bio Oficial',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'perfil_bio',
        fullUrl:
          'https://amanhecer-beta.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=perfil_bio',
        createdAt: '2026-11-01T09:00:00.000Z',
      },
      {
        id: 'camp_default_wa',
        name: 'Compartilhamento no WhatsApp',
        utmSource: 'whatsapp',
        utmMedium: 'mensagem',
        utmCampaign: 'grupos_igreja',
        fullUrl:
          'https://amanhecer-beta.vercel.app/?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=grupos_igreja',
        createdAt: '2026-11-01T09:00:00.000Z',
      },
    ],
    technicalRecords: [],
    consentAudit: [],
    securityAudit: [],
    settings: {
      retentionDays: 90,
      policyVersion: '2.3.0',
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createEmptyDailyAggregate(date: string): DailyAggregateRecord {
  return {
    date,
    pageviews: 0,
    landingViews: 0,
    appOpens: 0,
    pwaStandaloneOpens: 0,
    installClicks: 0,
    installTutorialsOpened: 0,
    installsDetected: 0,
    devotionalsOpened: 0,
    readingsStarted: 0,
    readingsCompleted: 0,
    readingRepeatConfirmations: 0,
    readingDurationTotalSec: 0,
    readingDurationCount: 0,
    versesViewed: 0,
    versesClicked: 0,
    verseImagesGenerated: 0,
    verseImagesDownloaded: 0,
    verseTextCopied: 0,
    sharesInitiated: 0,
    sharesCompleted: 0,
    verseSharesCompleted: 0,
    devotionalSharesCompleted: 0,
    notifPermissionGranted: 0,
    notifPermissionDenied: 0,
    notifScheduled: 0,
    notifOpened: 0,
    notifConvertedReading: 0,
    notifDisabled: 0,
    errorsCount: 0,
    byHourReadings: new Array(24).fill(0),
    byHourOpens: new Array(24).fill(0),
  };
}

// ---------- Criptografia em Repouso (AES-256-GCM) ----------
function getEncryptionKey(): Buffer {
  const secret =
    process.env.ANALYTICS_ADMIN_SECRET ||
    process.env.CRON_SECRET ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    'amanhecer-local-dev-fallback-secret-key-2026';
  return crypto.scryptSync(secret, 'amanhecer-analytics-salt-v1', 32);
}

export function encryptPayload(plainJson: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainJson, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    enc: 'AES-256-GCM',
    v: 1,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

export function decryptPayload(rawContent: string): AnalyticsDatabase {
  const parsed = JSON.parse(rawContent);
  if (parsed && parsed.enc === 'AES-256-GCM' && parsed.iv && parsed.tag && parsed.data) {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(parsed.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(parsed.data, 'base64')),
      decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  }
  return parsed as AnalyticsDatabase;
}

export function signAuditRecord(payload: string): string {
  const key = getEncryptionKey();
  return crypto.createHmac('sha256', key).update(payload).digest('hex');
}

// ---------- Utilitário de Fuso Horário (America/Sao_Paulo) ----------
export function toSaoPauloTimeInfo(isoString: string): {
  dateStr: string;
  hourOfDay: number;
  dayOfWeek: number;
} {
  let d = new Date(isoString);
  if (isNaN(d.getTime())) {
    d = new Date();
  }
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const hourOfDay = Math.min(23, Math.max(0, parseInt(map.hour || '0', 10) % 24));
  const wkMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = wkMap[map.weekday || 'Sun'] ?? d.getUTCDay();
  return { dateStr, hourOfDay, dayOfWeek };
}

// ---------- Camada de Armazenamento Persistente ----------
function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ''), token };
  return null;
}

export function getAnalyticsStorageBackendName(): 'vercel-blob-encrypted' | 'upstash-redis' | 'local-file' {
  if (hasBlobStorage()) return 'vercel-blob-encrypted';
  if (redisConfig()) return 'upstash-redis';
  return 'local-file';
}

function resolveLocalFilePath(): string {
  if (process.env.ANALYTICS_STORAGE_PATH) return process.env.ANALYTICS_STORAGE_PATH;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'amanhecer-analytics-db.json');
  }
  return path.join(process.cwd(), 'api', 'analytics', '.analytics-db.json');
}

let memoryCache: { db: AnalyticsDatabase; loadedAt: number } | null = null;
const CACHE_TTL_MS = 4000;

export function resetAnalyticsMemoryCache(): void {
  memoryCache = null;
}

export async function loadAnalyticsDB(forceFresh = false): Promise<AnalyticsDatabase> {
  if (!forceFresh && memoryCache && Date.now() - memoryCache.loadedAt < CACHE_TTL_MS) {
    return memoryCache.db;
  }

  // 1. Vercel Blob (Criptografado com AES-256-GCM)
  if (hasBlobStorage()) {
    try {
      const { blobs } = await list({ prefix: BLOB_PATHNAME });
      const target = blobs.find((b) => b.pathname === BLOB_PATHNAME);
      if (target) {
        const res = await fetch(target.url, { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const db = normalizeDB(decryptPayload(text));
          memoryCache = { db, loadedAt: Date.now() };
          return db;
        }
      }
    } catch (err) {
      console.error('Erro ao ler banco de analytics no Vercel Blob:', err);
    }
  }

  // 2. Upstash Redis
  const rCfg = redisConfig();
  if (rCfg) {
    try {
      const res = await fetch(rCfg.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rCfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['GET', REDIS_KEY]),
      });
      if (res.ok) {
        const json: any = await res.json();
        if (json?.result) {
          const db = normalizeDB(decryptPayload(json.result));
          memoryCache = { db, loadedAt: Date.now() };
          return db;
        }
      }
    } catch (err) {
      console.error('Erro ao ler banco de analytics no Redis:', err);
    }
  }

  // 3. Arquivo local (desenvolvimento / testes)
  const file = resolveLocalFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const db = normalizeDB(decryptPayload(raw));
      memoryCache = { db, loadedAt: Date.now() };
      return db;
    }
  } catch {
    // ignore
  }

  const empty = createEmptyDatabase();
  memoryCache = { db: empty, loadedAt: Date.now() };
  return empty;
}

export async function saveAnalyticsDB(db: AnalyticsDatabase): Promise<void> {
  db.updatedAt = new Date().toISOString();
  applyRetentionAndCaps(db);
  memoryCache = { db, loadedAt: Date.now() };

  const encrypted = encryptPayload(JSON.stringify(db));

  if (hasBlobStorage()) {
    try {
      await put(BLOB_PATHNAME, encrypted, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return;
    } catch (err) {
      console.error('Erro ao gravar banco de analytics no Vercel Blob:', err);
    }
  }

  const rCfg = redisConfig();
  if (rCfg) {
    try {
      await fetch(rCfg.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${rCfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['SET', REDIS_KEY, encrypted]),
      });
      return;
    } catch (err) {
      console.error('Erro ao gravar banco de analytics no Redis:', err);
    }
  }

  const file = resolveLocalFilePath();
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, encrypted, 'utf-8');
  } catch {
    try {
      fs.writeFileSync(
        path.join(os.tmpdir(), 'amanhecer-analytics-db.json'),
        encrypted,
        'utf-8'
      );
    } catch {
      // ignore
    }
  }
}

function normalizeDB(raw: Partial<AnalyticsDatabase> | null | undefined): AnalyticsDatabase {
  const base = createEmptyDatabase();
  if (!raw || typeof raw !== 'object') return base;
  return {
    schemaVersion: raw.schemaVersion || 1,
    updatedAt: raw.updatedAt || base.updatedAt,
    dedupEventIds: Array.isArray(raw.dedupEventIds) ? raw.dedupEventIds : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    sessions: raw.sessions && typeof raw.sessions === 'object' ? raw.sessions : {},
    visitors: raw.visitors && typeof raw.visitors === 'object' ? raw.visitors : {},
    dailyAggregates:
      raw.dailyAggregates && typeof raw.dailyAggregates === 'object'
        ? raw.dailyAggregates
        : {},
    campaigns: Array.isArray(raw.campaigns) && raw.campaigns.length > 0 ? raw.campaigns : base.campaigns,
    technicalRecords: Array.isArray(raw.technicalRecords) ? raw.technicalRecords : [],
    consentAudit: Array.isArray(raw.consentAudit) ? raw.consentAudit : [],
    securityAudit: Array.isArray(raw.securityAudit) ? raw.securityAudit : [],
    settings: raw.settings ? { ...base.settings, ...raw.settings } : base.settings,
  };
}

/**
 * Aplica a política de retenção de dados (LGPD) e limites de memória.
 */
export function applyRetentionAndCaps(db: AnalyticsDatabase): number {
  const retentionDays = Math.max(7, Math.min(365, db.settings?.retentionDays || 90));
  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const cutoffDateStr = new Date(cutoffMs).toISOString().slice(0, 10);

  const initialEventsCount = db.events.length;

  // Remove eventos brutos anteriores ao período de retenção
  db.events = db.events
    .filter((e) => e.dateStr >= cutoffDateStr)
    .slice(-MAX_RAW_EVENTS);

  const purgedCount = Math.max(0, initialEventsCount - db.events.length);

  // Remove sessões antigas fora da janela de retenção
  for (const [sid, sess] of Object.entries(db.sessions)) {
    if (sess.dateStr < cutoffDateStr) {
      delete db.sessions[sid];
    }
  }

  // Remove visitantes inativos há mais tempo que a retenção
  for (const [vid, vis] of Object.entries(db.visitors)) {
    if (vis.lastSeenDate < cutoffDateStr) {
      delete db.visitors[vid];
    }
  }

  db.dedupEventIds = db.dedupEventIds.slice(-MAX_DEDUP_IDS);
  db.technicalRecords = db.technicalRecords
    .filter((t) => t.dateStr >= cutoffDateStr)
    .slice(-MAX_TECH_RECORDS);
  db.consentAudit = db.consentAudit.slice(-MAX_AUDIT_RECORDS);
  db.securityAudit = db.securityAudit.slice(-MAX_AUDIT_RECORDS);

  return purgedCount;
}

/**
 * Processa, deduplica e agrega um lote de eventos no banco de dados.
 */
export async function ingestAnalyticsEvents(
  incomingEvents: Array<{
    eventId: string;
    eventName: string;
    occurredAt: string;
    visitorId: string;
    sessionId: string;
    isNewVisitor?: boolean;
    isStandalone?: boolean;
    isOfflineAtCapture?: boolean;
    appVersion?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    referrerCategory?: string;
    properties?: Record<string, any>;
  }>
): Promise<{ accepted: number; deduplicated: number }> {
  const db = await loadAnalyticsDB();
  const dedupSet = new Set(db.dedupEventIds);
  const receivedAt = new Date().toISOString();

  let accepted = 0;
  let deduplicated = 0;

  for (const raw of incomingEvents) {
    if (!raw.eventId || !raw.eventName || !raw.visitorId || !raw.sessionId) {
      continue;
    }

    // Deduplicação estrita por eventId
    if (dedupSet.has(raw.eventId)) {
      deduplicated++;
      continue;
    }
    dedupSet.add(raw.eventId);
    db.dedupEventIds.push(raw.eventId);

    const { dateStr, hourOfDay, dayOfWeek } = toSaoPauloTimeInfo(
      raw.occurredAt || receivedAt
    );

    const cleanProps: Record<string, string | number | boolean | null> = {};
    if (raw.properties && typeof raw.properties === 'object') {
      for (const [k, v] of Object.entries(raw.properties)) {
        // Proteção estrita de privacidade (LGPD): jamais persistir campos pessoais
        if (['userName', 'diaryContent', 'note', 'email', 'phone', 'ip'].includes(k)) {
          continue;
        }
        if (
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean' ||
          v === null
        ) {
          cleanProps[k] = typeof v === 'string' ? v.slice(0, 240) : v;
        }
      }
    }

    const eventRecord: StoredAnalyticsEvent = {
      eventId: String(raw.eventId).slice(0, 80),
      eventName: String(raw.eventName).slice(0, 64),
      occurredAt: raw.occurredAt || receivedAt,
      receivedAt,
      dateStr,
      hourOfDay,
      dayOfWeek,
      visitorId: String(raw.visitorId).slice(0, 80),
      sessionId: String(raw.sessionId).slice(0, 80),
      isNewVisitor: Boolean(raw.isNewVisitor),
      isStandalone: Boolean(raw.isStandalone),
      isOfflineAtCapture: Boolean(raw.isOfflineAtCapture),
      appVersion: String(raw.appVersion || '2.2.1').slice(0, 24),
      deviceType:
        raw.deviceType === 'mobile' || raw.deviceType === 'tablet'
          ? raw.deviceType
          : 'desktop',
      os: String(raw.os || 'Outro').slice(0, 32),
      browser: String(raw.browser || 'Outro').slice(0, 32),
      utmSource: raw.utmSource ? String(raw.utmSource).slice(0, 64) : null,
      utmMedium: raw.utmMedium ? String(raw.utmMedium).slice(0, 64) : null,
      utmCampaign: raw.utmCampaign ? String(raw.utmCampaign).slice(0, 64) : null,
      utmContent: raw.utmContent ? String(raw.utmContent).slice(0, 64) : null,
      referrerCategory: String(raw.referrerCategory || 'direct').slice(0, 64),
      properties: cleanProps,
    };

    // Eventos técnicos (erros e Web Vitals) vão para a coleção técnica
    if (
      eventRecord.eventName === 'technical_error' ||
      eventRecord.eventName === 'web_vital_measured'
    ) {
      db.technicalRecords.push({
        id: eventRecord.eventId,
        timestamp: eventRecord.occurredAt,
        dateStr: eventRecord.dateStr,
        kind: eventRecord.eventName === 'technical_error' ? 'error' : 'vital',
        errorType: String(cleanProps.error_type || 'js_error'),
        message: cleanProps.message ? String(cleanProps.message) : undefined,
        vitalName: cleanProps.vital_name ? String(cleanProps.vital_name) : undefined,
        vitalValueMs:
          typeof cleanProps.value_ms === 'number' ? cleanProps.value_ms : undefined,
        ttfbMs: typeof cleanProps.ttfb_ms === 'number' ? cleanProps.ttfb_ms : undefined,
        domInteractiveMs:
          typeof cleanProps.dom_interactive_ms === 'number'
            ? cleanProps.dom_interactive_ms
            : undefined,
        appVersion: eventRecord.appVersion,
        deviceType: eventRecord.deviceType,
        os: eventRecord.os,
        browser: eventRecord.browser,
        isStandalone: eventRecord.isStandalone,
      });
    } else {
      db.events.push(eventRecord);
    }

    // 1. Atualiza Agregação Diária
    if (!db.dailyAggregates[dateStr]) {
      db.dailyAggregates[dateStr] = createEmptyDailyAggregate(dateStr);
    }
    const dayAgg = db.dailyAggregates[dateStr];

    // 2. Atualiza Visitante Pseudônimo
    let visitor = db.visitors[eventRecord.visitorId];
    if (!visitor) {
      visitor = {
        visitorId: eventRecord.visitorId,
        firstSeenDate: dateStr,
        lastSeenDate: dateStr,
        firstSeenDayOfWeek: dayOfWeek,
        activeDates: [dateStr],
        acquisitionSource:
          eventRecord.utmSource || eventRecord.referrerCategory || 'direct',
        acquisitionMedium: eventRecord.utmMedium || 'none',
        acquisitionCampaign: eventRecord.utmCampaign || 'none',
        deviceType: eventRecord.deviceType,
        os: eventRecord.os,
        browser: eventRecord.browser,
        everStandalone: eventRecord.isStandalone,
        everDetectedInstall: false,
        totalSessions: 0,
        totalReadingsOpened: 0,
        totalReadingsCompleted: 0,
        totalShares: 0,
      };
      db.visitors[eventRecord.visitorId] = visitor;
    } else {
      if (dateStr < visitor.firstSeenDate) {
        visitor.firstSeenDate = dateStr;
        visitor.firstSeenDayOfWeek = dayOfWeek;
      }
      if (dateStr > visitor.lastSeenDate) {
        visitor.lastSeenDate = dateStr;
      }
      if (!visitor.activeDates.includes(dateStr)) {
        visitor.activeDates.push(dateStr);
        visitor.activeDates.sort();
      }
      if (eventRecord.isStandalone) {
        visitor.everStandalone = true;
      }
    }

    // 3. Atualiza Sessão
    let session = db.sessions[eventRecord.sessionId];
    if (!session) {
      session = {
        sessionId: eventRecord.sessionId,
        visitorId: eventRecord.visitorId,
        dateStr,
        startedAt: eventRecord.occurredAt,
        lastActivityAt: eventRecord.occurredAt,
        durationSec: Number(cleanProps.session_duration_sec || 0),
        pageviews: 0,
        eventsCount: 0,
        engaged: false,
        isStandalone: eventRecord.isStandalone,
        deviceType: eventRecord.deviceType,
        os: eventRecord.os,
        browser: eventRecord.browser,
        utmSource: eventRecord.utmSource,
        utmMedium: eventRecord.utmMedium,
        utmCampaign: eventRecord.utmCampaign,
        referrerCategory: eventRecord.referrerCategory,
        openedDevotional: false,
        completedReading: false,
        sharedContent: false,
        clickedInstall: false,
      };
      db.sessions[eventRecord.sessionId] = session;
      visitor.totalSessions += 1;
    } else {
      session.lastActivityAt = eventRecord.occurredAt;
      const reportedDur = Number(cleanProps.session_duration_sec || 0);
      const calcDur = Math.max(
        0,
        Math.round(
          (new Date(eventRecord.occurredAt).getTime() -
            new Date(session.startedAt).getTime()) /
            1000
        )
      );
      session.durationSec = Math.max(session.durationSec, reportedDur, calcDur);
      if (eventRecord.isStandalone) session.isStandalone = true;
    }
    session.eventsCount += 1;
    if (session.durationSec >= 10 || session.pageviews >= 2) {
      session.engaged = true;
    }

    // 4. Contadores específicos por tipo de evento
    switch (eventRecord.eventName) {
      case 'landing_viewed':
        dayAgg.landingViews += 1;
        dayAgg.pageviews += 1;
        session.pageviews += 1;
        break;
      case 'page_viewed':
        dayAgg.pageviews += 1;
        session.pageviews += 1;
        break;
      case 'app_opened':
        dayAgg.appOpens += 1;
        dayAgg.byHourOpens[hourOfDay] = (dayAgg.byHourOpens[hourOfDay] || 0) + 1;
        if (eventRecord.isStandalone) {
          dayAgg.pwaStandaloneOpens += 1;
        }
        break;
      case 'pwa_standalone_opened':
        dayAgg.pwaStandaloneOpens += 1;
        break;
      case 'landing_cta_clicked':
        if (cleanProps.cta === 'install') {
          dayAgg.installClicks += 1;
          session.clickedInstall = true;
          session.engaged = true;
        }
        break;
      case 'install_prompt_triggered':
        dayAgg.installClicks += 1;
        session.clickedInstall = true;
        session.engaged = true;
        break;
      case 'install_tutorial_opened':
        dayAgg.installTutorialsOpened += 1;
        session.engaged = true;
        break;
      case 'pwa_appinstalled_detected':
        dayAgg.installsDetected += 1;
        visitor.everDetectedInstall = true;
        session.engaged = true;
        break;
      case 'devotional_opened':
        dayAgg.devotionalsOpened += 1;
        visitor.totalReadingsOpened += 1;
        session.openedDevotional = true;
        session.engaged = true;
        break;
      case 'reading_started':
        dayAgg.readingsStarted += 1;
        session.openedDevotional = true;
        session.engaged = true;
        break;
      case 'devotional_completed': {
        dayAgg.readingsCompleted += 1;
        dayAgg.byHourReadings[hourOfDay] = (dayAgg.byHourReadings[hourOfDay] || 0) + 1;
        visitor.totalReadingsCompleted += 1;
        session.completedReading = true;
        session.engaged = true;
        if (cleanProps.is_repeat_confirmation === true) {
          dayAgg.readingRepeatConfirmations += 1;
        }
        const readDur = Number(cleanProps.reading_duration_sec || 0);
        if (readDur > 0 && readDur < 7200) {
          dayAgg.readingDurationTotalSec += readDur;
          dayAgg.readingDurationCount += 1;
        }
        break;
      }
      case 'verse_viewed':
        dayAgg.versesViewed += 1;
        break;
      case 'verse_clicked':
        dayAgg.versesClicked += 1;
        session.engaged = true;
        break;
      case 'verse_image_generated':
        dayAgg.verseImagesGenerated += 1;
        session.engaged = true;
        break;
      case 'verse_image_downloaded':
        dayAgg.verseImagesDownloaded += 1;
        session.engaged = true;
        break;
      case 'verse_text_copied':
        dayAgg.verseTextCopied += 1;
        session.engaged = true;
        break;
      case 'share_initiated':
        dayAgg.sharesInitiated += 1;
        session.sharedContent = true;
        session.engaged = true;
        break;
      case 'share_completed':
        dayAgg.sharesCompleted += 1;
        visitor.totalShares += 1;
        session.sharedContent = true;
        session.engaged = true;
        if (cleanProps.content_type === 'devotional') {
          dayAgg.devotionalSharesCompleted += 1;
        } else {
          dayAgg.verseSharesCompleted += 1;
        }
        break;
      case 'notification_permission_granted':
        dayAgg.notifPermissionGranted += 1;
        break;
      case 'notification_permission_denied':
        dayAgg.notifPermissionDenied += 1;
        break;
      case 'notification_scheduled':
        dayAgg.notifScheduled += 1;
        break;
      case 'notification_opened':
        dayAgg.notifOpened += 1;
        break;
      case 'notification_converted_reading':
        dayAgg.notifConvertedReading += 1;
        break;
      case 'notification_disabled':
        dayAgg.notifDisabled += 1;
        break;
      case 'technical_error':
        dayAgg.errorsCount += 1;
        break;
    }

    accepted++;
  }

  if (accepted > 0) {
    await saveAnalyticsDB(db);
  }

  return { accepted, deduplicated };
}

/**
 * Elimina os registros pseudônimos vinculados a um `visitorId` (Art. 18 da LGPD).
 */
export async function deleteVisitorAnalyticsData(visitorId: string): Promise<number> {
  if (!visitorId) return 0;
  const db = await loadAnalyticsDB(true);
  const before = db.events.length;
  db.events = db.events.filter((e) => e.visitorId !== visitorId);
  const deletedEvents = before - db.events.length;

  delete db.visitors[visitorId];
  for (const [sid, sess] of Object.entries(db.sessions)) {
    if (sess.visitorId === visitorId) {
      delete db.sessions[sid];
    }
  }

  await saveAnalyticsDB(db);
  return deletedEvents;
}
