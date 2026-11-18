export type WallpaperCategorySlug = 'all';

export interface WallpaperItem {
  id: string;
  title: string;
  url: string;
  number: number;
}

/**
 * Catálogo completo com os 70 fundos originais em alta definição (1280x1280)
 * copiados byte-a-byte sem recompressão de `/wallpapers/verse_bgs/bg_1.jpg` a `bg_70.jpg`.
 */
export const WALLPAPER_CATALOG: WallpaperItem[] = Array.from({ length: 70 }, (_, idx) => {
  const num = idx + 1;
  return {
    id: `bg-${num}`,
    title: `Fundo ${num}`,
    url: `/wallpapers/verse_bgs/bg_${num}.jpg`,
    number: num,
  };
});

export const CUSTOM_WALLPAPER_STORAGE_KEY = 'amanhecer_custom_wallpaper_v1';
const IDB_NAME = 'amanhecer-wallpaper-storage-v1';
const IDB_STORE = 'wallpapers';
const IDB_KEY = 'custom_gallery_wallpaper';

let cachedCustomWallpaperUrl: string | null = null;

function openWallpaperIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadCustomWallpaperHighRes(): Promise<string | null> {
  if (cachedCustomWallpaperUrl) return cachedCustomWallpaperUrl;
  try {
    const db = await openWallpaperIDB();
    const result = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const getReq = tx.objectStore(IDB_STORE).get(IDB_KEY);
      getReq.onsuccess = () => resolve((getReq.result as string) || null);
      getReq.onerror = () => resolve(null);
    });
    if (result) {
      cachedCustomWallpaperUrl = result;
      return result;
    }
  } catch {
    // Fallback para localStorage
  }
  return getCustomWallpaperDataUrl();
}

export function getCustomWallpaperDataUrl(): string | null {
  if (cachedCustomWallpaperUrl) return cachedCustomWallpaperUrl;
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(CUSTOM_WALLPAPER_STORAGE_KEY);
    if (val) cachedCustomWallpaperUrl = val;
    return val;
  } catch {
    return null;
  }
}

export async function saveCustomWallpaperDataUrl(dataUrl: string): Promise<boolean> {
  cachedCustomWallpaperUrl = dataUrl;
  let savedInIdb = false;

  // 1. Salva em qualidade 100% original no IndexedDB (sem limite de 5MB do localStorage)
  try {
    const db = await openWallpaperIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(dataUrl, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    savedInIdb = true;
  } catch {
    // ignore
  }

  // 2. Salva também no localStorage para leitura síncrona imediata na inicialização
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_WALLPAPER_STORAGE_KEY, dataUrl);
      return true;
    } catch {
      return savedInIdb;
    }
  }
  return savedInIdb;
}

export function removeCustomWallpaperDataUrl(): void {
  cachedCustomWallpaperUrl = null;
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_WALLPAPER_STORAGE_KEY);
  } catch {
    // ignore
  }
  openWallpaperIDB()
    .then((db) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
    })
    .catch(() => {});
}

/**
 * Mantém os bytes 100% originais da imagem enviada da galeria (arquivos até 6MB não sofrem
 * nenhuma recompressão; arquivos maiores mantêm resolução 4K 3840px com qualidade 0.98).
 */
export function compressGalleryImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.onload = () => {
      const rawDataUrl = String(reader.result);

      if (file.size <= 6 * 1024 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const maxDim = 3840;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.98));
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function resolveActiveWallpaperUrl(
  wallpaperId?: string | null,
  wallpaperCustomUrl?: string | null
): string | null {
  if (!wallpaperId || wallpaperId === 'none') return null;
  if (wallpaperId === 'custom') {
    return wallpaperCustomUrl || getCustomWallpaperDataUrl() || null;
  }
  const found = WALLPAPER_CATALOG.find((w) => w.id === wallpaperId);
  if (found) return found.url;
  // Caso o usuário tivesse um ID antigo salvo antes da substituição pelos 70 fundos novos
  return WALLPAPER_CATALOG[0]?.url || null;
}
