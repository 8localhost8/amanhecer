import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAllSubscriptions } from '../push/_store';

interface InstallStatsData {
  count: number;
  updatedAt: string;
}

const COUNTER_NAMESPACE = 'amanhecer-devocional-v2';
const COUNTER_KEY = 'pwa-installs';
// Base count of initial beta installs prior to counter activation
const INITIAL_BASELINE = 14;

let memoryCount = INITIAL_BASELINE;

function getStatsFilePath(): string {
  return path.join(os.tmpdir(), 'amanhecer-install-stats.json');
}

function readLocalCount(): number {
  try {
    const file = getStatsFilePath();
    if (fs.existsSync(file)) {
      const parsed: InstallStatsData = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (typeof parsed.count === 'number' && parsed.count >= INITIAL_BASELINE) {
        memoryCount = Math.max(memoryCount, parsed.count);
      }
    }
  } catch {
    // ignore read errors
  }
  const activeSubs = getAllSubscriptions().length;
  return Math.max(memoryCount, INITIAL_BASELINE + activeSubs);
}

function writeLocalCount(count: number): void {
  memoryCount = Math.max(memoryCount, count);
  try {
    const file = getStatsFilePath();
    const payload: InstallStatsData = {
      count: memoryCount,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8');
  } catch {
    // ignore write errors in read-only environments
  }
}

async function fetchExternalCounter(increment: boolean): Promise<number | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2200);
  try {
    const endpoint = increment
      ? `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`
      : `https://api.counterapi.dev/v1/${COUNTER_NAMESPACE}/${COUNTER_KEY}/`;
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: number };
    if (typeof data?.count === 'number') {
      return INITIAL_BASELINE + data.count;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'POST') {
    const localNext = readLocalCount() + 1;
    writeLocalCount(localNext);

    const externalCount = await fetchExternalCounter(true);
    const finalCount = externalCount !== null ? Math.max(localNext, externalCount) : localNext;
    writeLocalCount(finalCount);

    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, count: finalCount }));
    return;
  }

  // GET: Return current install count
  const localCurrent = readLocalCount();
  const externalCount = await fetchExternalCounter(false);
  const finalCount = externalCount !== null ? Math.max(localCurrent, externalCount) : localCurrent;
  writeLocalCount(finalCount);

  res.statusCode = 200;
  res.end(JSON.stringify({ count: finalCount }));
}
