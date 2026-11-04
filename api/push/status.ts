import type { IncomingMessage, ServerResponse } from 'node:http';
import { getAllSubscriptions, getStorageMode } from './_store';

/** Diagnóstico do sistema de push (protegido pelo mesmo segredo dos crons). */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Não autorizado' }));
    return;
  }

  let subscribers = -1;
  let storageError: string | null = null;
  try {
    subscribers = (await getAllSubscriptions()).length;
  } catch (err: any) {
    storageError = err?.message || 'erro ao ler o armazenamento';
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      storage: getStorageMode(),
      durable: getStorageMode() === 'redis',
      subscribers,
      storageError,
      vapidPrivateKeyConfigured: Boolean((process.env.VAPID_PRIVATE_KEY || '').trim()),
      cronSecretConfigured: Boolean(expectedSecret),
    })
  );
}
