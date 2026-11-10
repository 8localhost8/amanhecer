import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import { getAllSubscriptions, updateSubscription, removeSubscription, getStorageMode } from './_store.js';
import { getSaoPauloDateString } from './_verse.js';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Authorization
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Não autorizado' }));
    return;
  }

  // Parse slot from query or current hour
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const slotParam = urlObj.searchParams.get('slot'); // e.g. '06:00', '11:00', '16:00', '21:00'

  const nowSP = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const currentHour = nowSP.getHours();

  let activeSlot = slotParam;
  if (!activeSlot) {
    if (currentHour >= 5 && currentHour < 10) activeSlot = '06:00';
    else if (currentHour >= 10 && currentHour < 14) activeSlot = '11:00';
    else if (currentHour >= 14 && currentHour < 19) activeSlot = '16:00';
    else activeSlot = '21:00';
  }

  const todayStr = getSaoPauloDateString();

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
    res.end(JSON.stringify({ success: false, error: 'VAPID_PRIVATE_KEY n?o configurada no servidor: nenhum push foi enviado.' }));
    return;
  }

  const subscriptions = await getAllSubscriptions();
  const results = {
    slot: activeSlot,
    storage: getStorageMode(),
    total: subscriptions.length,
    sent: 0,
    skippedCompleted: 0,
    skippedPreference: 0,
    skippedDuplicate: 0,
    failed: 0,
    cleaned: 0,
  };

  const reminderMessages: Record<string, { title: string; body: string }> = {
    '06:00': {
      title: 'Amanhecer • Bom dia!',
      body: 'Inicie seu dia na presença de Deus. Seu devocional matinal já está disponível.'
    },
    '11:00': {
      title: 'Amanhecer • Pausa do Meio-Dia',
      body: 'Uma pausa serena no meio das tarefas. Reserve alguns minutos para a Palavra e oração.'
    },
    '16:00': {
      title: 'Amanhecer • Fim de Tarde',
      body: 'Refrigere a sua alma neste fim de tarde com uma reflexão bíblica edificante.'
    },
    '21:00': {
      title: 'Amanhecer • Oração da Noite',
      body: 'Entregue as lutas de hoje e descanse na fidelidade de Deus antes de dormir.'
    }
  };

  const message = reminderMessages[activeSlot] || reminderMessages['11:00'];

  const payload = JSON.stringify({
    title: message.title,
    body: message.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: `/?date=${todayStr}&source=push-reminder-${activeSlot}`,
      date: todayStr,
      type: 'reading-reminder',
      slot: activeSlot,
    }
  });

  for (const sub of subscriptions) {
    // 1. Consent check
    if (!sub.reminderEnabled) {
      results.skippedPreference++;
      continue;
    }

    // 2. Coexistence rule: If dailyVerse is enabled and slot is 06:00, 06:06 replaced it!
    if (activeSlot === '06:00' && sub.dailyVerseEnabled) {
      results.skippedPreference++;
      continue;
    }

    // 3. Reading completion check: Has user already read today's devotional?
    if (sub.lastReadDate === todayStr) {
      results.skippedCompleted++;
      continue;
    }

    // 4. Duplicate check for this slot today
    sub.sentRemindersToday = sub.sentRemindersToday || [];
    if (sub.sentRemindersToday.includes(`${todayStr}_${activeSlot}`)) {
      results.skippedDuplicate++;
      continue;
    }

    // 5. Send notification
    try {
      if (vapidPublicKey && vapidPrivateKey) {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload,
          {
            TTL: 86400,
            urgency: 'high',
          }
        );
      }
      sub.sentRemindersToday.push(`${todayStr}_${activeSlot}`);
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
  res.end(JSON.stringify({
    success: true,
    date: todayStr,
    slot: activeSlot,
    results
  }));
}
