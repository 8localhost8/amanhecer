import fs from 'node:fs';
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

const STORAGE_FILE = process.env.PUSH_STORAGE_PATH || path.join(process.cwd(), 'api', 'push', '.subscriptions.json');

function readRecords(): AnonymousPushRecord[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // fallback empty
  }
  return [];
}

function writeRecords(records: AnonymousPushRecord[]): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao persistir inscrições push:', err);
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
