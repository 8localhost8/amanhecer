import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import { selectDailyVerse, getSaoPauloDateString } from './_verse.js';

const DEFAULT_VAPID_PUBLIC_KEY =
  'BL-tTNbq9Aie-CPWNHJbseDn8QmCEUaO5tpsJRo_6bcvOuBg9b4dmIZIe1gvmiebzNiaWfYtFI3RHoTy5ZwLvRk';

function cleanEnvKey(val?: string): string {
  return (val || '').replace(/["'\s]/g, '').trim();
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = req.body;
  if (!body) {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const raw = Buffer.concat(buffers).toString('utf-8');
    try {
      body = JSON.parse(raw);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
  }

  const { endpoint, keys } = body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Inscrição push incompleta.' }));
    return;
  }

  const vapidPublicKey =
    cleanEnvKey(process.env.VAPID_PUBLIC_KEY) ||
    cleanEnvKey(process.env.VITE_VAPID_PUBLIC_KEY) ||
    DEFAULT_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = cleanEnvKey(process.env.VAPID_PRIVATE_KEY);
  const vapidSubject = cleanEnvKey(process.env.VAPID_SUBJECT) || 'mailto:contato@amanhecer.app';

  if (!vapidPrivateKey) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, mode: 'local-only' }));
    return;
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    const todayStr = getSaoPauloDateString();
    const verse = selectDailyVerse(todayStr);

    const payload = JSON.stringify({
      title: '☀️ Versículo do Dia — Amanhecer',
      body: `${verse.reference} — "${verse.text.slice(0, 120)}${verse.text.length > 120 ? '...' : ''}"`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        url: `/?date=${todayStr}&source=push-test`,
        date: todayStr,
        type: 'test',
      },
    });

    await webpush.sendNotification({ endpoint, keys }, payload);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true }));
  } catch (err: any) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err?.message || 'Push error' }));
  }
}
