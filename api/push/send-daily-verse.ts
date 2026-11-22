import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import {
  getAllSubscriptions,
  updateSubscription,
  removeSubscription,
  getStorageMode,
} from './_store.js';
import { selectDailyVerse, getSaoPauloDateString } from './_verse.js';

function getSaoPauloClock(): { hour: number; minute: number; totalMinutes: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = parseInt(map.hour || '0', 10) % 24;
  const minute = parseInt(map.minute || '0', 10);
  return { hour, minute, totalMinutes: hour * 60 + minute };
}

export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  // Verify Cron / Admin secret if configured
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Não autorizado' }));
    return;
  }

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const forceManual = urlObj.searchParams.get('force') === '1';

  const todayStr = getSaoPauloDateString();
  const { hour, minute, totalMinutes } = getSaoPauloClock();

  // Janela estrita para disparo automático do Versículo do Dia (06:00 às 08:30 BRT)
  // Evita que crons atrasados do GitHub Actions enviem o versículo matinal à tarde ou à noite.
  const isWithinMorningWindow = totalMinutes >= 6 * 60 && totalMinutes <= 8 * 60 + 30;
  if (!forceManual && !isWithinMorningWindow) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        skippedOutOfWindow: true,
        saoPauloTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        reason:
          'Disparo ignorado porque o horário atual de Brasília está fora da janela matinal (06:00–08:30).',
      })
    );
    return;
  }

  const verse = selectDailyVerse(todayStr);

  // Configure VAPID (sanitize any accidental quotes or whitespace from Env Vars)
  const clean = (v?: string) => (v || '').replace(/["'\s]/g, '').trim();
  const vapidPublicKey =
    clean(process.env.VAPID_PUBLIC_KEY) ||
    clean(process.env.VITE_VAPID_PUBLIC_KEY) ||
    'BL-tTNbq9Aie-CPWNHJbseDn8QmCEUaO5tpsJRo_6bcvOuBg9b4dmIZIe1gvmiebzNiaWfYtFI3RHoTy5ZwLvRk';
  const vapidPrivateKey = clean(process.env.VAPID_PRIVATE_KEY);
  const vapidSubject = clean(process.env.VAPID_SUBJECT) || 'mailto:contato@amanhecer.app';

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  if (!(vapidPublicKey && vapidPrivateKey)) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: 'VAPID_PRIVATE_KEY não configurada no servidor: nenhum push foi enviado.',
      })
    );
    return;
  }

  const subscriptions = await getAllSubscriptions();
  const results = {
    storage: getStorageMode(),
    saoPauloTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    total: subscriptions.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    cleaned: 0,
  };

  const payload = JSON.stringify({
    title: '☀️ Versículo do Dia',
    body: `${verse.reference} — "${verse.text.slice(0, 110)}${
      verse.text.length > 110 ? '...' : ''
    }"`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `amanhecer-verse-${todayStr}`,
    data: {
      url: `/?date=${todayStr}&source=push-verse`,
      date: todayStr,
      type: 'daily-verse',
    },
  });

  for (const sub of subscriptions) {
    // 1. Consent check
    if (!sub.dailyVerseEnabled) {
      results.skipped++;
      continue;
    }

    // 2. Idempotency check: Already sent today?
    if (!forceManual && sub.lastVerseSentDate === todayStr) {
      results.skipped++;
      continue;
    }

    // 3. Send Web Push (TTL de 3 horas para nunca entregar versículo matinal à noite)
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload,
        {
          TTL: 10800,
          urgency: 'high',
        }
      );
      sub.lastVerseSentDate = todayStr;
      await updateSubscription(sub);
      results.sent++;
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removeSubscription(sub.endpoint);
        results.cleaned++;
      } else {
        results.failed++;
      }
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: true,
      date: todayStr,
      verse: verse.reference,
      results,
    })
  );
}
