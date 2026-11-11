// @vitest-environment jsdom
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getConsentRecord,
  isAnalyticsConsentGranted,
  shouldShowConsentBanner,
  grantAnalyticsConsent,
  refuseAnalyticsConsent,
  revokeAnalyticsConsent,
  requestAnalyticsDataDeletion,
  CURRENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
} from '../src/services/consent/consent-manager';
import {
  trackEvent,
  flushEventsNow,
  sanitizeErrorMessage,
} from '../src/services/analytics/analytics-client';
import { METRIC_DICTIONARY } from '../src/services/analytics/metrics-dictionary';
import {
  encryptPayload,
  decryptPayload,
  ingestAnalyticsEvents,
  deleteVisitorAnalyticsData,
  resetAnalyticsMemoryCache,
  loadAnalyticsDB,
} from '../api/analytics/_store';
import {
  getSaltedNetworkHash,
} from '../api/analytics/_auth';
import { buildDashboardIntelligence } from '../api/analytics/_aggregator';
import analyticsHandler from '../api/analytics';
import { loadUserPreferences, saveUserPreferences } from '../src/storage/preferences';

const VISITOR_KEY = 'amanhecer_analytics_visitor_id';
const SESSION_KEY = 'amanhecer_analytics_session_v1';
const QUEUE_KEY = 'amanhecer_analytics_queue_v1';

