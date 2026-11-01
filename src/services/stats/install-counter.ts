const INSTALL_COUNTED_KEY = 'amanhecer_install_counted_v1';
const CACHED_COUNT_KEY = 'amanhecer_cached_install_count_v1';
const DEFAULT_FALLBACK_COUNT = 14;

export function getCachedInstallCount(): number {
  if (typeof window === 'undefined') return DEFAULT_FALLBACK_COUNT;
  try {
    const raw = localStorage.getItem(CACHED_COUNT_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_FALLBACK_COUNT;
  } catch {
    return DEFAULT_FALLBACK_COUNT;
  }
}

function saveCachedInstallCount(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHED_COUNT_KEY, String(count));
  } catch {
    // ignore storage errors
  }
}

export async function fetchInstallCount(): Promise<number> {
  try {
    const res = await fetch('/api/stats/installs', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.count === 'number' && data.count > 0) {
        saveCachedInstallCount(data.count);
        return data.count;
      }
    }
  } catch {
    // offline or local dev fallback
  }
  return getCachedInstallCount();
}

export async function recordAppInstallationOnce(): Promise<number> {
  if (typeof window === 'undefined') return DEFAULT_FALLBACK_COUNT;

  try {
    if (localStorage.getItem(INSTALL_COUNTED_KEY) === 'true') {
      return await fetchInstallCount();
    }
    localStorage.setItem(INSTALL_COUNTED_KEY, 'true');
  } catch {
    // ignore storage errors
  }

  const optimistic = getCachedInstallCount() + 1;
  saveCachedInstallCount(optimistic);

  try {
    const res = await fetch('/api/stats/installs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.count === 'number' && data.count > 0) {
        saveCachedInstallCount(data.count);
        return data.count;
      }
    }
  } catch {
    // keep optimistic local count if offline
  }

  return optimistic;
}
