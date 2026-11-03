/**
 * Gerador da imagem de compartilhamento do Amanhecer (1080x1350, formato feed vertical).
 * Usa o template oficial `versiculo.png` (otimizado) e a fonte Cy Grotesk Key Bold.
 */

const TEMPLATE_URL = '/share/versiculo-template.jpg';
const FONT_URL = '/fonts/CyGrotesk-KeyBold.otf';
const FONT_FAMILY = 'CyGroteskKeyBold';

const WIDTH = 1080;
const HEIGHT = 1350;

const CREAM = '#F7F3EA';
const SAND = '#D9C7A3';

// Área segura do texto (evita logo no topo e o sol na base do template)
const TEXT_AREA_TOP = 250;
const TEXT_AREA_BOTTOM = 960;
const TEXT_MAX_WIDTH = 800;

export interface VerseImageOptions {
  /** Texto principal (versículo) */
  text: string;
  /** Referência bíblica, ex.: "Salmos 23:1-3" */
  reference: string;
  /** Linha pequena acima do texto, ex.: "VERSÍCULO DO DIA" ou título do devocional */
  kicker?: string;
}

let fontPromise: Promise<void> | null = null;

function ensureFontLoaded(): Promise<void> {
  if (!fontPromise) {
    fontPromise = (async () => {
      try {
        const face = new FontFace(FONT_FAMILY, `url(${FONT_URL})`);
        await face.load();
        document.fonts.add(face);
      } catch (err) {
        console.warn('Fonte Cy Grotesk indisponível, usando fonte padrão.', err);
      }
    })();
  }
  return fontPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export interface ShareCaptionOptions {
  reference: string;
  theme?: string;
  contextSummary?: string;
  title?: string;
  type?: 'verse' | 'devotional';
}

export function buildShareCaption(options?: ShareCaptionOptions | string): string {
  if (typeof options === 'string') {
    return `${options.trim()}\nhttps://amanhecer-beta.vercel.app`;
  }

  if (!options) {
    return `☀️ Veja o devocional de hoje no Amanhecer:\nhttps://amanhecer-beta.vercel.app`;
  }

  const { reference, theme, contextSummary, title, type = 'verse' } = options;
  const headline = title || theme;

  const headerLine = headline
    ? `${type === 'verse' ? '☀️' : '📖'} *${reference} • ${headline}*`
    : `${type === 'verse' ? '☀️' : '📖'} *${reference}*`;

  const summaryLine = contextSummary ? `\n"${contextSummary.trim()}"` : '';

  const ctaLine = type === 'devotional'
    ? 'Leia a reflexão completa no Amanhecer:'
    : 'Veja o devocional de hoje no Amanhecer:';

  return `${headerLine}${summaryLine}\n\n${ctaLine}\nhttps://amanhecer-beta.vercel.app`;
}

export async function generateVerseImageBlob(options: VerseImageOptions): Promise<Blob> {
  const [, template] = await Promise.all([ensureFontLoaded(), loadImage(TEMPLATE_URL)]);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  ctx.drawImage(template, 0, 0, WIDTH, HEIGHT);

  const fontStack = `'${FONT_FAMILY}', 'Arial Black', Arial, sans-serif`;
  const quoted = `“${truncate(options.text.trim(), 330)}”`;

  // Ajuste automático do tamanho para caber na área segura
  let fontSize = 88;
  let lineHeight = 0;
  let lines: string[] = [];
  const kickerBlock = options.kicker ? 70 : 0;
  const maxBlockHeight = TEXT_AREA_BOTTOM - TEXT_AREA_TOP - kickerBlock;

  while (fontSize >= 38) {
    ctx.font = `${fontSize}px ${fontStack}`;
    lines = wrapLines(ctx, quoted, TEXT_MAX_WIDTH);
    lineHeight = Math.round(fontSize * 1.16);
    if (lines.length * lineHeight <= maxBlockHeight) break;
    fontSize -= 2;
  }

  const blockHeight = lines.length * lineHeight + kickerBlock;
  const areaCenter = (TEXT_AREA_TOP + TEXT_AREA_BOTTOM) / 2;
  let y = Math.max(TEXT_AREA_TOP, areaCenter - blockHeight / 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Kicker (ex.: VERSÍCULO DO DIA) com espaçamento manual e ajuste para caber
  if (options.kicker) {
    const kicker = truncate(options.kicker.toUpperCase(), 44);
    let kickerSize = 34;
    let spacing = 5;
    let kickerWidth = 0;
    while (kickerSize >= 20) {
      ctx.font = `${kickerSize}px ${fontStack}`;
      kickerWidth = ctx.measureText(kicker).width + spacing * (kicker.length - 1);
      if (kickerWidth <= TEXT_MAX_WIDTH) break;
      kickerSize -= 2;
      spacing = Math.max(2, spacing - 0.5);
    }
    ctx.fillStyle = SAND;
    ctx.textAlign = 'left';
    let x = (WIDTH - kickerWidth) / 2;
    for (const ch of kicker) {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + spacing;
    }
    ctx.textAlign = 'center';
    y += kickerBlock;
  }

  // Texto do versículo
  ctx.font = `${fontSize}px ${fontStack}`;
  ctx.fillStyle = CREAM;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += lineHeight;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Referência bíblica
  ctx.font = `46px ${fontStack}`;
  ctx.fillStyle = SAND;
  ctx.fillText(options.reference, WIDTH / 2, TEXT_AREA_BOTTOM + 40);

  // Marca d'água discreta
  ctx.font = `26px ${fontStack}`;
  ctx.fillStyle = 'rgba(247, 243, 234, 0.65)';
  ctx.fillText('amanhecer-beta.vercel.app', WIDTH / 2, TEXT_AREA_BOTTOM + 108);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))),
      'image/jpeg',
      0.93
    );
  });
}

export type ShareResult = 'shared' | 'downloaded' | 'copied' | 'cancelled';

/**
 * Compartilha a imagem do versículo. Em celulares abre a folha de compartilhamento
 * nativa (WhatsApp, Instagram, etc.) já com a imagem; em computadores baixa o arquivo.
 */
export async function shareVerseImage(
  options: VerseImageOptions,
  caption: string,
  fileName = 'amanhecer-versiculo.jpg'
): Promise<ShareResult> {
  let blob: Blob | null = null;
  try {
    blob = await generateVerseImageBlob(options);
  } catch (err) {
    console.warn('Falha ao gerar imagem, compartilhando apenas texto.', err);
  }

  if (blob) {
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: caption });
        return 'shared';
      } catch (err: any) {
        if (err?.name === 'AbortError') return 'cancelled';
      }
    }

    // Fallback desktop: baixa a imagem
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    try {
      await navigator.clipboard?.writeText(caption);
    } catch {
      // ignore
    }
    return 'downloaded';
  }

  if (navigator.share) {
    try {
      await navigator.share({ text: caption });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(caption);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}
