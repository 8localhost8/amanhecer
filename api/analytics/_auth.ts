import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const SESSION_COOKIE_NAME = 'amanhecer_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const loginRateMap = new Map<string, RateLimitBucket>();
const ingestRateMap = new Map<string, RateLimitBucket>();

function getSigningSecret(): string {
  return (
    process.env.ANALYTICS_ADMIN_SECRET ||
    process.env.CRON_SECRET ||
    process.env.NOTIFICATIONS_API_KEY ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    ''
  );
}

/**
 * Gera um hash pseudônimo diário do endereço de rede para rate limiting e auditoria
 * de segurança, garantindo que o IP completo NUNCA seja armazenado (Seção 13 & 29).
 */
export function getSaltedNetworkHash(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()) ||
    req.socket?.remoteAddress ||
    'unknown';
  const daySalt = new Date().toISOString().slice(0, 10);
  const secret = getSigningSecret() || 'amanhecer-salt';
  return crypto
    .createHmac('sha256', `${secret}:${daySalt}`)
    .update(rawIp)
    .digest('hex')
    .slice(0, 16);
}

export function checkLoginRateLimit(ipHash: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = loginRateMap.get(ipHash);
  if (!bucket || now > bucket.resetAt) {
    loginRateMap.set(ipHash, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count >= 6) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function checkIngestRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const bucket = ingestRateMap.get(ipHash);
  if (!bucket || now > bucket.resetAt) {
    ingestRateMap.set(ipHash, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (bucket.count >= 90) {
    return false;
  }
  bucket.count += 1;
  return true;
}

/**
 * Valida a credencial administrativa no servidor usando comparação em tempo constante
 * (`crypto.timingSafeEqual`). Nunca utiliza senhas hardcoded no código-fonte.
 *
 * Variáveis de ambiente aceitas (exclusivamente no servidor):
 * - `ANALYTICS_ADMIN_PASSWORD` (preferencial)
 * - `ANALYTICS_ADMIN_TOKEN`
 * - `CRON_SECRET` / `NOTIFICATIONS_API_KEY` (segredo administrativo já provisionado na Vercel)
 */
export function verifyAdminCredential(inputPassword: string): {
  valid: boolean;
  configured: boolean;
} {
  const candidates = [
    process.env.ANALYTICS_ADMIN_PASSWORD,
    process.env.ANALYTICS_ADMIN_TOKEN,
    process.env.CRON_SECRET,
    process.env.NOTIFICATIONS_API_KEY,
  ]
    .map((s) => (s || '').trim())
    .filter((s) => s.length >= 8);

  if (candidates.length === 0) {
    return { valid: false, configured: false };
  }

  const cleanInput = (inputPassword || '').trim();
  if (!cleanInput) {
    return { valid: false, configured: true };
  }

  const inputHash = crypto.createHash('sha256').update(cleanInput).digest();

  for (const candidate of candidates) {
    const candidateHash = crypto.createHash('sha256').update(candidate).digest();
    if (crypto.timingSafeEqual(inputHash, candidateHash)) {
      return { valid: true, configured: true };
    }
  }

  return { valid: false, configured: true };
}

export function createAdminSessionToken(): string {
  const secret = getSigningSecret();
  if (!secret) throw new Error('Segredo de sessão administrativa não configurado no servidor.');

  const payload = {
    role: 'amanhecer_admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(12).toString('hex'),
  };
  const base64Payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const secret = getSigningSecret();
  if (!secret) return false;

  const [base64Payload, sig] = token.split('.');
  if (!base64Payload || !sig) return false;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(base64Payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (payload.role !== 'amanhecer_admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const raw = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

export function isRequestAdminAuthenticated(req: IncomingMessage): boolean {
  // 1. Verifica Cookie HttpOnly assinado
  const cookies = parseCookies(req);
  if (verifyAdminSessionToken(cookies[SESSION_COOKIE_NAME])) {
    return true;
  }

  // 2. Verifica Header Authorization Bearer (para chamadas programáticas / testes autenticados)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (verifyAdminSessionToken(bearer)) return true;
    const credCheck = verifyAdminCredential(bearer);
    if (credCheck.valid) return true;
  }

  return false;
}

export function setAdminSessionCookie(res: ServerResponse, token: string): void {
  const isProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isProd) cookieParts.push('Secure');
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

export function clearAdminSessionCookie(res: ServerResponse): void {
  const isProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ];
  if (isProd) cookieParts.push('Secure');
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}
