import type { IncomingMessage, ServerResponse } from 'node:http';
import webpush from 'web-push';
import { waitUntil } from '@vercel/functions';

export const config = {
  maxDuration: 60,
};

const cleanEnvKey = (v?: string) => (v || '').replace(/["'\s]/g, '').trim();

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
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
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
  }

  const { endpoint, keys, delaySeconds, title, body: messageBody } = body || {};

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Inscrição push incompleta (endpoint ou chaves faltando).' }));
    return;
  }

  const vapidPublicKey =
    cleanEnvKey(process.env.VAPID_PUBLIC_KEY) ||
    cleanEnvKey(process.env.VITE_VAPID_PUBLIC_KEY) ||
    'BL-tTNbq9Aie-CPWNHJbseDn8QmCEUaO5tpsJRo_6bcvOuBg9b4dmIZIe1gvmiebzNiaWfYtFI3RHoTy5ZwLvRk';
  const vapidPrivateKey = cleanEnvKey(process.env.VAPID_PRIVATE_KEY);
  const vapidSubject = cleanEnvKey(process.env.VAPID_SUBJECT) || 'mailto:contato@amanhecer.app';

  if (!vapidPrivateKey) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'VAPID_PRIVATE_KEY não configurada no servidor.' }));
    return;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const delay = Math.max(0, Math.min(Number(delaySeconds) || 0, 55));

  const payload = JSON.stringify({
    title: title || '⚡ Notificação Extreme — Amanhecer',
    body:
      messageBody ||
      'Sucesso! A notificação agendada chegou na barra do celular com o app fechado.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/?source=extreme-test',
      timestamp: Date.now(),
      type: 'extreme-test',
    },
  });

  // Responde IMEDIATAMENTE (em ~50ms) com 200 OK para o celular!
  // Dessa forma, a conexão HTTP termina com sucesso e o usuário pode FECHAR o app completamente!
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      success: true,
      scheduled: true,
      delaySeconds: delay,
      message: `Agendado para disparar em ${delay} segundos na nuvem. Pode fechar o app!`,
    })
  );

  // Executa o disparo no background da nuvem (Vercel Lambda)
  // O waitUntil mantém o processo vivo na Vercel mesmo após a resposta ser entregue ao cliente.
  waitUntil(
    (async () => {
      try {
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        }

        await webpush.sendNotification(
          { endpoint, keys },
          payload,
          {
            TTL: 86400,
            urgency: 'high',
          }
        );
      } catch (err) {
        console.error('Erro ao enviar push em background no Extreme Test:', err);
      }
    })()
  );
}
