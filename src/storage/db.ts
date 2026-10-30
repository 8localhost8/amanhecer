import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DevotionalPublic } from '../services/ai/schemas';

export interface ReadingCompletion {
  devotionalId: string;
  date: string;
  completedAt: string;
  syncedWithPush: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string;
  type: 'note' | 'prayer' | 'gratitude';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AmanhecerDB extends DBSchema {
  completions: {
    key: string; // date YYYY-MM-DD
    value: ReadingCompletion;
    indexes: { 'by-date': string };
  };
  favorites: {
    key: string; // devotionalId
    value: DevotionalPublic;
  };
  diaryEntries: {
    key: string; // id
    value: DiaryEntry;
    indexes: { 'by-date': string; 'by-type': string };
  };
  cachedDevotionals: {
    key: string; // date
    value: DevotionalPublic;
  };
}

const DB_NAME = 'amanhecer-local-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AmanhecerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AmanhecerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('completions')) {
          const compStore = db.createObjectStore('completions', { keyPath: 'date' });
          compStore.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('diaryEntries')) {
          const diaryStore = db.createObjectStore('diaryEntries', { keyPath: 'id' });
          diaryStore.createIndex('by-date', 'date');
          diaryStore.createIndex('by-type', 'type');
        }
        if (!db.objectStoreNames.contains('cachedDevotionals')) {
          db.createObjectStore('cachedDevotionals', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// COMPLETIONS
export async function saveCompletion(devotionalId: string, date: string): Promise<ReadingCompletion> {
  const db = await getDB();
  const record: ReadingCompletion = {
    devotionalId,
    date,
    completedAt: new Date().toISOString(),
    syncedWithPush: false,
  };
  await db.put('completions', record);
  return record;
}

export async function getCompletion(date: string): Promise<ReadingCompletion | undefined> {
  const db = await getDB();
  return db.get('completions', date);
}

export async function markCompletionSynced(date: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('completions', date);
  if (item) {
    item.syncedWithPush = true;
    await db.put('completions', item);
  }
}

export async function getAllCompletions(): Promise<ReadingCompletion[]> {
  const db = await getDB();
  return db.getAll('completions');
}

// FAVORITES
export async function toggleFavorite(devotional: DevotionalPublic): Promise<boolean> {
  const db = await getDB();
  const exists = await db.get('favorites', devotional.id);
  if (exists) {
    await db.delete('favorites', devotional.id);
    return false; // removed
  } else {
    await db.put('favorites', devotional);
    return true; // added
  }
}

export async function isFavorite(id: string): Promise<boolean> {
  const db = await getDB();
  const item = await db.get('favorites', id);
  return !!item;
}

export async function getAllFavorites(): Promise<DevotionalPublic[]> {
  const db = await getDB();
  return db.getAll('favorites');
}

// DIARY
export async function saveDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string): Promise<DiaryEntry> {
  const db = await getDB();
  const now = new Date().toISOString();
  const fullEntry: DiaryEntry = {
    id: existingId || `diary-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...entry,
    createdAt: existingId ? (await db.get('diaryEntries', existingId))?.createdAt || now : now,
    updatedAt: now,
  };
  await db.put('diaryEntries', fullEntry);
  return fullEntry;
}

export async function getAllDiaryEntries(): Promise<DiaryEntry[]> {
  const db = await getDB();
  const list = await db.getAll('diaryEntries');
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('diaryEntries', id);
}

// BACKUP EXPORT & IMPORT
export async function exportDiaryToJson(): Promise<string> {
  const entries = await getAllDiaryEntries();
  return JSON.stringify({
    appName: 'Amanhecer',
    exportDate: new Date().toISOString(),
    totalEntries: entries.length,
    entries,
  }, null, 2);
}

export async function importDiaryFromJson(jsonString: string): Promise<number> {
  const data = JSON.parse(jsonString);
  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error('Arquivo JSON inválido para o Diário do Amanhecer.');
  }
  const db = await getDB();
  let count = 0;
  for (const entry of data.entries) {
    if (entry.title && entry.content && entry.type) {
      await db.put('diaryEntries', {
        id: entry.id || `imported-${Date.now()}-${count}`,
        date: entry.date || new Date().toISOString().slice(0, 10),
        type: entry.type,
        title: entry.title,
        content: entry.content,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: entry.updatedAt || new Date().toISOString(),
      });
      count++;
    }
  }
  return count;
}
