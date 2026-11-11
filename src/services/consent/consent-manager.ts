/**
 * Gestor Central de Consentimento e Privacidade (LGPD — Lei nº 13.709/2018)
 * Implementa Privacy by Design e Privacy by Default.
 *
 * Regra técnica prioritária:
 * Nenhum evento de analytics opcional pode ser coletado, armazenado, transmitido
 * ou colocado em fila antes do consentimento válido e explícito do titular.
 */

export type ConsentStatus =
  | 'undecided'
  | 'granted'
  | 'refused'
  | 'revoked'
  | 'needs_redecision';

export type ConsentOrigin = 'landing' | 'pwa' | 'settings' | 'banner';

export interface ConsentRecord {
  status: ConsentStatus;
  termsAccepted: boolean;
  analyticsAllowed: boolean;
  policyVersion: string;
  decidedAt: string | null;
  origin: ConsentOrigin;
}

export const CURRENT_POLICY_VERSION = '2.3.0';
export const CONSENT_STORAGE_KEY = 'amanhecer_privacy_consent_v1';

// Chaves de armazenamento opcional de analytics (limpas imediatamente em caso de recusa ou revogação)
export const ANALYTICS_STORAGE_KEYS = [
  'amanhecer_analytics_visitor_id',
  'amanhecer_analytics_session_v1',
  'amanhecer_analytics_queue_v1',
  'amanhecer_analytics_utm_v1',
  'amanhecer_analytics_first_seen_v1',
  'amanhecer_analytics_active_days_v1',
] as const;

const DEFAULT_CONSENT: ConsentRecord = {
  status: 'undecided',
  termsAccepted: false,
  analyticsAllowed: false,
  policyVersion: CURRENT_POLICY_VERSION,
  decidedAt: null,
  origin: 'banner',
};

type ConsentListener = (record: ConsentRecord) => void;
const listeners = new Set<ConsentListener>();

/**
 * Carrega o estado atual de consentimento do dispositivo.
 * Se a política teve alteração material de finalidade (versão diferente),
 * retorna o estado 'needs_redecision' e desativa a coleta opcional até nova decisão.
 */
export function getConsentRecord(): ConsentRecord {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CONSENT };
  }

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CONSENT };
    }

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_CONSENT };
    }

    // Verifica se houve mudança material na versão da política
    if (parsed.policyVersion !== CURRENT_POLICY_VERSION) {
      return {
        status: 'needs_redecision',
        termsAccepted: Boolean(parsed.termsAccepted),
        analyticsAllowed: false, // Bloqueado por padrão até nova decisão
        policyVersion: CURRENT_POLICY_VERSION,
        decidedAt: parsed.decidedAt || null,
        origin: parsed.origin || 'banner',
      };
    }

    const validStatuses: ConsentStatus[] = [
      'undecided',
      'granted',
      'refused',
      'revoked',
      'needs_redecision',
    ];
    const status: ConsentStatus = validStatuses.includes(parsed.status as ConsentStatus)
      ? (parsed.status as ConsentStatus)
      : 'undecided';

    const analyticsAllowed = status === 'granted' && parsed.analyticsAllowed === true;

    return {
      status,
      termsAccepted: Boolean(parsed.termsAccepted),
      analyticsAllowed,
      policyVersion: parsed.policyVersion || CURRENT_POLICY_VERSION,
      decidedAt: parsed.decidedAt || null,
      origin: parsed.origin || 'banner',
    };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

/**
 * Verifica estritamente se a coleta de analytics opcionais está autorizada neste exato momento.
 */
export function isAnalyticsConsentGranted(): boolean {
  const record = getConsentRecord();
  return (
    record.status === 'granted' &&
    record.analyticsAllowed === true &&
    record.policyVersion === CURRENT_POLICY_VERSION
  );
}

/**
 * Verifica se o banner inicial de privacidade precisa ser exibido ao usuário.
 */
export function shouldShowConsentBanner(): boolean {
  const record = getConsentRecord();
  return record.status === 'undecided' || record.status === 'needs_redecision';
}

