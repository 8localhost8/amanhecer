import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { put, list } from '@vercel/blob';

export interface AnonymousPushRecord {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  timezone: string;
  dailyVerseEnabled: boolean;
  reminderEnabled: boolean;
  lastReadDate?: string;
  lastVerseSentDate?: string;
  sentRemindersToday?: string[]; // e.g. ['2026-11-08_11:00']
  createdAt: string;
  updatedAt: string;
}

const BLOB_FILENAME = 'amanhecer/push-subscriptions.json';
const REDIS_HASH_KEY = 'amanhecer:push:subscriptions';

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url: url.replace(/\/$/, ''), token };
  return null;
}

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getStorageMode(): 'blob' | 'redis' | 'ephemeral-file' {
  if (hasBlobStorage()) return 'blob';
  if (redisConfig()) return 'redis';
  return 'ephemeral-file';
}

async function redisCommand(command: (string | number)[]): Promise<any> {
  const cfg = redisConfig();
  if (!cfg) throw new Error('Redis não configurado');
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`Redis error: ${json.error || res.status}`);
  }
  return json.result;
}

function fieldFor(endpoint: string): string {
  return crypto.createHash('sha1').update(endpoint).digest('hex');
}

// ---------- Blob Storage (Vercel Blob) ----------
async function readBlobRecords(): Promise<AnonymousPushRecord[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    const target = blobs.find((b) => b.pathname === BLOB_FILENAME);
    if (!target) return [];

    const res = await fetch(target.url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Erro ao ler Vercel Blob:', err);
    return [];
  }
}

async function writeBlobRecords(records: AnonymousPushRecord[]): Promise<void> {
  try {
    await put(BLOB_FILENAME, JSON.stringify(records, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
  } catch (err) {
    console.error('Erro ao salvar no Vercel Blob:', err);
  }
}

// ---------- Fallback em arquivo local (desenvolvimento) ----------
let memoryCache: AnonymousPushRecord[] | null = null;

function resolveStorageFile(): string {
  if (process.env.PUSH_STORAGE_PATH) return process.env.PUSH_STORAGE_PATH;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'amanhecer-subscriptions.json');
  }
  return path.join(process.cwd(), 'api', 'push', '.subscriptions.json');
}

function readFileRecords(): AnonymousPushRecord[] {
  const file = resolveStorageFile();
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (Array.isArray(parsed)) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch {
    // fallback to memoryCache
  }
  return memoryCache ? [...memoryCache] : [];
}

function writeFileRecords(records: AnonymousPushRecord[]): void {
  memoryCache = [...records];
  const file = resolveStorageFile();
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(records, null, 2), 'utf-8');
  } catch {
    try {
      fs.writeFileSync(
        path.join(os.tmpdir(), 'amanhecer-subscriptions.json'),
        JSON.stringify(records, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Erro ao persistir inscrições push em arquivo:', err);
    }
  }
}

// ---------- API pública assíncrona ----------
export async function getAllSubscriptions(): Promise<AnonymousPushRecord[]> {
  if (hasBlobStorage()) {
    return readBlobRecords();
  }
  if (redisConfig()) {
    const flat: string[] = (await redisCommand(['HGETALL', REDIS_HASH_KEY])) || [];
    const out: AnonymousPushRecord[] = [];
    for (let i = 1; i < flat.length; i += 2) {
      try {
        out.push(JSON.parse(flat[i]));
      } catch {
        // ignora registro inválido
      }
    }
    return out;
  }
  return readFileRecords();
}

async function findByEndpointOrId(key: string): Promise<AnonymousPushRecord | null> {
  const all = await getAllSubscriptions();
  return all.find((r) => r.endpoint === key || r.id === key) || null;
}

export async function saveSubscription(
  record: Omit<AnonymousPushRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AnonymousPushRecord> {
  const now = new Date().toISOString();

  if (hasBlobStorage()) {
    const records = await readBlobRecords();
    const idx = records.findIndex((r) => r.endpoint === record.endpoint);
    let result: AnonymousPushRecord;
    if (idx >= 0) {
      result = { ...records[idx], ...record, updatedAt: now };
      records[idx] = result;
    } else {
      result = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...record,
        createdAt: now,
        updatedAt: now,
      };
      records.push(result);
    }
    await writeBlobRecords(records);
    return result;
  }

  if (redisConfig()) {
    const field = fieldFor(record.endpoint);
    const existingRaw = await redisCommand(['HGET', REDIS_HASH_KEY, field]);
    const existing: AnonymousPushRecord | null = existingRaw ? JSON.parse(existingRaw) : null;
    const saved: AnonymousPushRecord = existing
      ? { ...existing, ...record, updatedAt: now }
      : {
          id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...record,
          createdAt: now,
          updatedAt: now,
        };
    await redisCommand(['HSET', REDIS_HASH_KEY, field, JSON.stringify(saved)]);
    return saved;
  }

  const records = readFileRecords();
  const idx = records.findIndex((r) => r.endpoint === record.endpoint);
  if (idx >= 0) {
    const updated = { ...records[idx], ...record, updatedAt: now };
    records[idx] = updated;
    writeFileRecords(records);
    return updated;
  }
  const created: AnonymousPushRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ...record,
    createdAt: now,
    updatedAt: now,
  };
  records.push(created);
  writeFileRecords(records);
  return created;
}

export async function removeSubscription(endpoint: string): Promise<void> {
  if (hasBlobStorage()) {
    const records = await readBlobRecords();
    const filtered = records.filter((r) => r.endpoint !== endpoint);
    await writeBlobRecords(filtered);
    return;
  }
  if (redisConfig()) {
    await redisCommand(['HDEL', REDIS_HASH_KEY, fieldFor(endpoint)]);
    return;
  }
  writeFileRecords(readFileRecords().filter((r) => r.endpoint !== endpoint));
}

export async function recordCompletion(endpoint: string, dateStr: string): Promise<void> {
  const item = await findByEndpointOrId(endpoint);
  if (!item) return;
  item.lastReadDate = dateStr;
  item.updatedAt = new Date().toISOString();
  await updateSubscription(item);
}

export async function updateSubscription(record: AnonymousPushRecord): Promise<void> {
  if (hasBlobStorage()) {
    const records = await readBlobRecords();
    const idx = records.findIndex((r) => r.id === record.id || r.endpoint === record.endpoint);
    if (idx >= 0) {
      records[idx] = record;
      await writeBlobRecords(records);
    }
    return;
  }
  if (redisConfig()) {
    await redisCommand(['HSET', REDIS_HASH_KEY, fieldFor(record.endpoint), JSON.stringify(record)]);
    return;
  }
  const records = readFileRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
    writeFileRecords(records);
  }
}
