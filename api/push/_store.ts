import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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
  sentRemindersToday?: string[]; // e.g. ['06:00', '11:00']
  createdAt: string;
  updatedAt: string;
}

// In-memory cache + writable file path (/tmp on Vercel Serverless)
let memoryCache: AnonymousPushRecord[] | null = null;

function resolveStorageFile(): string {
  if (process.env.PUSH_STORAGE_PATH) {
    return process.env.PUSH_STORAGE_PATH;
  }
  // On Vercel / AWS Lambda, process.cwd() (/var/task) is read-only; use os.tmpdir() (/tmp)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), 'amanhecer-subscriptions.json');
  }
  return path.join(process.cwd(), 'api', 'push', '.subscriptions.json');
}

function readRecords(): AnonymousPushRecord[] {
  const file = resolveStorageFile();
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(data);
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

function writeRecords(records: AnonymousPushRecord[]): void {
  memoryCache = [...records];
  const file = resolveStorageFile();
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(records, null, 2), 'utf-8');
  } catch {
    // Fallback to os.tmpdir() if local dir was read-only
    try {
      const tmpFile = path.join(os.tmpdir(), 'amanhecer-subscriptions.json');
      fs.writeFileSync(tmpFile, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao persistir inscrições push:', err);
    }
  }
}

export function saveSubscription(record: Omit<AnonymousPushRecord, 'id' | 'createdAt' | 'updatedAt'>): AnonymousPushRecord {
  const records = readRecords();
  const existingIndex = records.findIndex(r => r.endpoint === record.endpoint);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const updated: AnonymousPushRecord = {
      ...records[existingIndex],
      ...record,
      updatedAt: now,
    };
    records[existingIndex] = updated;
    writeRecords(records);
    return updated;
  }

  const newRecord: AnonymousPushRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ...record,
    createdAt: now,
    updatedAt: now,
  };
  records.push(newRecord);
  writeRecords(records);
  return newRecord;
}

export function removeSubscription(endpoint: string): void {
  const records = readRecords();
  const filtered = records.filter(r => r.endpoint !== endpoint);
  writeRecords(filtered);
}

export function recordCompletion(endpoint: string, dateStr: string): void {
  const records = readRecords();
  const item = records.find(r => r.endpoint === endpoint || r.id === endpoint);
  if (item) {
    item.lastReadDate = dateStr;
    item.updatedAt = new Date().toISOString();
    writeRecords(records);
  }
}

export function getAllSubscriptions(): AnonymousPushRecord[] {
  return readRecords();
}

export function updateSubscription(record: AnonymousPushRecord): void {
  const records = readRecords();
  const idx = records.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
    writeRecords(records);
  }
}
