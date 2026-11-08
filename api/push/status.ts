import type { IncomingMessage, ServerResponse } from 'node:http';
import { getAllSubscriptions, getStorageMode } from './_store.js';

/** Diagnóstico do sistema de push (protegido pelo mesmo segredo dos crons). */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const authHeader = req.headers['authorization'];
    const expectedSecret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_API_KEY;
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      res.statusCode = 401;
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

    const mode = getStorageMode();
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        storage: mode,
        durable: mode === 'blob' || mode === 'redis',
        subscribers,
        storageError,
        vapidPrivateKeyConfigured: Boolean((process.env.VAPID_PRIVATE_KEY || '').trim()),
        cronSecretConfigured: Boolean(expectedSecret),
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message || 'Erro interno no status' }));
  }
}
