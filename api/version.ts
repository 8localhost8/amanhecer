import type { IncomingMessage, ServerResponse } from 'node:http';

export const SERVER_APP_VERSION = '2.3.1';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      version: SERVER_APP_VERSION,
      timestamp: Date.now(),
    })
  );
}
