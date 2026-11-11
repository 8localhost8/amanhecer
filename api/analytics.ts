import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  loadAnalyticsDB,
  saveAnalyticsDB,
  ingestAnalyticsEvents,
  deleteVisitorAnalyticsData,
  applyRetentionAndCaps,
  signAuditRecord,
} from './analytics/_store.js';
import {
  getSaltedNetworkHash,
  checkLoginRateLimit,
  checkIngestRateLimit,
  verifyAdminCredential,
  createAdminSessionToken,
  isRequestAdminAuthenticated,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from './analytics/_auth.js';
import { buildDashboardIntelligence } from './analytics/_aggregator.js';

async function readJsonBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body && typeof (req as any).body === 'object') {
    return (req as any).body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) {
        req.destroy();
        resolve({});
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const urlObj = new URL(req.url || '/api/analytics', 'http://localhost');
  const action = urlObj.searchParams.get('action') || 'status';
  const ipHash = getSaltedNetworkHash(req);

  try {
    // 1. Ingestão Pública de Eventos (apenas com consentimento já validado no cliente)
    if (req.method === 'POST' && action === 'ingest') {
      if (!checkIngestRateLimit(ipHash)) {
        return sendJson(res, 429, { error: 'Rate limit exceeded' });
      }

      const body = await readJsonBody(req);
      const events = Array.isArray(body?.events) ? body.events : [];
      if (events.length === 0 || events.length > 60) {
        return sendJson(res, 400, { error: 'Invalid events batch' });
      }

      const result = await ingestAnalyticsEvents(events);
      return sendJson(res, 200, {
        ok: true,
        accepted: result.accepted,
        deduplicated: result.deduplicated,
      });
    }

    // 2. Registro Proporcional de Consentimento (LGPD Seção 22 - sem IP completo)
    if (req.method === 'POST' && action === 'consent-audit') {
      if (!checkIngestRateLimit(ipHash)) {
        return sendJson(res, 429, { error: 'Rate limit exceeded' });
      }
      const body = await readJsonBody(req);
      const timestamp = new Date().toISOString();
      const purpose = String(body?.purpose || 'optional_product_analytics').slice(0, 64);
      const policyVersion = String(body?.policyVersion || '2.3.0').slice(0, 24);
      const status = String(body?.status || 'granted').slice(0, 24);
      const origin = String(body?.origin || 'banner').slice(0, 24);

      const sigPayload = `${timestamp}|${purpose}|${policyVersion}|${status}|${origin}`;
      const hmacSignature = signAuditRecord(sigPayload);

      const db = await loadAnalyticsDB();
      db.consentAudit.push({
        id: `ca_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp,
        purpose,
        policyVersion,
        status,
        origin,
        hmacSignature,
      });
      await saveAnalyticsDB(db);
      return sendJson(res, 200, { ok: true, signature: hmacSignature });
    }

    // 3. Solicitação de Eliminação de Dados pelo Titular (LGPD Art. 18 - Seção 23)
    if (req.method === 'POST' && action === 'delete-my-data') {
      if (!checkIngestRateLimit(ipHash)) {
        return sendJson(res, 429, { error: 'Rate limit exceeded' });
      }
      const body = await readJsonBody(req);
      const visitorId = String(body?.visitorId || '').trim();
      if (!visitorId || !visitorId.startsWith('v_')) {
        return sendJson(res, 200, {
          ok: true,
          deletedEvents: 0,
          message: 'Nenhum identificador pseudônimo válido informado.',
        });
      }
      const deletedEvents = await deleteVisitorAnalyticsData(visitorId);
      return sendJson(res, 200, {
        ok: true,
        deletedEvents,
        message:
          'Os registros pseudônimos vinculados ao seu identificador foram eliminados do banco de dados. Contagens diárias já agregadas de forma irreversível e anônima permanecem apenas como totais estatísticos.',
      });
    }

    // 4. Verificação de Sessão Administrativa
    if (req.method === 'GET' && action === 'auth-session') {
      const authenticated = isRequestAdminAuthenticated(req);
      return sendJson(res, 200, { authenticated });
    }

    // 5. Login Administrativo Seguro (Seção 12 & 29)
    if (req.method === 'POST' && action === 'auth-login') {
      const rate = checkLoginRateLimit(ipHash);
      if (!rate.allowed) {
        const db = await loadAnalyticsDB();
        db.securityAudit.push({
          id: `sec_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'admin_login_rate_limited',
          status: 'blocked',
          ipHash,
        });
        await saveAnalyticsDB(db);
        return sendJson(res, 429, {
          error: `Muitas tentativas de acesso. Aguarde ${rate.retryAfterSec} segundos.`,
        });
      }

      const body = await readJsonBody(req);
      const password = String(body?.password || '');
      const check = verifyAdminCredential(password);

      const db = await loadAnalyticsDB();

      if (!check.configured) {
        return sendJson(res, 503, {
          error:
            'Nenhuma credencial administrativa configurada no servidor. Configure ANALYTICS_ADMIN_PASSWORD ou CRON_SECRET nas variáveis de ambiente.',
        });
      }

      if (!check.valid) {
        db.securityAudit.push({
          id: `sec_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'admin_login_attempt',
          status: 'failure',
          ipHash,
        });
        await saveAnalyticsDB(db);
        return sendJson(res, 401, {
          error: 'Credencial administrativa inválida.',
        });
      }

      const token = createAdminSessionToken();
      setAdminSessionCookie(res, token);

      db.securityAudit.push({
        id: `sec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'admin_login_attempt',
        status: 'success',
        ipHash,
      });
      await saveAnalyticsDB(db);

      return sendJson(res, 200, {
        ok: true,
        authenticated: true,
        token,
      });
    }

    // 6. Logout Administrativo
    if (req.method === 'POST' && action === 'auth-logout') {
      clearAdminSessionCookie(res);
      return sendJson(res, 200, { ok: true, authenticated: false });
    }

    // ---------- ROTAS ADMINISTRATIVAS PROTEGIDAS ----------
    if (!isRequestAdminAuthenticated(req)) {
      return sendJson(res, 401, {
        error: 'Não autorizado. Autenticação administrativa obrigatória.',
      });
    }

    // 7. Consulta Completa da Central de Inteligência
    if (req.method === 'GET' && action === 'dashboard') {
      const daysParam = parseInt(urlObj.searchParams.get('days') || '30', 10);
      const startParam = urlObj.searchParams.get('start') || undefined;
      const endParam = urlObj.searchParams.get('end') || undefined;
      const forceFresh = urlObj.searchParams.get('refresh') === 'true';

      const db = await loadAnalyticsDB(forceFresh);
      const payload = await buildDashboardIntelligence(
        db,
        isNaN(daysParam) ? 30 : daysParam,
        startParam,
        endParam
      );
      return sendJson(res, 200, payload);
    }

    // 8. Salvar Link de Campanha UTM
    if (req.method === 'POST' && action === 'save-campaign') {
      const body = await readJsonBody(req);
      const name = String(body?.name || '').trim().slice(0, 80);
      const utmSource = String(body?.utmSource || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 48);
      const utmMedium = String(body?.utmMedium || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 48);
      const utmCampaign = String(body?.utmCampaign || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 64);
      const utmContent = String(body?.utmContent || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 64);

      if (!name || !utmSource || !utmMedium || !utmCampaign) {
        return sendJson(res, 400, {
          error: 'Preencha Nome, Origem (utm_source), Meio (utm_medium) e Campanha (utm_campaign).',
        });
      }

      const params = new URLSearchParams({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      });
      if (utmContent) params.set('utm_content', utmContent);

      const fullUrl = `https://amanhecer-beta.vercel.app/?${params.toString()}`;
      const db = await loadAnalyticsDB(true);
      const created = {
        id: `camp_${Date.now()}`,
        name,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent: utmContent || undefined,
        fullUrl,
        createdAt: new Date().toISOString(),
      };
      db.campaigns.unshift(created);
      await saveAnalyticsDB(db);
      return sendJson(res, 200, { ok: true, campaign: created, campaigns: db.campaigns });
    }

    // 9. Remover Link de Campanha
    if (req.method === 'POST' && action === 'delete-campaign') {
      const body = await readJsonBody(req);
      const id = String(body?.id || '');
      const db = await loadAnalyticsDB(true);
      db.campaigns = db.campaigns.filter((c) => c.id !== id);
      await saveAnalyticsDB(db);
      return sendJson(res, 200, { ok: true, campaigns: db.campaigns });
    }

    // 10. Atualizar Política de Retenção e Executar Expurgo de Dados Antigos
    if (req.method === 'POST' && action === 'update-settings') {
      const body = await readJsonBody(req);
      const retentionDays = Math.max(
        7,
        Math.min(365, parseInt(String(body?.retentionDays || '90'), 10) || 90)
      );
      const db = await loadAnalyticsDB(true);
      db.settings.retentionDays = retentionDays;
      db.settings.updatedAt = new Date().toISOString();
      const purgedCount = applyRetentionAndCaps(db);
      db.securityAudit.push({
        id: `sec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `retention_policy_updated_${retentionDays}d`,
        status: 'success',
        ipHash,
      });
      await saveAnalyticsDB(db);
      return sendJson(res, 200, {
        ok: true,
        settings: db.settings,
        purgedCount,
      });
    }

    return sendJson(res, 404, { error: 'Action not found' });
  } catch (err: any) {
    console.error('Erro no endpoint /api/analytics:', err);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}
