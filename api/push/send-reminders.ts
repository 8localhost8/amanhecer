import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import {
  getAllSubscriptions,
  updateSubscription,
  removeSubscription,
  getStorageMode,
} from './_store.js';
import { getSaoPauloDateString } from './_verse.js';

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

/**
 * Resolve o slot válido EXCLUSIVAMENTE com base no relógio real de Brasília (`America/Sao_Paulo`).
 * Se um cron do GitHub Actions atrasar horas (ex: cron das 16:00 rodando às 20:45 ou às 00:57),
 * NUNCA envia uma mensagem de "Fim de Tarde" às 21:00 nem envia notificações de madrugada!
 */
function resolveValidSlotForCurrentTime(totalMinutes: number): '06:00' | '11:00' | '16:00' | '21:00' | null {
  // 05:45 às 07:30 -> 06:00 (Bom dia)
  if (totalMinutes >= 5 * 60 + 45 && totalMinutes <= 7 * 60 + 30) {
    return '06:00';
  }
  // 10:45 às 12:40 -> 11:00 (Pausa do Meio-Dia)
  if (totalMinutes >= 10 * 60 + 45 && totalMinutes <= 12 * 60 + 40) {
    return '11:00';
  }
  // 15:45 às 17:40 -> 16:00 (Fim de Tarde)
  if (totalMinutes >= 15 * 60 + 45 && totalMinutes <= 17 * 60 + 40) {
    return '16:00';
  }
  // 20:45 às 22:30 -> 21:00 (Oração da Noite)
  if (totalMinutes >= 20 * 60 + 45 && totalMinutes <= 22 * 60 + 30) {
    return '21:00';
  }
  return null;
}

export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  // Authorization
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Não autorizado' }));
    return;
  }

  const urlObj = new URL(req.url || '/', 'http://localhost');
  const requestedSlot = urlObj.searchParams.get('slot');
  const forceManual = urlObj.searchParams.get('force') === '1';

  const { hour, minute, totalMinutes } = getSaoPauloClock();
  const saoPauloTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const clockSlot = resolveValidSlotForCurrentTime(totalMinutes);

  // Se não for forçado manualmente (?force=1), o horário real de Brasília manda!
  // Isso impede que um job atrasado das 16:00 dispare "Fim de Tarde" às 21:00 ou de madrugada.
  const activeSlot = forceManual ? requestedSlot || clockSlot || '11:00' : clockSlot;

  if (!activeSlot) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        skippedOutOfWindow: true,
        requestedSlot,
        saoPauloTime: saoPauloTimeStr,
        reason:
          'Cron executado fora das janelas válidas de envio (06:00, 11:00, 16:00, 21:00 BRT). Nenhuma notificação atrasada foi enviada.',
      })
    );
    return;
  }

  const todayStr = getSaoPauloDateString();

  // Configure VAPID
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
    slot: activeSlot,
    requestedSlot,
    saoPauloTime: saoPauloTimeStr,
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
      body: 'Inicie seu dia na presença de Deus. Seu devocional matinal já está disponível.',
    },
    '11:00': {
      title: 'Amanhecer • Pausa do Meio-Dia',
      body: 'Uma pausa serena no meio das tarefas. Reserve alguns minutos para a Palavra e oração.',
    },
    '16:00': {
      title: 'Amanhecer • Fim de Tarde',
      body: 'Refrigere a sua alma neste fim de tarde com uma reflexão bíblica edificante.',
    },
    '21:00': {
      title: 'Amanhecer • Oração da Noite',
      body: 'Entregue as lutas de hoje e descanse na fidelidade de Deus antes de dormir.',
    },
  };

  const message = reminderMessages[activeSlot] || reminderMessages['11:00'];
  const slotKey = `${todayStr}_${activeSlot}`;

  const payload = JSON.stringify({
    title: message.title,
    body: message.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `amanhecer-reminder-${slotKey}`,
    data: {
      url: `/?date=${todayStr}&source=push-reminder-${activeSlot}`,
      date: todayStr,
      type: 'reading-reminder',
      slot: activeSlot,
    },
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
    if (!forceManual && sub.sentRemindersToday.includes(slotKey)) {
      results.skippedDuplicate++;
      continue;
    }

    // 5. Send notification (TTL de 90 minutos: se o celular estiver desligado às 16:00,
    // a mensagem de Fim de Tarde expira às 17:30 e jamais será entregue às 21:00!)
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload,
        {
          TTL: 5400,
          urgency: 'high',
        }
      );
      if (!sub.sentRemindersToday.includes(slotKey)) {
        sub.sentRemindersToday.push(slotKey);
      }
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
      slot: activeSlot,
      results,
    })
  );
}
