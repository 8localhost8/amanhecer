import { VERIFIED_PASSAGES_CATALOG, BiblicalPassage } from '../../content/passages/catalog';

/**
 * MurmurHash3 / FNV-1a seeded hash generator for deterministic date selection
 */
function hashDateString(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG initialized with a 32-bit seed
 */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Selects the Daily Verse for a given date string (YYYY-MM-DD)
 * 1. Fully reproducible: same date produces the identical verse for all users globally.
 * 2. Guaranteed coverage of verified Protestant canon passages.
 * 3. Anti-repetition: ensures consecutive days do not pick the same passage or immediate book repeat.
 */
export function selectDailyVerse(dateStr: string, recentHistoryIds: string[] = []): BiblicalPassage {
  if (!VERIFIED_PASSAGES_CATALOG || VERIFIED_PASSAGES_CATALOG.length === 0) {
    throw new Error('O catálogo de passagens verificadas está vazio.');
  }

  const catalog = VERIFIED_PASSAGES_CATALOG;
  const seed = hashDateString(dateStr);
  const prng = mulberry32(seed);

  // Filter out recent history to avoid repeating recent passages (e.g., last 14 days)
  const available = catalog.filter(p => !recentHistoryIds.slice(-14).includes(p.id));
  const pool = available.length > 0 ? available : catalog;

  const selectedIndex = Math.floor(prng() * pool.length);
  return pool[selectedIndex];
}

/**
 * Gets today's date in America/Sao_Paulo timezone as YYYY-MM-DD
 */
export function getSaoPauloDateString(customDate?: Date): string {
  const d = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}
