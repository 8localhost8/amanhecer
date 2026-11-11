import {
  AnalyticsDatabase,
  createEmptyDailyAggregate,
  getAnalyticsStorageBackendName,
  toSaoPauloTimeInfo,
} from './_store.js';
import { getAllSubscriptions } from '../push/_store.js';

export interface KPIValueItem {
  id: string;
  label: string;
  value: number | null;
  formattedValue: string;
  previousValue: number | null;
  deltaPercent: number | null;
  unit: 'number' | 'percent' | 'seconds' | 'ratio';
  confidence: 'confirmed' | 'estimated' | 'unavailable';
  unavailableReason?: string;
  sparkline: number[];
}

export interface TimeSeriesPoint {
  date: string;
  uniqueVisitors: number;
  sessions: number;
  pageviews: number;
  appOpens: number;
  pwaStandaloneOpens: number;
  installsDetected: number;
  devotionalsOpened: number;
  readingsCompleted: number;
  versesViewed: number;
  sharesCompleted: number;
}

export interface CohortRow {
  cohortLabel: string;
  cohortDateRange: string;
  dayOfWeekLabel: string;
  usersCount: number;
  d1: number | null;
  d3: number | null;
  d7: number | null;
  d14: number | null;
  d30: number | null;
}

export interface FunnelStepResult {
  stepIndex: number;
  eventKey: string;
  label: string;
  usersCount: number;
  conversionFromStartPct: number;
  conversionFromPrevPct: number;
  dropOffCount: number;
  dropOffPct: number;
}

