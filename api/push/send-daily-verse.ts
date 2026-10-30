import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import { getAllSubscriptions, updateSubscription, removeSubscription } from './_store';
import { selectDailyVerse, getSaoPauloDateString } from '../../src/services/daily-verse/selection-engine';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Verify Cron / Admin secret if configured
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Não autorizado' }));
    return;
  }

  const todayStr = getSaoPauloDateString();
  const verse = selectDailyVerse(todayStr);

  // Configure VAPID
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@amanhecer.app';

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  const subscriptions = getAllSubscriptions();
  const results = {
    total: subscriptions.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    cleaned: 0,
  };

  const payload = JSON.stringify({
    title: '☀️ Versículo do Dia',
    body: `${verse.reference} — "${verse.text.slice(0, 110)}${verse.text.length > 110 ? '...' : ''}"`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: `/?date=${todayStr}&source=push-verse`,
      date: todayStr,
      type: 'daily-verse'
    }
  });

  for (const sub of subscriptions) {
    // 1. Consent check
    if (!sub.dailyVerseEnabled) {
      results.skipped++;
      continue;
    }

    // 2. Idempotency check: Already sent today?
    if (sub.lastVerseSentDate === todayStr) {
      results.skipped++;
      continue;
    }

    // 3. Send Web Push
    try {
      if (vapidPublicKey && vapidPrivateKey) {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, payload);
      }
      sub.lastVerseSentDate = todayStr;
      updateSubscription(sub);
      results.sent++;
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Expired subscription - remove clean
        removeSubscription(sub.endpoint);
        results.cleaned++;
      } else {
        results.failed++;
      }
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    date: todayStr,
    verse: verse.reference,
    results
  }));
}
