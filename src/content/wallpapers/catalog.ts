export type WallpaperCategorySlug =
  | 'amanhecer'
  | 'ceu-estrelado'
  | 'desertos'
  | 'florestas'
  | 'montanhas'
  | 'oceanos';

export interface WallpaperItem {
  id: string;
  categorySlug: WallpaperCategorySlug;
  categoryLabel: string;
  title: string;
  url: string;
}

export interface WallpaperCategoryInfo {
  slug: WallpaperCategorySlug;
  label: string;
  subtitle: string;
}

export const WALLPAPER_CATEGORIES: WallpaperCategoryInfo[] = [
  {
    slug: 'amanhecer',
    label: 'Amanhecer',
    subtitle: 'Luz da alvorada e horizontes serenos',
  },
  {
    slug: 'ceu-estrelado',
    label: 'Céu Estrelado',
    subtitle: 'A imensidão da criação à noite',
  },
  {
    slug: 'montanhas',
    label: 'Montanhas',
    subtitle: 'Cumes firmes e refúgio nas alturas',
  },
  {
    slug: 'florestas',
    label: 'Florestas',
    subtitle: 'Bosques tranquilos e veredas de paz',
  },
  {
    slug: 'oceanos',
    label: 'Oceanos',
    subtitle: 'Águas profundas e brisa marinha',
  },
  {
    slug: 'desertos',
    label: 'Desertos',
    subtitle: 'Dunas douradas e silêncio contemplativo',
  },
];

function buildCategoryItems(
  slug: WallpaperCategorySlug,
  label: string,
  count: number
): WallpaperItem[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `${slug}-${idx + 1}`,
    categorySlug: slug,
    categoryLabel: label,
    title: `${label} ${idx + 1}`,
    url: `/wallpapers/${slug}/${slug}-${idx + 1}.jpg`,
  }));
}

export const WALLPAPER_CATALOG: WallpaperItem[] = [
  ...buildCategoryItems('amanhecer', 'Amanhecer', 9),
  ...buildCategoryItems('ceu-estrelado', 'Céu Estrelado', 4),
  ...buildCategoryItems('montanhas', 'Montanhas', 8),
  ...buildCategoryItems('florestas', 'Florestas', 8),
  ...buildCategoryItems('oceanos', 'Oceanos', 4),
  ...buildCategoryItems('desertos', 'Desertos', 5),
];

export const CUSTOM_WALLPAPER_STORAGE_KEY = 'amanhecer_custom_wallpaper_v1';

export function getCustomWallpaperDataUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CUSTOM_WALLPAPER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCustomWallpaperDataUrl(dataUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(CUSTOM_WALLPAPER_STORAGE_KEY, dataUrl);
    return true;
  } catch {
    return false;
  }
}

export function removeCustomWallpaperDataUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_WALLPAPER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Redimensiona e comprime uma imagem da galeria do celular para no máximo 1440px
 * (JPEG 0.84) garantindo carregamento instantâneo e persistência permanente no localStorage
 * mesmo após atualizações forçadas do aplicativo.
 */
export function compressGalleryImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        try {
          const maxDim = 1440;
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
            resolve(String(reader.result));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          resolve(compressed);
        } catch {
          resolve(String(reader.result));
        }
      };
      img.src = String(reader.result);
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
    return getCustomWallpaperDataUrl() || wallpaperCustomUrl || null;
  }
  const found = WALLPAPER_CATALOG.find((w) => w.id === wallpaperId);
  return found ? found.url : null;
}
