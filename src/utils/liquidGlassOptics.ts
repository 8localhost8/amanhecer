/**
 * Gerador óptico de mapas de deslocamento (Snell's Law + Superellipse/Capsule SDF)
 * para o efeito Apple iOS 26 / WhatsApp Liquid Glass real via SVG <feDisplacementMap>.
 *
 * Diferente de um simples backdrop-filter: blur() chapado, estes mapas curvam
 * fisicamente os raios de luz do Wallpaper + HUD + Ícones nas bordas chanfradas
 * da barra e no domo convexo da gota líquida em movimento.
 */

export interface OpticalMaps {
  barMapUrl: string;
  barWidth: number;
  barHeight: number;
  dropletMapUrl: string;
  dropletWidth: number;
  dropletHeight: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Signed Distance Function (SDF) e gradiente normal para uma cápsula arredondada centrada em (0,0).
 */
function capsuleSdfAndNormal(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  radius: number
): { dist: number; nx: number; ny: number } {
  const r = Math.min(radius, halfW, halfH);
  const bx = halfW - r;
  const by = halfH - r;

  const qx = Math.abs(px) - bx;
  const qy = Math.abs(py) - by;

  const mx = Math.max(qx, 0);
  const my = Math.max(qy, 0);
  const outsideLen = Math.hypot(mx, my);
  const insideMax = Math.min(Math.max(qx, qy), 0);
  const dist = outsideLen + insideMax - r;

  let nx = 0;
  let ny = 0;
  if (outsideLen > 1e-5) {
    nx = (mx / outsideLen) * Math.sign(px);
    ny = (my / outsideLen) * Math.sign(py);
  } else if (qx > qy) {
    nx = Math.sign(px);
    ny = 0;
  } else {
    nx = 0;
    ny = Math.sign(py);
  }

  return { dist, nx, ny };
}

/**
 * Gera o mapa de refração da cápsula principal da barra inferior:
 * - Centro plano cristalino (deslocamento zero: R=128, G=128) para leitura limpa
 * - Chanfro curvo 3D nas bordas externas (bezelPx) que dobra o Wallpaper e os cards da HUD
 *   ao redor do vidro arredondado (Lei de Snell).
 */
export function generateBarRefractionMap(
  width: number,
  height: number,
  bezelPx = 20
): string {
  if (typeof document === 'undefined') return '';
  const w = Math.max(64, Math.round(width));
  const h = Math.max(32, Math.round(height));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(w, h);
  const data = img.data;

  const halfW = w / 2;
  const halfH = h / 2;
  const radius = halfH;

  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - halfH;
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - halfW;
      const { dist, nx, ny } = capsuleSdfAndNormal(px, py, halfW, halfH, radius);

      let dx = 0;
      let dy = 0;

      if (dist <= 1.5 && dist > -bezelPx) {
        // u = 0 no início interno do chanfro -> u = 1 na extremidade curva externa do vidro
        const u = clamp(1 + dist / bezelPx, 0, 1);
        // Perfil de inclinação de borda curva (Snell): puxa o fundo para dentro da curvatura
        const refract = Math.pow(u, 2.15) * 0.96;
        dx = -nx * refract;
        dy = -ny * refract;
      }

      const idx = (y * w + x) * 4;
      data[idx] = clamp(Math.round(128 + dx * 127), 0, 255);
      data[idx + 1] = clamp(Math.round(128 + dy * 127), 0, 255);
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Gera o mapa de refração de uma gota líquida convexa (lente de aumento + menisco de tensão superficial):
 * - No interior: atua como lente convexa suave (magnifica ícones, textos e fundo sob a gota)
 * - No anel externo (menisco): curvatura acentuada de gota d'água que comprime e refrata a borda
 *   gerando dispersão cromática realista estilo iOS 26 / WhatsApp iPhone.
 */
export function generateDropletLensMap(width = 160, height = 112): string {
  if (typeof document === 'undefined') return '';
  const w = Math.round(width);
  const h = Math.round(height);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(w, h);
  const data = img.data;

  const halfW = w / 2;
  const halfH = h / 2;
  const radius = halfH;
  const rimWidth = halfH * 0.48;

  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - halfH;
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - halfW;
      const { dist, nx, ny } = capsuleSdfAndNormal(px, py, halfW, halfH, radius);

      let dx = 0;
      let dy = 0;

      if (dist <= 2) {
        // 1. Efeito de lupa convexa suave do centro até a borda
        const normX = px / halfW;
        const normY = py / halfH;
        const radial = Math.min(1, Math.hypot(normX, normY));
        const domeFalloff = 1 - Math.pow(radial, 2.4) * 0.35;
        const magX = -normX * 0.34 * domeFalloff;
        const magY = -normY * 0.34 * domeFalloff;

        // 2. Menisco líquido intenso próximo à borda da gota
        let rimX = 0;
        let rimY = 0;
        if (dist > -rimWidth) {
          const u = clamp(1 + dist / rimWidth, 0, 1);
          const meniscus = Math.pow(u, 2.3) * 0.88;
          rimX = -nx * meniscus;
          rimY = -ny * meniscus;
        }

        dx = clamp(magX + rimX, -1, 1);
        dy = clamp(magY + rimY, -1, 1);
      }

      const idx = (y * w + x) * 4;
      data[idx] = clamp(Math.round(128 + dx * 127), 0, 255);
      data[idx + 1] = clamp(Math.round(128 + dy * 127), 0, 255);
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Detecta se o motor do navegador suporta SVG filters dentro de CSS backdrop-filter (Chromium/Blink).
 * No Safari/WebKit, usamos o fallback multi-camada Fresnel + lente magnificada sem artefatos.
 */
export function supportsSvgBackdropFilter(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isChromium =
    /Chrome\/|Chromium\/|Edg\/|OPR\//i.test(ua) && !/CriOS\/|FxiOS\//i.test(ua);
  return isChromium;
}