/**
 * Limpa imediatamente todos os identificadores, sessões e filas locais de analytics.
 */
export function purgeLocalAnalyticsData(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of ANALYTICS_STORAGE_KEYS) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignora erros de acesso ao storage
  }
}

function notifyListeners(record: ConsentRecord): void {
  for (const listener of listeners) {
    try {
      listener(record);
    } catch {
      // ignora erro em listener individual
    }
  }
}

/**
 * Registra o consentimento para analytics opcionais.
 */
export function grantAnalyticsConsent(
  origin: ConsentOrigin = 'banner',
  termsAccepted = true
): ConsentRecord {
  const record: ConsentRecord = {
    status: 'granted',
    termsAccepted,
    analyticsAllowed: true,
    policyVersion: CURRENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    origin,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }
    // Registra proporcionalmente o comprovante de consentimento no servidor (sem IP completo)
    sendProportionalConsentAudit(record).catch(() => {});
  }

  notifyListeners(record);
  return record;
}

/**
 * Registra a recusa de analytics opcionais (sem qualquer prejuízo ao uso do aplicativo).
 * Limpa preventivamente qualquer dado analítico local e NÃO envia eventos de analytics.
 */
export function refuseAnalyticsConsent(
  origin: ConsentOrigin = 'banner',
  termsAccepted = true
): ConsentRecord {
  purgeLocalAnalyticsData();

  const record: ConsentRecord = {
    status: 'refused',
    termsAccepted,
    analyticsAllowed: false,
    policyVersion: CURRENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    origin,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }
  }

  notifyListeners(record);
  return record;
}

/**
 * Revoga o consentimento anteriormente concedido.
 * Interrompe imediatamente a coleta futura e limpa identificadores e filas locais.
 */
export function revokeAnalyticsConsent(origin: ConsentOrigin = 'settings'): ConsentRecord {
  purgeLocalAnalyticsData();

  const current = getConsentRecord();
  const record: ConsentRecord = {
    status: 'revoked',
    termsAccepted: current.termsAccepted,
    analyticsAllowed: false,
    policyVersion: CURRENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    origin,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }
  }

  notifyListeners(record);
  return record;
}

/**
 * Solicita a eliminação dos dados pseudônimos anteriores associados ao identificador local
 * antes de revogar e apagar todos os registros locais (Art. 18, VI da LGPD).
 */
export async function requestAnalyticsDataDeletion(): Promise<{
  success: boolean;
  deletedEvents: number;
  message: string;
}> {
  let visitorId: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      visitorId = localStorage.getItem('amanhecer_analytics_visitor_id');
    } catch {
      visitorId = null;
    }
  }

  // Revoga imediatamente e limpa todo o storage local
  revokeAnalyticsConsent('settings');

  if (!visitorId) {
    return {
      success: true,
      deletedEvents: 0,
      message:
        'Preferência revogada e armazenamento local limpo. Nenhum identificador analítico ativo estava vinculado a este dispositivo.',
    };
  }

  try {
    const res = await fetch('/api/analytics?action=delete-my-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        deletedEvents: data.deletedEvents || 0,
        message:
          data.message ||
          'Os registros individuais pseudônimos vinculados ao seu dispositivo foram eliminados. Estatísticas históricas já agregadas de forma irreversível e anônima permanecem apenas como contagens globais.',
      };
    }
  } catch {
    // Offline ou falha de rede
  }

  return {
    success: true,
    deletedEvents: 0,
    message:
      'Consentimento revogado e identificadores locais removidos imediatamente deste aparelho.',
  };
}

/**
 * Inscreve um listener para reagir a mudanças de consentimento em tempo real.
 */
export function onConsentChange(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function sendProportionalConsentAudit(record: ConsentRecord): Promise<void> {
  try {
    await fetch('/api/analytics?action=consent-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: 'optional_product_analytics',
        policyVersion: record.policyVersion,
        decidedAt: record.decidedAt,
        origin: record.origin,
        status: record.status,
      }),
    });
  } catch {
    // Falha silenciosa se offline
  }
}