describe('Amanhecer Analytics & LGPD Privacy Platform (15 Mandatory Scenarios)', () => {
  const testDbPath = path.join(os.tmpdir(), 'amanhecer-vitest-analytics-db.json');

  beforeEach(() => {
    process.env.ANALYTICS_STORAGE_PATH = testDbPath;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    window.localStorage.clear();
    window.sessionStorage.clear();
    resetAnalyticsMemoryCache();
    vi.restoreAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window.navigator, 'webdriver', {
      value: false,
      configurable: true,
      writable: true,
    });
  });

  it('Scenario 1 & 4: First visit / undecided state blocks all optional analytics and creates zero identifiers', () => {
    const state = getConsentRecord();
    expect(state.status).toBe('undecided');
    expect(shouldShowConsentBanner()).toBe(true);
    expect(isAnalyticsConsentGranted()).toBe(false);

    // Attempt to track an event before consent decision
    const tracked = trackEvent('landing_viewed', { path: '/' });
    expect(tracked).toBe(false);

    // Ensure no visitorId, sessionId, or queue was created in storage
    expect(window.localStorage.getItem(VISITOR_KEY)).toBeNull();
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it('Scenario 2, 6, 7: User refuses analytics — app reading & sharing work normally while analytics stays 100% blocked', () => {
    const state = refuseAnalyticsConsent('banner');
    expect(state.status).toBe('refused');
    expect(state.analyticsAllowed).toBe(false);
    expect(shouldShowConsentBanner()).toBe(false);
    expect(isAnalyticsConsentGranted()).toBe(false);

    // Confirm essential app preferences work without analytics consent (Scenario 6)
    saveUserPreferences({ userName: 'Maria', theme: 'dark' });
    expect(loadUserPreferences().userName).toBe('Maria');

    // Try tracking reading and sharing events (Scenario 6 & 7) — must be blocked
    expect(trackEvent('devotional_completed', { devotional_id: '2026-11-10' })).toBe(false);
    expect(trackEvent('share_initiated', { method: 'web_share' })).toBe(false);
    expect(window.localStorage.getItem(QUEUE_KEY)).toBeNull();
    expect(window.localStorage.getItem(VISITOR_KEY)).toBeNull();
  });

  it('Scenario 3: User accepts analytics — pseudonymous IDs are generated and events are queued/sent', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const state = grantAnalyticsConsent('banner');
    expect(state.status).toBe('granted');
    expect(state.analyticsAllowed).toBe(true);
    expect(isAnalyticsConsentGranted()).toBe(true);
    expect(shouldShowConsentBanner()).toBe(false);

    const tracked = trackEvent('devotional_opened', { devotional_id: '2026-11-10' });
    expect(tracked).toBe(true);

    const visitorId = window.localStorage.getItem(VISITOR_KEY);
    expect(visitorId).toMatch(/^v_[a-z0-9-]+/);

    const queueRaw = window.localStorage.getItem(QUEUE_KEY);
    expect(queueRaw).toBeTruthy();
    const queue = JSON.parse(queueRaw!);
    expect(queue.length).toBeGreaterThanOrEqual(1);
    expect(queue[0].eventName).toBe('devotional_opened');
    expect(queue[0].visitorId).toBe(visitorId);
  });

  it('Scenario 5 & 14: Offline user queues events with original occurredAt; revoking consent before online wipes queue immediately', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
      writable: true,
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    grantAnalyticsConsent('banner');
    expect(trackEvent('reading_started', { devotional_id: '2026-11-10' })).toBe(true);
    expect(trackEvent('devotional_completed', { devotional_id: '2026-11-10', reading_duration_sec: 95 })).toBe(true);

    const queued = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || '[]');
    expect(queued).toHaveLength(2);
    expect(queued[0].occurredAt).toBeTruthy();

    // User revokes consent while still offline (Scenario 14)
    const revoked = revokeAnalyticsConsent('settings');
    expect(revoked.status).toBe('revoked');
    expect(isAnalyticsConsentGranted()).toBe(false);

    // Offline queue and visitor identifiers must be immediately purged
    expect(window.localStorage.getItem(QUEUE_KEY)).toBeNull();
    expect(window.localStorage.getItem(VISITOR_KEY)).toBeNull();

    // Reconnect to internet and attempt flush
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
      writable: true,
    });
    const flushed = await flushEventsNow();
    expect(flushed).toBe(false);

    // Ensure no analytics ingest request was sent with the revoked events
    const ingestCalls = fetchSpy.mock.calls.filter(([url]) => String(url).includes('action=ingest'));
    expect(ingestCalls).toHaveLength(0);
  });

  it('Scenario 8, 9, 10, 11: User changes preferences, clears browser data, or requests LGPD server deletion', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true, deletedEvents: 3 }), { status: 200 })
    );

    // Scenario 10: User refuses in settings
    const refused = refuseAnalyticsConsent('settings');
    expect(refused.status).toBe('refused');
    expect(isAnalyticsConsentGranted()).toBe(false);

    // Switch to granted in settings
    const granted = grantAnalyticsConsent('settings');
    expect(granted.status).toBe('granted');
    trackEvent('app_opened');
    expect(window.localStorage.getItem(VISITOR_KEY)).toBeTruthy();

    // Scenario 8 & Art. 18 LGPD: Request complete deletion of data
    const deletionRes = await requestAnalyticsDataDeletion();
    expect(deletionRes.success).toBe(true);
    expect(deletionRes.deletedEvents).toBe(3);
    expect(getConsentRecord().status).toBe('revoked');
    expect(window.localStorage.getItem(VISITOR_KEY)).toBeNull();

    // Scenario 9 & 11: User clears browser data / opens in another browser
    window.localStorage.clear();
    expect(getConsentRecord().status).toBe('undecided');
    expect(shouldShowConsentBanner()).toBe(true);
  });

  it('Scenario 12: Unauthorized user is blocked from /api/analytics?action=dashboard with 401; valid admin auth succeeds', async () => {
    process.env.ANALYTICS_ADMIN_PASSWORD = 'super-secret-colossenses-test-key';
    process.env.ANALYTICS_ADMIN_SECRET = 'super-secret-signing-key-test-2026';

    const makeMockRes = () => {
      const res: any = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: null as any,
        setHeader(k: string, v: string) {
          this.headers[k] = v;
        },
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(payload: any) {
          this.body = payload;
          return this;
        },
        end(raw?: string) {
          if (raw && !this.body) {
            try {
              this.body = JSON.parse(raw);
            } catch {
              this.body = raw;
            }
          }
          return this;
        },
      };
      return res;
    };

    // 1. Unauthorized GET to dashboard -> 401
    const unauthReq: any = {
      method: 'GET',
      url: '/api/analytics?action=dashboard&days=7',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    };
    const unauthRes = makeMockRes();
    await analyticsHandler(unauthReq, unauthRes);
    expect(unauthRes.statusCode).toBe(401);

    // 2. Wrong password login -> 401
    const badLoginReq: any = {
      method: 'POST',
      url: '/api/analytics?action=auth-login',
      headers: {},
      body: { password: 'wrong-password' },
      socket: { remoteAddress: '127.0.0.1' },
    };
    const badLoginRes = makeMockRes();
    await analyticsHandler(badLoginReq, badLoginRes);
    expect(badLoginRes.statusCode).toBe(401);

    // 3. Valid password login -> 200 + HttpOnly signed cookie
    const goodLoginReq: any = {
      method: 'POST',
      url: '/api/analytics?action=auth-login',
      headers: {},
      body: { password: 'super-secret-colossenses-test-key' },
      socket: { remoteAddress: '127.0.0.1' },
    };
    const goodLoginRes = makeMockRes();
    await analyticsHandler(goodLoginReq, goodLoginRes);
    expect(goodLoginRes.statusCode).toBe(200);
    expect(goodLoginRes.body.authenticated).toBe(true);
    expect(goodLoginRes.headers['Set-Cookie']).toContain('HttpOnly');

    // Extract cookie and access dashboard -> 200
    const cookieHeader = goodLoginRes.headers['Set-Cookie'].split(';')[0];
    const authDashboardReq: any = {
      method: 'GET',
      url: '/api/analytics?action=dashboard&days=7',
      headers: { cookie: cookieHeader },
      socket: { remoteAddress: '127.0.0.1' },
    };
    const authDashboardRes = makeMockRes();
    await analyticsHandler(authDashboardReq, authDashboardRes);
    expect(authDashboardRes.statusCode).toBe(200);
    expect(authDashboardRes.body.overviewKPIs).toHaveLength(24);
  });

  it('Scenario 13: Automated bot/webdriver or third-party script attempting collection is blocked', () => {
    grantAnalyticsConsent('banner');
    Object.defineProperty(window.navigator, 'webdriver', {
      value: true,
      configurable: true,
      writable: true,
    });

    const tracked = trackEvent('landing_viewed', { path: '/' });
    expect(tracked).toBe(false);
    expect(window.localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it('Scenario 15: Policy version update transitions existing consent to needs_redecision and blocks collection until re-consent', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    grantAnalyticsConsent('banner');
    expect(isAnalyticsConsentGranted()).toBe(true);

    // Simulate an older policy version stored in localStorage
    const raw = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY)!);
    raw.policyVersion = '1.0.0-old';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(raw));

    const updatedState = getConsentRecord();
    expect(updatedState.status).toBe('needs_redecision');
    expect(updatedState.analyticsAllowed).toBe(false);
    expect(isAnalyticsConsentGranted()).toBe(false);
    expect(shouldShowConsentBanner()).toBe(true);
    expect(trackEvent('app_opened')).toBe(false);
  });

  it('Backend Store & Aggregator: AES-256-GCM encryption, eventId deduplication, opening vs completion distinction, and LGPD deletion', async () => {
    // 1. Verify AES-256-GCM encryption at rest roundtrip
    const db0 = await loadAnalyticsDB(true);
    const encrypted = encryptPayload(JSON.stringify(db0));
    expect(encrypted).toContain('"enc":"AES-256-GCM"');
    const decrypted = decryptPayload(encrypted);
    expect(decrypted.schemaVersion).toBe(1);

    // 2. Verify PII / Secret sanitization in error logs
    const dirtyError = 'Failed request for user joao.silva@gmail.com with Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def';
    const cleanError = sanitizeErrorMessage(dirtyError);
    expect(cleanError).not.toContain('joao.silva@gmail.com');
    expect(cleanError).not.toContain('eyJhbGci');
    expect(cleanError).toContain('[EMAIL_REDACTED]');
    expect(cleanError).toContain('[TOKEN_REDACTED]');

    // 3. Verify deduplication by eventId and reading open vs completed separation
    const nowIso = new Date().toISOString();
    const res1 = await ingestAnalyticsEvents([
      {
        eventId: 'evt_unique_1',
        eventName: 'app_opened',
        occurredAt: nowIso,
        visitorId: 'v_testuser1',
        sessionId: 's_testsession1',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        isStandalone: true,
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'lancamento',
      },
      {
        eventId: 'evt_unique_2',
        eventName: 'devotional_opened',
        occurredAt: nowIso,
        visitorId: 'v_testuser1',
        sessionId: 's_testsession1',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        isStandalone: true,
        properties: { devotional_id: '2026-11-10', title: 'Paz em Cristo' },
      },
      {
        // Duplicate of evt_unique_2 -> must be ignored!
        eventId: 'evt_unique_2',
        eventName: 'devotional_opened',
        occurredAt: nowIso,
        visitorId: 'v_testuser1',
        sessionId: 's_testsession1',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        isStandalone: true,
        properties: { devotional_id: '2026-11-10', title: 'Paz em Cristo' },
      },
    ]);

    expect(res1.accepted).toBe(2);
    expect(res1.deduplicated).toBe(1);

    const dbBeforeCompletion = await loadAnalyticsDB(true);
    const reportBeforeCompletion = await buildDashboardIntelligence(dbBeforeCompletion, 7);

    const startedKpi = reportBeforeCompletion.overviewKPIs.find((k) => k.id === 'devotionals_started');
    const completedKpi = reportBeforeCompletion.overviewKPIs.find((k) => k.id === 'devotionals_completed');
    expect(startedKpi?.value).toBe(1);
    // Opening a devotional must NOT count as completed reading
    expect(completedKpi?.value).toBe(0);

    // Now ingest actual completion
    await ingestAnalyticsEvents([
      {
        eventId: 'evt_unique_3',
        eventName: 'devotional_completed',
        occurredAt: nowIso,
        visitorId: 'v_testuser1',
        sessionId: 's_testsession1',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        isStandalone: true,
        properties: { devotional_id: '2026-11-10', title: 'Paz em Cristo', reading_duration_sec: 120 },
      },
    ]);

    const dbAfterCompletion = await loadAnalyticsDB(true);
    const reportAfterCompletion = await buildDashboardIntelligence(dbAfterCompletion, 7);
    expect(reportAfterCompletion.overviewKPIs.find((k) => k.id === 'devotionals_completed')?.value).toBe(1);
    expect(reportAfterCompletion.readings.avgReadingTimeSec).toBe(120);

    // 4. Verify Art. 18 LGPD server-side visitor deletion
    const deletedCount = await deleteVisitorAnalyticsData('v_testuser1');
    expect(deletedCount).toBe(3);

    // 5. Verify Metric Dictionary completeness and network hash privacy
    expect(Object.keys(METRIC_DICTIONARY).length).toBeGreaterThanOrEqual(15);
    expect(
      getSaltedNetworkHash({
        headers: { 'x-forwarded-for': '192.168.1.100' },
        socket: {},
      } as any)
    ).toHaveLength(16);
  });
});