function getDateList(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const curr = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  while (curr <= end && out.length < 370) {
    out.push(curr.toISOString().slice(0, 10));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return out;
}

function shiftDate(dateStr: string, deltaDays: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function daysBetween(startStr: string, endStr: string): number {
  const s = new Date(`${startStr}T12:00:00Z`).getTime();
  const e = new Date(`${endStr}T12:00:00Z`).getTime();
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

function computeDeltaPct(curr: number | null, prev: number | null): number | null {
  if (curr === null || prev === null) return null;
  if (prev === 0) return curr > 0 ? 100 : null;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function formatDuration(sec: number): string {
  if (sec <= 0) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export async function buildDashboardIntelligence(
  db: AnalyticsDatabase,
  periodDays = 30,
  customStart?: string,
  customEnd?: string
) {
  const { dateStr: todayStr } = toSaoPauloTimeInfo(new Date().toISOString());
  const endDate = customEnd && customEnd <= todayStr ? customEnd : todayStr;
  const startDate =
    customStart && customStart <= endDate
      ? customStart
      : shiftDate(endDate, -(Math.max(1, periodDays) - 1));

  const windowLen = daysBetween(startDate, endDate);
  const prevEndDate = shiftDate(startDate, -1);
  const prevStartDate = shiftDate(prevEndDate, -(windowLen - 1));

  const currentDates = getDateList(startDate, endDate);
  const prevDates = getDateList(prevStartDate, prevEndDate);

  // Busca inscrições push reais no banco existente para complementar telemetria de notificações e instalações estimadas
  let activePushSubscriptionsCount = 0;
  try {
    const subs = await getAllSubscriptions();
    activePushSubscriptionsCount = subs.length;
  } catch {
    activePushSubscriptionsCount = 0;
  }

  // Filtra eventos e sessões nos períodos atual e anterior
  const eventsInCurrent = db.events.filter(
    (e) => e.dateStr >= startDate && e.dateStr <= endDate
  );
  const eventsInPrev = db.events.filter(
    (e) => e.dateStr >= prevStartDate && e.dateStr <= prevEndDate
  );

  const sessionsAll = Object.values(db.sessions);
  const sessionsInCurrent = sessionsAll.filter(
    (s) => s.dateStr >= startDate && s.dateStr <= endDate
  );
  const sessionsInPrev = sessionsAll.filter(
    (s) => s.dateStr >= prevStartDate && s.dateStr <= prevEndDate
  );

  const visitorsAll = Object.values(db.visitors);

  // Função auxiliar para somar agregações diárias num intervalo de datas
  function sumDaily(dates: string[]) {
    const acc = createEmptyDailyAggregate('sum');
    for (const d of dates) {
      const row = db.dailyAggregates[d];
      if (!row) continue;
      acc.pageviews += row.pageviews;
      acc.landingViews += row.landingViews;
      acc.appOpens += row.appOpens;
      acc.pwaStandaloneOpens += row.pwaStandaloneOpens;
      acc.installClicks += row.installClicks;
      acc.installTutorialsOpened += row.installTutorialsOpened;
      acc.installsDetected += row.installsDetected;
      acc.devotionalsOpened += row.devotionalsOpened;
      acc.readingsStarted += row.readingsStarted;
      acc.readingsCompleted += row.readingsCompleted;
      acc.readingRepeatConfirmations += row.readingRepeatConfirmations;
      acc.readingDurationTotalSec += row.readingDurationTotalSec;
      acc.readingDurationCount += row.readingDurationCount;
      acc.versesViewed += row.versesViewed;
      acc.versesClicked += row.versesClicked;
      acc.verseImagesGenerated += row.verseImagesGenerated;
      acc.verseImagesDownloaded += row.verseImagesDownloaded;
      acc.verseTextCopied += row.verseTextCopied;
      acc.sharesInitiated += row.sharesInitiated;
      acc.sharesCompleted += row.sharesCompleted;
      acc.verseSharesCompleted += row.verseSharesCompleted;
      acc.devotionalSharesCompleted += row.devotionalSharesCompleted;
      acc.notifPermissionGranted += row.notifPermissionGranted;
      acc.notifPermissionDenied += row.notifPermissionDenied;
      acc.notifScheduled += row.notifScheduled;
      acc.notifOpened += row.notifOpened;
      acc.notifConvertedReading += row.notifConvertedReading;
      acc.notifDisabled += row.notifDisabled;
      acc.errorsCount += row.errorsCount;
      for (let h = 0; h < 24; h++) {
        acc.byHourReadings[h] += row.byHourReadings?.[h] || 0;
        acc.byHourOpens[h] += row.byHourOpens?.[h] || 0;
      }
    }
    return acc;
  }

  const currSum = sumDaily(currentDates);
  const prevSum = sumDaily(prevDates);

  // Visitantes únicos no período atual vs anterior
  const currVisitorIds = new Set<string>();
  for (const s of sessionsInCurrent) currVisitorIds.add(s.visitorId);
  for (const e of eventsInCurrent) currVisitorIds.add(e.visitorId);

  const prevVisitorIds = new Set<string>();
  for (const s of sessionsInPrev) prevVisitorIds.add(s.visitorId);
  for (const e of eventsInPrev) prevVisitorIds.add(e.visitorId);

  const uniqueVisitorsCurr = currVisitorIds.size;
  const uniqueVisitorsPrev = prevVisitorIds.size;

  // Novos vs Recorrentes no período
  let newVisitorsCurr = 0;
  let returningVisitorsCurr = 0;
  for (const vid of currVisitorIds) {
    const v = db.visitors[vid];
    if (v && v.firstSeenDate >= startDate && v.firstSeenDate <= endDate && v.activeDates.length === 1) {
      newVisitorsCurr++;
    } else if (v && v.firstSeenDate >= startDate && v.firstSeenDate <= endDate) {
      newVisitorsCurr++;
      if (v.activeDates.length >= 2) returningVisitorsCurr++;
    } else {
      returningVisitorsCurr++;
    }
  }

  let newVisitorsPrev = 0;
  for (const vid of prevVisitorIds) {
    const v = db.visitors[vid];
    if (v && v.firstSeenDate >= prevStartDate && v.firstSeenDate <= prevEndDate) {
      newVisitorsPrev++;
    }
  }
  const returningVisitorsPrev = Math.max(0, uniqueVisitorsPrev - newVisitorsPrev);

  // Ativos agora (últimos 5 minutos)
  const fiveMinAgoIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const activeNowVisitors = new Set<string>();
  for (const e of db.events) {
    if (e.occurredAt >= fiveMinAgoIso || e.receivedAt >= fiveMinAgoIso) {
      activeNowVisitors.add(e.visitorId);
    }
  }
  const activeNowCount = activeNowVisitors.size;

  // DAU (hoje), WAU (últimos 7 dias), MAU (últimos 30 dias)
  const date7dAgo = shiftDate(todayStr, -6);
  const date30dAgo = shiftDate(todayStr, -29);
  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  for (const v of visitorsAll) {
    for (const ad of v.activeDates) {
      if (ad === todayStr) dauSet.add(v.visitorId);
      if (ad >= date7dAgo && ad <= todayStr) wauSet.add(v.visitorId);
      if (ad >= date30dAgo && ad <= todayStr) mauSet.add(v.visitorId);
    }
  }
  const dau = dauSet.size;
  const wau = wauSet.size;
  const mau = mauSet.size;
  const stickinessPct = mau > 0 ? Number(((dau / mau) * 100).toFixed(1)) : null;

  // Duração média das sessões e Taxa de Engajamento
  const sessionsWithDurCurr = sessionsInCurrent.filter((s) => s.durationSec > 0);
  const avgSessionDurationCurr =
    sessionsWithDurCurr.length > 0
      ? Math.round(
          sessionsWithDurCurr.reduce((acc, s) => acc + s.durationSec, 0) /
            sessionsWithDurCurr.length
        )
      : sessionsInCurrent.length > 0
      ? 0
      : null;

  const sessionsWithDurPrev = sessionsInPrev.filter((s) => s.durationSec > 0);
  const avgSessionDurationPrev =
    sessionsWithDurPrev.length > 0
      ? Math.round(
          sessionsWithDurPrev.reduce((acc, s) => acc + s.durationSec, 0) /
            sessionsWithDurPrev.length
        )
      : null;

  const engagedSessionsCurr = sessionsInCurrent.filter((s) => s.engaged).length;
  const engagementRateCurr =
    sessionsInCurrent.length > 0
      ? Number(((engagedSessionsCurr / sessionsInCurrent.length) * 100).toFixed(1))
      : null;

  const engagedSessionsPrev = sessionsInPrev.filter((s) => s.engaged).length;
  const engagementRatePrev =
    sessionsInPrev.length > 0
      ? Number(((engagedSessionsPrev / sessionsInPrev.length) * 100).toFixed(1))
      : null;

  // Sessões em modo PWA Standalone
  const pwaSessionsCurr = sessionsInCurrent.filter((s) => s.isStandalone).length;
  const pwaSessionsPrev = sessionsInPrev.filter((s) => s.isStandalone).length;

  // Instalações:
  // 1. Detectadas (`appinstalled`)
  // 2. Dispositivos únicos que abriram a PWA instalada (`everStandalone`)
  // 3. Estimadas (união de detectadas + standalone + baseline/push)
  const standaloneVisitorsTotal = visitorsAll.filter((v) => v.everStandalone).length;
  const detectedInstallVisitorsTotal = visitorsAll.filter(
    (v) => v.everDetectedInstall
  ).length;
  const unionInstalledOrStandalone = visitorsAll.filter(
    (v) => v.everStandalone || v.everDetectedInstall
  ).length;
  const installsEstimatedTotal = Math.max(
    14 + activePushSubscriptionsCount,
    unionInstalledOrStandalone,
    currSum.installsDetected
  );

  // Taxa de conclusão de leitura
  const readingCompletionRateCurr =
    currSum.devotionalsOpened > 0
      ? Number(
          Math.min(
            100,
            (currSum.readingsCompleted / currSum.devotionalsOpened) * 100
          ).toFixed(1)
        )
      : null;

  const readingCompletionRatePrev =
    prevSum.devotionalsOpened > 0
      ? Number(
          Math.min(
            100,
            (prevSum.readingsCompleted / prevSum.devotionalsOpened) * 100
          ).toFixed(1)
        )
      : null;

  // Taxa de retorno (visitantes com >= 2 dias ativos / total visitantes)
  const multiDayVisitorsCount = visitorsAll.filter(
    (v) => v.activeDates.length >= 2
  ).length;
  const returnRatePct =
    visitorsAll.length > 0
      ? Number(((multiDayVisitorsCount / visitorsAll.length) * 100).toFixed(1))
      : null;

  // Retenção exata de Coortes: D1, D7, D14, D30
  function computeExactRetentionDay(dayOffset: number): {
    rate: number | null;
    eligibleUsers: number;
    retainedUsers: number;
  } {
    let eligible = 0;
    let retained = 0;
    for (const v of visitorsAll) {
      const targetDate = shiftDate(v.firstSeenDate, dayOffset);
      // Só inclui na base de cálculo coortes que já completaram `dayOffset` dias até hoje
      if (targetDate <= todayStr) {
        eligible++;
        if (v.activeDates.includes(targetDate)) {
          retained++;
        }
      }
    }
    if (eligible === 0) {
      return { rate: null, eligibleUsers: 0, retainedUsers: 0 };
    }
    return {
      rate: Number(((retained / eligible) * 100).toFixed(1)),
      eligibleUsers: eligible,
      retainedUsers: retained,
    };
  }

  const retD1 = computeExactRetentionDay(1);
  const retD3 = computeExactRetentionDay(3);
  const retD7 = computeExactRetentionDay(7);
  const retD14 = computeExactRetentionDay(14);
  const retD30 = computeExactRetentionDay(30);

  // Série temporal diária para gráficos e sparklines
  const timeSeries: TimeSeriesPoint[] = currentDates.map((d) => {
    const row = db.dailyAggregates[d] || createEmptyDailyAggregate(d);
    const dayVisitors = new Set<string>();
    const daySessions = new Set<string>();
    for (const s of sessionsInCurrent) {
      if (s.dateStr === d) {
        dayVisitors.add(s.visitorId);
        daySessions.add(s.sessionId);
      }
    }
    for (const e of eventsInCurrent) {
      if (e.dateStr === d) {
        dayVisitors.add(e.visitorId);
        daySessions.add(e.sessionId);
      }
    }
    return {
      date: d,
      uniqueVisitors: dayVisitors.size,
      sessions: daySessions.size,
      pageviews: row.pageviews,
      appOpens: row.appOpens,
      pwaStandaloneOpens: row.pwaStandaloneOpens,
      installsDetected: row.installsDetected,
      devotionalsOpened: row.devotionalsOpened,
      readingsCompleted: row.readingsCompleted,
      versesViewed: row.versesViewed,
      sharesCompleted: row.sharesCompleted,
    };
  });

  const sparkVisitors = timeSeries.slice(-14).map((p) => p.uniqueVisitors);
  const sparkSessions = timeSeries.slice(-14).map((p) => p.sessions);
  const sparkPageviews = timeSeries.slice(-14).map((p) => p.pageviews);
  const sparkOpens = timeSeries.slice(-14).map((p) => p.appOpens);
  const sparkPwaOpens = timeSeries.slice(-14).map((p) => p.pwaStandaloneOpens);
  const sparkInstalls = timeSeries.slice(-14).map((p) => p.installsDetected);
  const sparkDevOpened = timeSeries.slice(-14).map((p) => p.devotionalsOpened);
  const sparkReadings = timeSeries.slice(-14).map((p) => p.readingsCompleted);
  const sparkVerses = timeSeries.slice(-14).map((p) => p.versesViewed);
  const sparkShares = timeSeries.slice(-14).map((p) => p.sharesCompleted);

  // Construção dos 24 Indicadores Principais (Seção 3)
  const overviewKPIs: KPIValueItem[] = [
    {
      id: 'unique_visitors',
      label: 'Visitantes Únicos',
      value: uniqueVisitorsCurr,
      formattedValue: uniqueVisitorsCurr.toLocaleString('pt-BR'),
      previousValue: uniqueVisitorsPrev,
      deltaPercent: computeDeltaPct(uniqueVisitorsCurr, uniqueVisitorsPrev),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'total_visits',
      label: 'Visitantes Totais (Visitas)',
      value: sessionsInCurrent.length,
      formattedValue: sessionsInCurrent.length.toLocaleString('pt-BR'),
      previousValue: sessionsInPrev.length,
      deltaPercent: computeDeltaPct(sessionsInCurrent.length, sessionsInPrev.length),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkSessions,
    },
    {
      id: 'pageviews',
      label: 'Visualizações de Páginas',
      value: currSum.pageviews,
      formattedValue: currSum.pageviews.toLocaleString('pt-BR'),
      previousValue: prevSum.pageviews,
      deltaPercent: computeDeltaPct(currSum.pageviews, prevSum.pageviews),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkPageviews,
    },
    {
      id: 'new_visitors',
      label: 'Novos Visitantes',
      value: newVisitorsCurr,
      formattedValue: newVisitorsCurr.toLocaleString('pt-BR'),
      previousValue: newVisitorsPrev,
      deltaPercent: computeDeltaPct(newVisitorsCurr, newVisitorsPrev),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'returning_visitors',
      label: 'Visitantes Recorrentes',
      value: returningVisitorsCurr,
      formattedValue: returningVisitorsCurr.toLocaleString('pt-BR'),
      previousValue: returningVisitorsPrev,
      deltaPercent: computeDeltaPct(returningVisitorsCurr, returningVisitorsPrev),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'active_now',
      label: 'Usuários Ativos Agora (5m)',
      value: activeNowCount,
      formattedValue: activeNowCount.toLocaleString('pt-BR'),
      previousValue: null,
      deltaPercent: null,
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'dau',
      label: 'Usuários Ativos Hoje (DAU)',
      value: dau,
      formattedValue: dau.toLocaleString('pt-BR'),
      previousValue: null,
      deltaPercent: null,
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'wau',
      label: 'Usuários Ativos 7 Dias (WAU)',
      value: wau,
      formattedValue: wau.toLocaleString('pt-BR'),
      previousValue: null,
      deltaPercent: null,
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'mau',
      label: 'Usuários Ativos 30 Dias (MAU)',
      value: mau,
      formattedValue: mau.toLocaleString('pt-BR'),
      previousValue: null,
      deltaPercent: null,
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVisitors,
    },
    {
      id: 'sessions',
      label: 'Sessões',
      value: sessionsInCurrent.length,
      formattedValue: sessionsInCurrent.length.toLocaleString('pt-BR'),
      previousValue: sessionsInPrev.length,
      deltaPercent: computeDeltaPct(sessionsInCurrent.length, sessionsInPrev.length),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkSessions,
    },
    {
      id: 'avg_session_duration',
      label: 'Duração Média da Sessão',
      value: avgSessionDurationCurr,
      formattedValue:
        avgSessionDurationCurr !== null
          ? formatDuration(avgSessionDurationCurr)
          : 'Sem dados no período',
      previousValue: avgSessionDurationPrev,
      deltaPercent: computeDeltaPct(avgSessionDurationCurr, avgSessionDurationPrev),
      unit: 'seconds',
      confidence: avgSessionDurationCurr !== null ? 'estimated' : 'unavailable',
      unavailableReason:
        avgSessionDurationCurr === null
          ? 'Nenhuma sessão com múltiplos eventos registrada no período.'
          : undefined,
      sparkline: sparkSessions,
    },
    {
      id: 'engagement_rate',
      label: 'Taxa de Engajamento',
      value: engagementRateCurr,
      formattedValue:
        engagementRateCurr !== null ? `${engagementRateCurr}%` : 'Sem sessões',
      previousValue: engagementRatePrev,
      deltaPercent: computeDeltaPct(engagementRateCurr, engagementRatePrev),
      unit: 'percent',
      confidence: engagementRateCurr !== null ? 'confirmed' : 'unavailable',
      unavailableReason:
        engagementRateCurr === null ? 'Aguardando sessões no período.' : undefined,
      sparkline: sparkSessions,
    },
    {
      id: 'app_opens',
      label: 'Aberturas do Aplicativo',
      value: currSum.appOpens,
      formattedValue: currSum.appOpens.toLocaleString('pt-BR'),
      previousValue: prevSum.appOpens,
      deltaPercent: computeDeltaPct(currSum.appOpens, prevSum.appOpens),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkOpens,
    },
    {
      id: 'installs_detected',
      label: 'Instalações Detectadas (OS)',
      value: currSum.installsDetected,
      formattedValue: currSum.installsDetected.toLocaleString('pt-BR'),
      previousValue: prevSum.installsDetected,
      deltaPercent: computeDeltaPct(currSum.installsDetected, prevSum.installsDetected),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkInstalls,
    },
    {
      id: 'installs_estimated',
      label: 'Instalações Estimadas (Acumulado)',
      value: installsEstimatedTotal,
      formattedValue: installsEstimatedTotal.toLocaleString('pt-BR'),
      previousValue: null,
      deltaPercent: null,
      unit: 'number',
      confidence: 'estimated',
      sparkline: sparkPwaOpens,
    },
    {
      id: 'pwa_standalone_sessions',
      label: 'Sessões em Modo PWA',
      value: pwaSessionsCurr,
      formattedValue: pwaSessionsCurr.toLocaleString('pt-BR'),
      previousValue: pwaSessionsPrev,
      deltaPercent: computeDeltaPct(pwaSessionsCurr, pwaSessionsPrev),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkPwaOpens,
    },
    {
      id: 'devotionals_started',
      label: 'Devocionais Iniciados',
      value: currSum.devotionalsOpened,
      formattedValue: currSum.devotionalsOpened.toLocaleString('pt-BR'),
      previousValue: prevSum.devotionalsOpened,
      deltaPercent: computeDeltaPct(currSum.devotionalsOpened, prevSum.devotionalsOpened),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkDevOpened,
    },
    {
      id: 'devotionals_completed',
      label: 'Devocionais Concluídos',
      value: currSum.readingsCompleted,
      formattedValue: currSum.readingsCompleted.toLocaleString('pt-BR'),
      previousValue: prevSum.readingsCompleted,
      deltaPercent: computeDeltaPct(currSum.readingsCompleted, prevSum.readingsCompleted),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkReadings,
    },
    {
      id: 'reading_completion_rate',
      label: 'Taxa de Conclusão de Leitura',
      value: readingCompletionRateCurr,
      formattedValue:
        readingCompletionRateCurr !== null
          ? `${readingCompletionRateCurr}%`
          : 'Aguardando leituras',
      previousValue: readingCompletionRatePrev,
      deltaPercent: computeDeltaPct(readingCompletionRateCurr, readingCompletionRatePrev),
      unit: 'percent',
      confidence: readingCompletionRateCurr !== null ? 'confirmed' : 'unavailable',
      unavailableReason:
        readingCompletionRateCurr === null
          ? 'Nenhum devocional aberto no período selecionado.'
          : undefined,
      sparkline: sparkReadings,
    },
    {
      id: 'verses_viewed',
      label: 'Versículos Visualizados',
      value: currSum.versesViewed,
      formattedValue: currSum.versesViewed.toLocaleString('pt-BR'),
      previousValue: prevSum.versesViewed,
      deltaPercent: computeDeltaPct(currSum.versesViewed, prevSum.versesViewed),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkVerses,
    },
    {
      id: 'verses_shared',
      label: 'Versículos Compartilhados',
      value: currSum.verseSharesCompleted,
      formattedValue: currSum.verseSharesCompleted.toLocaleString('pt-BR'),
      previousValue: prevSum.verseSharesCompleted,
      deltaPercent: computeDeltaPct(
        currSum.verseSharesCompleted,
        prevSum.verseSharesCompleted
      ),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkShares,
    },
    {
      id: 'devotionals_shared',
      label: 'Devocionais Compartilhados',
      value: currSum.devotionalSharesCompleted,
      formattedValue: currSum.devotionalSharesCompleted.toLocaleString('pt-BR'),
      previousValue: prevSum.devotionalSharesCompleted,
      deltaPercent: computeDeltaPct(
        currSum.devotionalSharesCompleted,
        prevSum.devotionalSharesCompleted
      ),
      unit: 'number',
      confidence: 'confirmed',
      sparkline: sparkShares,
    },
    {
      id: 'return_rate',
      label: 'Taxa de Retorno Geral',
      value: returnRatePct,
      formattedValue: returnRatePct !== null ? `${returnRatePct}%` : 'Sem base',
      previousValue: null,
      deltaPercent: null,
      unit: 'percent',
      confidence: returnRatePct !== null ? 'confirmed' : 'unavailable',
      unavailableReason:
        returnRatePct === null ? 'Sem visitantes acumulados suficientes.' : undefined,
      sparkline: sparkVisitors,
    },
    {
      id: 'retention_d1_d7_d30',
      label: 'Retenção D1 / D7 / D30',
      value: retD1.rate,
      formattedValue:
        retD1.rate !== null || retD7.rate !== null || retD30.rate !== null
          ? `${retD1.rate !== null ? `${retD1.rate}%` : '—'} / ${
              retD7.rate !== null ? `${retD7.rate}%` : '—'
            } / ${retD30.rate !== null ? `${retD30.rate}%` : '—'}`
          : 'Coorte em maturação',
      previousValue: null,
      deltaPercent: null,
      unit: 'percent',
      confidence:
        retD1.rate !== null || retD7.rate !== null || retD30.rate !== null
          ? 'confirmed'
          : 'unavailable',
      unavailableReason:
        retD1.rate === null && retD7.rate === null && retD30.rate === null
          ? 'As coortes iniciais ainda não completaram 24h desde o primeiro acesso.'
          : undefined,
      sparkline: sparkVisitors,
    },
  ];

  // ---------- Seção 4: Funil da Página de Instalação e Dispositivos ----------
  const landingVisitors = new Set<string>();
  const landingInteractedVisitors = new Set<string>();
  const clickedInstallVisitors = new Set<string>();
  const detectedInstallVisitors = new Set<string>();
  const standaloneOpenedVisitors = new Set<string>();
  const completedReadingVisitors = new Set<string>();

  for (const e of eventsInCurrent) {
    if (e.eventName === 'landing_viewed') landingVisitors.add(e.visitorId);
    if (
      e.eventName === 'landing_interacted' ||
      e.eventName === 'landing_cta_clicked' ||
      e.eventName === 'install_tutorial_opened'
    ) {
      landingInteractedVisitors.add(e.visitorId);
    }
    if (
      (e.eventName === 'landing_cta_clicked' && e.properties.cta === 'install') ||
      e.eventName === 'install_prompt_triggered'
    ) {
      clickedInstallVisitors.add(e.visitorId);
    }
    if (e.eventName === 'pwa_appinstalled_detected') {
      detectedInstallVisitors.add(e.visitorId);
    }
    if (e.isStandalone || e.eventName === 'pwa_standalone_opened') {
      standaloneOpenedVisitors.add(e.visitorId);
    }
    if (e.eventName === 'devotional_completed') {
      completedReadingVisitors.add(e.visitorId);
    }
  }

  // Distribuições por Dispositivo, SO e Navegador
  const byDeviceType: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  const byOS: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const tutorialTabClicks: Record<string, number> = {
    android: 0,
    ios: 0,
    desktop: 0,
  };

  for (const vid of currVisitorIds) {
    const v = db.visitors[vid];
    if (!v) continue;
    byDeviceType[v.deviceType] = (byDeviceType[v.deviceType] || 0) + 1;
    byOS[v.os] = (byOS[v.os] || 0) + 1;
    byBrowser[v.browser] = (byBrowser[v.browser] || 0) + 1;
  }

  for (const e of eventsInCurrent) {
    if (e.eventName === 'install_tutorial_tab_changed' && e.properties.platform) {
      const p = String(e.properties.platform);
      tutorialTabClicks[p] = (tutorialTabClicks[p] || 0) + 1;
    }
  }

  // ---------- Seção 5: Leituras, Devocionais, Heatmap 24x7, Configurações ----------
  // Heatmap de horários (7 dias da semana x 24 horas)
  const readingHeatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0)
  );
  const devotionalStatsMap: Record<
    string,
    {
      devotionalId: string;
      date: string;
      title: string;
      theme: string;
      openedCount: number;
      startedCount: number;
      completedCount: number;
      sharedCount: number;
      favoritedCount: number;
    }
  > = {};

  const verseStatsMap: Record<
    string,
    {
      reference: string;
      category: string;
      views: number;
      clicks: number;
      imagesGenerated: number;
      imagesDownloaded: number;
      textCopied: number;
      sharesInitiated: number;
      sharesCompleted: number;
    }
  > = {};

  const themePreferencesCount: Record<string, number> = {
    light: 0,
    dark: 0,
    auto: 0,
  };
  const fontSizeDistribution: Record<string, number> = {};
  let offlineEventsCapturedCount = 0;
  let settingsChangesCount = 0;
  let settingsErrorsCount = 0;

  for (const e of eventsInCurrent) {
    if (e.isOfflineAtCapture) {
      offlineEventsCapturedCount++;
    }

    if (e.eventName === 'devotional_completed' || e.eventName === 'devotional_opened') {
      readingHeatmap[e.dayOfWeek][e.hourOfDay] += 1;
    }

    // Ranking de Devocionais
    if (
      e.eventName === 'devotional_opened' ||
      e.eventName === 'reading_started' ||
      e.eventName === 'devotional_completed' ||
      e.eventName === 'devotional_favorited' ||
      (e.eventName === 'share_completed' && e.properties.content_type === 'devotional')
    ) {
      const devId = String(e.properties.devotional_id || e.properties.date || e.dateStr);
      if (!devotionalStatsMap[devId]) {
        devotionalStatsMap[devId] = {
          devotionalId: devId,
          date: String(e.properties.date || e.dateStr),
          title: String(e.properties.title || `Devocional ${e.dateStr}`),
          theme: String(e.properties.theme || 'Edificação'),
          openedCount: 0,
          startedCount: 0,
          completedCount: 0,
          sharedCount: 0,
          favoritedCount: 0,
        };
      }
      const st = devotionalStatsMap[devId];
      if (e.properties.title) st.title = String(e.properties.title);
      if (e.properties.theme) st.theme = String(e.properties.theme);
      if (e.eventName === 'devotional_opened') st.openedCount++;
      if (e.eventName === 'reading_started') st.startedCount++;
      if (e.eventName === 'devotional_completed') st.completedCount++;
      if (e.eventName === 'devotional_favorited') st.favoritedCount++;
      if (e.eventName === 'share_completed') st.sharedCount++;
    }

    // Ranking de Versículos
    if (
      e.eventName === 'verse_viewed' ||
      e.eventName === 'verse_clicked' ||
      e.eventName === 'verse_image_generated' ||
      e.eventName === 'verse_image_downloaded' ||
      e.eventName === 'verse_text_copied' ||
      e.eventName === 'share_initiated' ||
      e.eventName === 'share_completed'
    ) {
      const ref = String(e.properties.reference || 'Versículo do Dia');
      if (!verseStatsMap[ref]) {
        verseStatsMap[ref] = {
          reference: ref,
          category: String(e.properties.category || 'Geral'),
          views: 0,
          clicks: 0,
          imagesGenerated: 0,
          imagesDownloaded: 0,
          textCopied: 0,
          sharesInitiated: 0,
          sharesCompleted: 0,
        };
      }
      const vs = verseStatsMap[ref];
      if (e.eventName === 'verse_viewed') vs.views++;
      if (e.eventName === 'verse_clicked') vs.clicks++;
      if (e.eventName === 'verse_image_generated') vs.imagesGenerated++;
      if (e.eventName === 'verse_image_downloaded') vs.imagesDownloaded++;
      if (e.eventName === 'verse_text_copied') vs.textCopied++;
      if (e.eventName === 'share_initiated') vs.sharesInitiated++;
      if (e.eventName === 'share_completed') vs.sharesCompleted++;
    }

    // Estatísticas agregadas de Configurações (Seção 5.5)
    if (e.eventName === 'settings_changed') {
      settingsChangesCount++;
      const setting = String(e.properties.setting || '');
      const val = String(e.properties.value || '');
      if (setting === 'theme' && (val === 'light' || val === 'dark' || val === 'auto')) {
        themePreferencesCount[val] = (themePreferencesCount[val] || 0) + 1;
      } else if (setting === 'font_size' && val) {
        fontSizeDistribution[val] = (fontSizeDistribution[val] || 0) + 1;
      }
    }
    if (e.eventName === 'settings_error') {
      settingsErrorsCount++;
    }
  }

  const avgReadingTimeSec =
    currSum.readingDurationCount > 0
      ? Math.round(currSum.readingDurationTotalSec / currSum.readingDurationCount)
      : null;

  // Distribuição de Sequência de Leitura (Streaks) e Frequência
  const streakBuckets = { '1 dia': 0, '2-3 dias': 0, '4-6 dias': 0, '7+ dias': 0 };
  for (const v of visitorsAll) {
    const daysCount = v.activeDates.length;
    if (daysCount <= 1) streakBuckets['1 dia']++;
    else if (daysCount <= 3) streakBuckets['2-3 dias']++;
    else if (daysCount <= 6) streakBuckets['4-6 dias']++;
    else streakBuckets['7+ dias']++;
  }

  // ---------- Seção 6: Matriz de Coortes (Por Data de Aquisição e Por Dia da Semana) ----------
  const cohortsByDateMap: Record<string, StoredVisitorSummary[]> = {};
  const cohortsByWeekdayMap: Record<number, StoredVisitorSummary[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  for (const v of visitorsAll) {
    if (!cohortsByDateMap[v.firstSeenDate]) {
      cohortsByDateMap[v.firstSeenDate] = [];
    }
    cohortsByDateMap[v.firstSeenDate].push(v);
    const wk = v.firstSeenDayOfWeek ?? 0;
    if (!cohortsByWeekdayMap[wk]) cohortsByWeekdayMap[wk] = [];
    cohortsByWeekdayMap[wk].push(v);
  }

  function calcCohortRetentionPct(
    group: StoredVisitorSummary[],
    offsetDays: number
  ): number | null {
    let eligible = 0;
    let retained = 0;
    for (const v of group) {
      const target = shiftDate(v.firstSeenDate, offsetDays);
      if (target <= todayStr) {
        eligible++;
        if (v.activeDates.includes(target)) retained++;
      }
    }
    if (eligible === 0) return null;
    return Number(((retained / eligible) * 100).toFixed(1));
  }

  const dateCohorts: CohortRow[] = Object.keys(cohortsByDateMap)
    .sort()
    .slice(-12)
    .reverse()
    .map((dateKey) => {
      const group = cohortsByDateMap[dateKey];
      const wkIdx = group[0]?.firstSeenDayOfWeek ?? 0;
      return {
        cohortLabel: dateKey,
        cohortDateRange: dateKey,
        dayOfWeekLabel: WEEKDAY_NAMES[wkIdx] || '',
        usersCount: group.length,
        d1: calcCohortRetentionPct(group, 1),
        d3: calcCohortRetentionPct(group, 3),
        d7: calcCohortRetentionPct(group, 7),
        d14: calcCohortRetentionPct(group, 14),
        d30: calcCohortRetentionPct(group, 30),
      };
    });

  const weekdayCohorts: CohortRow[] = [1, 2, 3, 4, 5, 6, 0].map((wkIdx) => {
    const group = cohortsByWeekdayMap[wkIdx] || [];
    return {
      cohortLabel: WEEKDAY_NAMES[wkIdx],
      cohortDateRange: 'Todas as semanas',
      dayOfWeekLabel: WEEKDAY_NAMES[wkIdx],
      usersCount: group.length,
      d1: calcCohortRetentionPct(group, 1),
      d3: calcCohortRetentionPct(group, 3),
      d7: calcCohortRetentionPct(group, 7),
      d14: calcCohortRetentionPct(group, 14),
      d30: calcCohortRetentionPct(group, 30),
    };
  });

  // Usuários que deixaram de retornar (inativos nos últimos 7 dias mas que visitaram antes)
  const churnedUsersCount = visitorsAll.filter(
    (v) => v.lastSeenDate < date7dAgo
  ).length;

  // ---------- Seção 7: Aquisição & Campanhas UTM ----------
  const acquisitionMap: Record<
    string,
    {
      key: string;
      source: string;
      medium: string;
      campaign: string;
      visits: number;
      uniqueVisitors: Set<string>;
      installsOrStandalone: Set<string>;
      readingsCompleted: number;
      sharesCompleted: number;
      retainedVisitors: Set<string>;
    }
  > = {};

  for (const s of sessionsInCurrent) {
    const src = s.utmSource || s.referrerCategory || 'direct';
    const med = s.utmMedium || (s.referrerCategory === 'direct' ? 'none' : 'referral');
    const camp = s.utmCampaign || '(not set)';
    const key = `${src}|${med}|${camp}`;
    if (!acquisitionMap[key]) {
      acquisitionMap[key] = {
        key,
        source: src,
        medium: med,
        campaign: camp,
        visits: 0,
        uniqueVisitors: new Set(),
        installsOrStandalone: new Set(),
        readingsCompleted: 0,
        sharesCompleted: 0,
        retainedVisitors: new Set(),
      };
    }
    const row = acquisitionMap[key];
    row.visits += 1;
    row.uniqueVisitors.add(s.visitorId);
    if (s.isStandalone || s.clickedInstall) {
      row.installsOrStandalone.add(s.visitorId);
    }
    if (s.completedReading) {
      row.readingsCompleted += 1;
    }
    if (s.sharedContent) {
      row.sharesCompleted += 1;
    }
    const v = db.visitors[s.visitorId];
    if (v && v.activeDates.length >= 2) {
      row.retainedVisitors.add(s.visitorId);
    }
  }

  const acquisitionReport = Object.values(acquisitionMap)
    .map((r) => ({
      source: r.source,
      medium: r.medium,
      campaign: r.campaign,
      visits: r.visits,
      uniqueVisitors: r.uniqueVisitors.size,
      conversions: r.installsOrStandalone.size,
      readingsCompleted: r.readingsCompleted,
      sharesCompleted: r.sharesCompleted,
      retentionRatePct:
        r.uniqueVisitors.size > 0
          ? Number(((r.retainedVisitors.size / r.uniqueVisitors.size) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  // ---------- Seção 8: Funis de Conversão Predefinidos e Customizáveis ----------
  function buildFunnelSteps(
    stepsSpec: Array<{ key: string; label: string; matcher: (e: any) => boolean }>
  ): FunnelStepResult[] {
    const stepSets = stepsSpec.map(() => new Set<string>());
    for (const e of eventsInCurrent) {
      for (let i = 0; i < stepsSpec.length; i++) {
        if (stepsSpec[i].matcher(e)) {
          stepSets[i].add(e.visitorId);
        }
      }
    }

    // Garante progressão de funil (usuário na etapa i também passou ou é contabilizado sequencialmente)
    const counts = stepSets.map((s) => s.size);
    const startCount = counts[0] || 0;

    return stepsSpec.map((spec, idx) => {
      const currCount = counts[idx];
      const prevCount = idx === 0 ? currCount : counts[idx - 1];
      const convStart =
        startCount > 0 ? Number(((currCount / startCount) * 100).toFixed(1)) : 0;
      const convPrev =
        prevCount > 0 ? Number(((currCount / prevCount) * 100).toFixed(1)) : 0;
      const dropOffCount = idx === 0 ? 0 : Math.max(0, prevCount - currCount);
      const dropOffPct =
        idx === 0 || prevCount === 0
          ? 0
          : Number(((dropOffCount / prevCount) * 100).toFixed(1));
      return {
        stepIndex: idx + 1,
        eventKey: spec.key,
        label: spec.label,
        usersCount: currCount,
        conversionFromStartPct: convStart,
        conversionFromPrevPct: idx === 0 ? 100 : convPrev,
        dropOffCount,
        dropOffPct,
      };
    });
  }

  const acquisitionFunnel = buildFunnelSteps([
    {
      key: 'visited',
      label: '1. Visitou a Página / App',
      matcher: (e) =>
        e.eventName === 'landing_viewed' ||
        e.eventName === 'app_opened' ||
        e.eventName === 'page_viewed',
    },
    {
      key: 'clicked_install',
      label: '2. Clicou em Instalar / Abriu Tutorial',
      matcher: (e) =>
        (e.eventName === 'landing_cta_clicked' && e.properties.cta === 'install') ||
        e.eventName === 'install_prompt_triggered' ||
        e.eventName === 'install_tutorial_opened',
    },
    {
      key: 'opened_pwa',
      label: '3. Abriu em Modo PWA (Standalone)',
      matcher: (e) => e.isStandalone || e.eventName === 'pwa_standalone_opened',
    },
    {
      key: 'completed_reading',
      label: '4. Confirmou Leitura pelo Botão',
      matcher: (e) => e.eventName === 'devotional_completed',
    },
  ]);

  const engagementFunnel = buildFunnelSteps([
    {
      key: 'app_opened',
      label: '1. Abriu o Aplicativo',
      matcher: (e) => e.eventName === 'app_opened' || e.eventName === 'page_viewed',
    },
    {
      key: 'devotional_opened',
      label: '2. Abriu o Devocional',
      matcher: (e) =>
        e.eventName === 'devotional_opened' || e.eventName === 'reading_started',
    },
    {
      key: 'devotional_completed',
      label: '3. Confirmou a Leitura',
      matcher: (e) => e.eventName === 'devotional_completed',
    },
    {
      key: 'shared',
      label: '4. Compartilhou Conteúdo',
      matcher: (e) =>
        e.eventName === 'share_initiated' || e.eventName === 'share_completed',
    },
  ]);

  const viralFunnel = buildFunnelSteps([
    {
      key: 'verse_viewed',
      label: '1. Visualizou Versículo do Dia',
      matcher: (e) => e.eventName === 'verse_viewed',
    },
    {
      key: 'image_generated',
      label: '2. Gerou Imagem de Compartilhamento',
      matcher: (e) => e.eventName === 'verse_image_generated',
    },
    {
      key: 'share_initiated',
      label: '3. Iniciou Compartilhamento',
      matcher: (e) =>
        e.eventName === 'share_initiated' || e.eventName === 'share_completed',
    },
    {
      key: 'share_referral_visit',
      label: '4. Visitante Chegou via Link Rastreável (?utm_medium=share)',
      matcher: (e) =>
        e.referrerCategory === 'share_link' || e.utmMedium === 'share',
    },
  ]);

  // ---------- Seção 9: Monitoramento Técnico & Web Vitals ----------
  const techInPeriod = db.technicalRecords.filter(
    (t) => t.dateStr >= startDate && t.dateStr <= endDate
  );
  const errorsList = techInPeriod.filter((t) => t.kind === 'error').slice(-50).reverse();
  const vitalsList = techInPeriod.filter((t) => t.kind === 'vital');

  const pageLoadSamples = vitalsList
    .filter((v) => v.vitalName === 'PAGE_LOAD' && typeof v.vitalValueMs === 'number')
    .map((v) => v.vitalValueMs!);
  const fcpSamples = vitalsList
    .filter((v) => v.vitalName === 'FCP' && typeof v.vitalValueMs === 'number')
    .map((v) => v.vitalValueMs!);
  const ttfbSamples = vitalsList
    .filter((v) => typeof v.ttfbMs === 'number')
    .map((v) => v.ttfbMs!);

  const avgPageLoadMs =
    pageLoadSamples.length > 0
      ? Math.round(pageLoadSamples.reduce((a, b) => a + b, 0) / pageLoadSamples.length)
      : null;
  const avgFcpMs =
    fcpSamples.length > 0
      ? Math.round(fcpSamples.reduce((a, b) => a + b, 0) / fcpSamples.length)
      : null;
  const avgTtfbMs =
    ttfbSamples.length > 0
      ? Math.round(ttfbSamples.reduce((a, b) => a + b, 0) / ttfbSamples.length)
      : null;

  const versionsDistribution: Record<string, { sessions: number; errors: number }> = {};
  for (const s of sessionsInCurrent) {
    // find version from events
    const ev = eventsInCurrent.find((e) => e.sessionId === s.sessionId);
    const ver = ev?.appVersion || '2.2.1';
    if (!versionsDistribution[ver]) {
      versionsDistribution[ver] = { sessions: 0, errors: 0 };
    }
    versionsDistribution[ver].sessions += 1;
  }
  for (const err of errorsList) {
    const ver = err.appVersion || '2.2.1';
    if (!versionsDistribution[ver]) {
      versionsDistribution[ver] = { sessions: 0, errors: 0 };
    }
    versionsDistribution[ver].errors += 1;
  }

  // ---------- Seção 15: Tempo Real (Atividade Recente Anônima) ----------
  const recentEvents = db.events
    .slice(-45)
    .reverse()
    .map((e) => ({
      eventId: e.eventId,
      eventName: e.eventName,
      occurredAt: e.occurredAt,
      receivedAt: e.receivedAt,
      wasOfflineSynced:
        Math.abs(
          new Date(e.receivedAt).getTime() - new Date(e.occurredAt).getTime()
        ) > 30000 || e.isOfflineAtCapture,
      isStandalone: e.isStandalone,
      deviceType: e.deviceType,
      os: e.os,
      browser: e.browser,
      referrerCategory: e.referrerCategory,
      appVersion: e.appVersion,
      summary: summarizeEventForFeed(e.eventName, e.properties),
    }));

  // ---------- Seção 16: Resumo Automático Baseado em Regras e Dados Reais ----------
  const automatedInsights: string[] = [];
  const readingsDelta = computeDeltaPct(
    currSum.readingsCompleted,
    prevSum.readingsCompleted
  );
  if (readingsDelta !== null && currSum.readingsCompleted > 0 && prevSum.readingsCompleted > 0) {
    if (readingsDelta > 0) {
      automatedInsights.push(
        `As leituras confirmadas cresceram ${readingsDelta}% em relação ao período anterior (${currSum.readingsCompleted} vs ${prevSum.readingsCompleted}).`
      );
    } else if (readingsDelta < 0) {
      automatedInsights.push(
        `As leituras confirmadas recuaram ${Math.abs(readingsDelta)}% em relação ao período anterior (${currSum.readingsCompleted} vs ${prevSum.readingsCompleted}).`
      );
    }
  }
  if (readingCompletionRateCurr !== null && currSum.devotionalsOpened > 0) {
    automatedInsights.push(
      `A taxa de conclusão real de leitura no período é de ${readingCompletionRateCurr}% (${currSum.readingsCompleted} confirmações em ${currSum.devotionalsOpened} aberturas de devocional).`
    );
  }
  if (acquisitionReport.length > 0 && acquisitionReport[0].visits > 0) {
    const topSrc = acquisitionReport[0];
    automatedInsights.push(
      `O principal canal de aquisição no período foi "${topSrc.source}" (${topSrc.medium}) com ${topSrc.visits} sessões e ${topSrc.readingsCompleted} leituras confirmadas.`
    );
  }
  if (pwaSessionsCurr > 0 && sessionsInCurrent.length > 0) {
    const pwaPct = Math.round((pwaSessionsCurr / sessionsInCurrent.length) * 100);
    automatedInsights.push(
      `${pwaPct}% das sessões registradas ocorreram diretamente pelo aplicativo PWA instalado na tela inicial (${pwaSessionsCurr} de ${sessionsInCurrent.length} sessões).`
    );
  }
  if (automatedInsights.length === 0) {
    automatedInsights.push(
      'O coletor analítico está ativo e validando eventos reais sob consentimento LGPD. Novos insights comparativos aparecerão automaticamente conforme o volume histórico do período crescer.'
    );
  }

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      storageBackend: getAnalyticsStorageBackendName(),
      period: {
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        days: windowLen,
      },
      totalRawEventsStored: db.events.length,
      totalVisitorsStored: visitorsAll.length,
      totalSessionsStored: sessionsAll.length,
      activePushSubscriptionsCount,
      retentionDaysPolicy: db.settings.retentionDays,
      policyVersion: db.settings.policyVersion,
    },
    overviewKPIs,
    timeSeries,
    realtime: {
      activeNowCount,
      definition:
        'Visitantes distintos com consentimento ativo que enviaram eventos nos últimos 5 minutos.',
      recentOpensCount: db.events.filter(
        (e) => e.occurredAt >= fiveMinAgoIso && e.eventName === 'app_opened'
      ).length,
      recentReadingsCount: db.events.filter(
        (e) => e.occurredAt >= fiveMinAgoIso && e.eventName === 'devotional_completed'
      ).length,
      recentSharesCount: db.events.filter(
        (e) =>
          e.occurredAt >= fiveMinAgoIso &&
          (e.eventName === 'share_initiated' || e.eventName === 'share_completed')
      ).length,
      recentInstallsCount: db.events.filter(
        (e) =>
          e.occurredAt >= fiveMinAgoIso && e.eventName === 'pwa_appinstalled_detected'
      ).length,
      recentEvents,
      recentErrors: errorsList.slice(0, 10),
    },
    acquisition: {
      rows: acquisitionReport,
      savedCampaigns: db.campaigns,
    },
    installations: {
      funnel: [
        {
          step: 'Visitou a Landing Page',
          count: landingVisitors.size,
          classification: 'confirmed',
        },
        {
          step: 'Interagiu / Abriu Ajuda de Instalação',
          count: landingInteractedVisitors.size,
          classification: 'confirmed',
        },
        {
          step: 'Clicou em Instalar Aplicativo',
          count: clickedInstallVisitors.size,
          classification: 'confirmed',
        },
        {
          step: 'Instalação Detectada pelo SO (appinstalled)',
          count: detectedInstallVisitors.size,
          classification: 'confirmed',
        },
        {
          step: 'Abriu a PWA Instalada (Modo Standalone)',
          count: standaloneOpenedVisitors.size,
          classification: 'confirmed',
        },
        {
          step: 'Confirmou Leitura de Devocional',
          count: completedReadingVisitors.size,
          classification: 'confirmed',
        },
      ],
      separation: {
        detectedInstallsTotal: Math.max(
          detectedInstallVisitorsTotal,
          currSum.installsDetected
        ),
        standaloneDevicesTotal: standaloneVisitorsTotal,
        estimatedInstallsTotal: installsEstimatedTotal,
        activePushDevicesTotal: activePushSubscriptionsCount,
      },
      tutorialTabClicks,
      byDeviceType,
      byOS,
      byBrowser,
    },
    readings: {
      devotionalsOpened: currSum.devotionalsOpened,
      readingsStarted: currSum.readingsStarted,
      readingsCompleted: currSum.readingsCompleted,
      repeatConfirmations: currSum.readingRepeatConfirmations,
      completionRatePct: readingCompletionRateCurr,
      avgReadingTimeSec,
      byHourReadings: currSum.byHourReadings,
      byHourOpens: currSum.byHourOpens,
      heatmap7x24: readingHeatmap,
      streakBuckets,
      topDevotionals: Object.values(devotionalStatsMap).sort(
        (a, b) => b.completedCount - a.completedCount || b.openedCount - a.openedCount
      ),
    },
    versesAndSharing: {
      versesViewed: currSum.versesViewed,
      versesClicked: currSum.versesClicked,
      imagesGenerated: currSum.verseImagesGenerated,
      imagesDownloaded: currSum.verseImagesDownloaded,
      textCopied: currSum.verseTextCopied,
      sharesInitiated: currSum.sharesInitiated,
      sharesCompleted: currSum.sharesCompleted,
      verseSharesCompleted: currSum.verseSharesCompleted,
      devotionalSharesCompleted: currSum.devotionalSharesCompleted,
      shareRatePct:
        currSum.versesViewed > 0
          ? Number(
              ((currSum.sharesCompleted / currSum.versesViewed) * 100).toFixed(1)
            )
          : null,
      topVerses: Object.values(verseStatsMap).sort(
        (a, b) => b.sharesCompleted - a.sharesCompleted || b.views - a.views
      ),
    },
    notifications: {
      activePushSubscriptions: activePushSubscriptionsCount,
      permissionGrantedInPeriod: currSum.notifPermissionGranted,
      permissionDeniedInPeriod: currSum.notifPermissionDenied,
      scheduledInPeriod: currSum.notifScheduled,
      openedInPeriod: currSum.notifOpened,
      convertedToReadingInPeriod: currSum.notifConvertedReading,
      disabledInPeriod: currSum.notifDisabled,
    },
    settingsStats: {
      themePreferencesCount,
      fontSizeDistribution,
      offlineEventsCapturedCount,
      settingsChangesCount,
      settingsErrorsCount,
    },
    retention: {
      dau,
      wau,
      mau,
      stickinessPct,
      retD1,
      retD3,
      retD7,
      retD14,
      retD30,
      newVisitors: newVisitorsCurr,
      returningVisitors: returningVisitorsCurr,
      churnedUsersCount,
      dateCohorts,
      weekdayCohorts,
    },
    funnels: {
      predefined: {
        acquisition: acquisitionFunnel,
        engagement: engagementFunnel,
        viral: viralFunnel,
      },
    },
    technicalHealth: {
      avgPageLoadMs,
      avgFcpMs,
      avgTtfbMs,
      totalErrorsInPeriod: currSum.errorsCount,
      offlineSyncedEventsCount: offlineEventsCapturedCount,
      versionsDistribution,
      recentErrors: errorsList,
    },
    automatedInsights,
    governance: {
      consentAuditCount: db.consentAudit.length,
      recentConsentAudit: db.consentAudit.slice(-15).reverse(),
      recentSecurityAudit: db.securityAudit.slice(-15).reverse(),
      settings: db.settings,
    },
  };
}

function summarizeEventForFeed(
  name: string,
  props: Record<string, any>
): string {
  switch (name) {
    case 'landing_viewed':
      return 'Visualizou a página de apresentação';
    case 'landing_cta_clicked':
      return `Clicou em CTA na Landing (${props.cta || 'ação'})`;
    case 'install_tutorial_opened':
      return 'Abriu o tutorial de instalação';
    case 'pwa_appinstalled_detected':
      return 'Instalação da PWA confirmada pelo sistema operacional';
    case 'app_opened':
      return `Abriu o aplicativo (${props.mode === 'standalone' ? 'PWA Instalada' : 'Navegador'})`;
    case 'pwa_standalone_opened':
      return 'Iniciou sessão em modo PWA Standalone';
    case 'page_viewed':
      return `Navegou para a aba "${props.view || 'home'}"`;
    case 'devotional_opened':
      return `Abriu o devocional (${props.date || 'hoje'})`;
    case 'reading_started':
      return `Iniciou leitura do devocional (${props.date || 'hoje'})`;
    case 'devotional_completed':
      return `Confirmou conclusão da leitura (${props.date || 'hoje'})`;
    case 'verse_viewed':
      return `Visualizou o Versículo do Dia (${props.reference || ''})`;
    case 'verse_image_generated':
      return `Gerou imagem 1080x1350 (${props.reference || ''})`;
    case 'share_initiated':
      return `Iniciou compartilhamento (${props.content_type || 'versículo'})`;
    case 'share_completed':
      return `Concluiu compartilhamento (${props.result || 'enviado'})`;
    case 'notification_opened':
      return 'Abriu o app a partir de uma notificação';
    case 'notification_converted_reading':
      return 'Concluiu leitura após abrir notificação';
    default:
      return name;
  }
}
