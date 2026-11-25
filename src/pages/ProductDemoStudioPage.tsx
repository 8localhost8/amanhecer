import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Headphones,
  Heart,
  HelpCircle,
  Maximize2,
  Moon,
  Play,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { getDevotionalForDate } from '../content/devotionals/vault';
import { selectDailyVerse } from '../services/daily-verse/selection-engine';
import { getDailyVerifiedSong } from '../content/songs/catalog';
import { WALLPAPER_CATALOG } from '../content/wallpapers/catalog';
import { DonationCard } from '../components/DonationCard';
import {
  AnimatedBellIcon,
  AnimatedBookOpenIcon,
  AnimatedBookmarkDiaryIcon,
  AnimatedClockHistoryIcon,
  AnimatedHeartIcon,
  AnimatedImageWallpaperIcon,
  AnimatedMoonIcon,
  AnimatedSettingsIcon,
  AnimatedShieldCheckIcon,
  AnimatedTypeIcon,
  AnimatedUploadGalleryIcon,
  AnimatedUserIcon,
} from '../components/AnimatedIcons';

declare global {
  interface Window {
    __setDemoTime?: (tSeconds: number) => void;
    __demoReady?: boolean;
  }
}

export const COMMERCIAL_DURATION_SEC = 18.0;
const PHONE_W = 390;
const PHONE_H = 844;

const SVG_W = 400;
const SVG_H = 86;
const BAR_TOP_Y = 22;
const BAR_BOT_Y = 82;
const TAB_CENTERS = [44, 122, 200, 278, 356];

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  const x = clamp(t);
  return 1 - Math.pow(1 - x, 3);
}

function easeOutBack(t: number, overshoot = 1.35): number {
  const x = clamp(t);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function buildLiquidBarPath(notchX: number, notchDepth: number): string {
  const r = 28;
  const left = 4;
  const right = SVG_W - 4;
  const halfSpan = 42;
  const c1 = 21;
  const c2 = 17;

  const x0 = Math.max(left + r, notchX - halfSpan);
  const x3 = Math.min(right - r, notchX + halfSpan);
  const peakY = BAR_TOP_Y + notchDepth;

  return [
    `M ${left + r} ${BAR_TOP_Y}`,
    `L ${x0.toFixed(2)} ${BAR_TOP_Y}`,
    `C ${(notchX - c1).toFixed(2)} ${BAR_TOP_Y}, ${(notchX - c2).toFixed(2)} ${peakY.toFixed(
      2
    )}, ${notchX.toFixed(2)} ${peakY.toFixed(2)}`,
    `C ${(notchX + c2).toFixed(2)} ${peakY.toFixed(2)}, ${(notchX + c1).toFixed(
      2
    )} ${BAR_TOP_Y}, ${x3.toFixed(2)} ${BAR_TOP_Y}`,
    `L ${right - r} ${BAR_TOP_Y}`,
    `A ${r} ${r} 0 0 1 ${right} ${BAR_TOP_Y + r}`,
    `L ${right} ${BAR_BOT_Y - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${BAR_BOT_Y}`,
    `L ${left + r} ${BAR_BOT_Y}`,
    `A ${r} ${r} 0 0 1 ${left} ${BAR_BOT_Y - r}`,
    `L ${left} ${BAR_TOP_Y + r}`,
    `A ${r} ${r} 0 0 1 ${left + r} ${BAR_TOP_Y}`,
    'Z',
  ].join(' ');
}

/**
 * Deterministic Liquid Nav state for any timestamp `tSec` given a schedule of tab switches.
 * Reproduces the exact 3-phase liquid wave:
 * 1) old circle plunges into bar while scoop slides,
 * 2) bar bulges upward into a liquid dome as new circle erupts,
 * 3) dome separates and settles into concave cradle.
 */
function computeLiquidNavAtTime(
  tSec: number,
  transitions: Array<{ start: number; duration: number; fromIdx: number; toIdx: number }>,
  defaultIdx = 0
) {
  let currentIdx = defaultIdx;
  for (const tr of transitions) {
    if (tSec >= tr.start + tr.duration) {
      currentIdx = tr.toIdx;
    } else if (tSec >= tr.start && tSec < tr.start + tr.duration) {
      const t = clamp((tSec - tr.start) / tr.duration);
      const startX = TAB_CENTERS[tr.fromIdx];
      const targetX = TAB_CENTERS[tr.toIdx];

      let notchX = targetX;
      let notchDepth = 26;
      let bubbleX = targetX;
      let bubbleY = 0;
      let bubbleScale = 1;
      let activeIdx = tr.toIdx;
      let strokeProgress = 1;

      if (t < 0.28) {
        const p = t / 0.28;
        const smoothP = p * p * (3 - 2 * p);
        activeIdx = tr.fromIdx;
        bubbleX = startX;
        bubbleY = smoothP * 28;
        bubbleScale = 1 - smoothP * 0.72;
        notchX = startX + (targetX - startX) * (smoothP * 0.65);
        notchDepth = 26 - smoothP * 14;
        strokeProgress = 1;
      } else if (t < 0.56) {
        const p = (t - 0.28) / 0.28;
        const domePulse = Math.sin(p * Math.PI);
        activeIdx = tr.toIdx;
        notchX = startX + (targetX - startX) * (0.65 + p * 0.35);
        notchDepth = 12 - domePulse * 25; // Upward liquid droplet bulge!
        bubbleX = targetX;
        bubbleY = (1 - p) * 24 - domePulse * 5;
        bubbleScale = 0.35 + p * 0.75;
        strokeProgress = p * 0.7;
      } else {
        const p = (t - 0.56) / 0.44;
        const springP = easeOutBack(p, 1.45);
        activeIdx = tr.toIdx;
        notchX = targetX;
        notchDepth = -7 + springP * 33;
        bubbleX = targetX;
        bubbleY = (1 - springP) * -5;
        bubbleScale = 1 + Math.sin(p * Math.PI) * 0.07;
        strokeProgress = 0.7 + p * 0.3;
      }

      return {
        notchX,
        notchDepth,
        bubbleX,
        bubbleY,
        bubbleScale,
        activeIdx,
        strokeProgress,
        transitionProgress: t,
      };
    }
  }

  return {
    notchX: TAB_CENTERS[currentIdx],
    notchDepth: 26,
    bubbleX: TAB_CENTERS[currentIdx],
    bubbleY: 0,
    bubbleScale: 1,
    activeIdx: currentIdx,
    strokeProgress: 1,
    transitionProgress: 0,
  };
}

interface KeyframeCamera {
  t: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  panX: number;
  panY: number;
}

function interpolateCamera(tSec: number, keyframes: KeyframeCamera[]) {
  if (tSec <= keyframes[0].t) return keyframes[0];
  if (tSec >= keyframes[keyframes.length - 1].t) return keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (tSec >= a.t && tSec <= b.t) {
      const localT = easeInOutCubic((tSec - a.t) / (b.t - a.t));
      return {
        t: tSec,
        rotX: lerp(a.rotX, b.rotX, localT),
        rotY: lerp(a.rotY, b.rotY, localT),
        rotZ: lerp(a.rotZ, b.rotZ, localT),
        scale: lerp(a.scale, b.scale, localT),
        panX: lerp(a.panX, b.panX, localT),
        panY: lerp(a.panY, b.panY, localT),
      };
    }
  }
  return keyframes[keyframes.length - 1];
}

export const ProductDemoStudioPage: React.FC = () => {
  const searchParams = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(),
    []
  );
  const autoplay = searchParams.get('autoplay') === '1';
  const initialTimeParam = parseFloat(searchParams.get('t') || '0');
  const [timeSec, setTimeSec] = useState<number>(
    Number.isFinite(initialTimeParam) ? clamp(initialTimeParam, 0, COMMERCIAL_DURATION_SEC) : 0
  );

  // Real data from Amanhecer matching the user's screen recording (Tuesday, Nov 24, 2026)
  const demoDate = '2026-11-24';
  const devotional = useMemo(() => getDevotionalForDate(demoDate), []);
  const dailyVerse = useMemo(() => selectDailyVerse(demoDate), []);
  const songOfTheDay = useMemo(() => getDailyVerifiedSong(demoDate), []);

  const homeScrollRef = useRef<HTMLDivElement>(null);
  const wallpaperScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    window.__setDemoTime = (nextT: number) => {
      flushSync(() => {
        setTimeSec(clamp(nextT, 0, COMMERCIAL_DURATION_SEC));
      });
    };
    window.__demoReady = true;
    return () => {
      delete window.__setDemoTime;
      delete window.__demoReady;
    };
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    let rafId = 0;
    const start = performance.now() - timeSec * 1000;
    const tick = (now: number) => {
      const elapsed = ((now - start) / 1000) % COMMERCIAL_DURATION_SEC;
      setTimeSec(elapsed);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoplay]);

  // ===========================================================================
  // ACT 1 (0.0s – 5.6s): STANDALONE 3D LIQUID BAR MACRO SHOWCASE (OUTSIDE PHONE)
  // ===========================================================================
  // Apple-style floating hardware/UI macro shot: the Liquid Bottom Bar floats in
  // 3D studio space by itself with extruded glass depth while the camera sweeps
  // from left to right following the liquid wave across all 5 tabs:
  // Hoje (0) -> Histórico (1) -> Favoritos (2) -> Diário (3) -> Ajustes (4)
  const act1NavTransitions = useMemo(
    () => [
      { start: 0.65, duration: 0.68, fromIdx: 0, toIdx: 1 }, // Hoje -> Histórico
      { start: 1.65, duration: 0.68, fromIdx: 1, toIdx: 2 }, // Histórico -> Favoritos
      { start: 2.65, duration: 0.68, fromIdx: 2, toIdx: 3 }, // Favoritos -> Diário
      { start: 3.65, duration: 0.68, fromIdx: 3, toIdx: 4 }, // Diário -> Ajustes
    ],
    []
  );
  const act1Nav = computeLiquidNavAtTime(timeSec, act1NavTransitions, 0);

  // Apple-style macro camera keyframes for the standalone 3D Liquid Bar (0.0s – 5.6s)
  const act1CameraKeyframes: KeyframeCamera[] = useMemo(
    () => [
      // Dramatic low-angle macro reveal on left side ("Hoje" -> "Histórico")
      { t: 0.0, rotX: 24, rotY: 28, rotZ: -4.5, scale: 2.15, panX: 115, panY: 10 },
      // Sweeping tracking pan across center ("Favoritos")
      { t: 2.1, rotX: 18, rotY: 4, rotZ: -0.8, scale: 2.38, panX: 0, panY: -12 },
      // Dramatic counter-orbit to right side as wave erupts into "Diário" & "Ajustes"
      { t: 4.1, rotX: 16, rotY: -26, rotZ: 3.8, scale: 2.25, panX: -115, panY: 6 },
      // Pull back & align horizontally at 5.0s–5.6s before morphing into the full 3D Phone
      { t: 5.1, rotX: 10, rotY: -12, rotZ: 1.0, scale: 1.65, panX: 0, panY: 40 },
      { t: 5.65, rotX: 6, rotY: -14, rotZ: -0.8, scale: 1.05, panX: 0, panY: 280 },
    ],
    []
  );
  const act1Cam = interpolateCamera(timeSec, act1CameraKeyframes);

  // Crossfade transition between Act 1 (Standalone 3D Liquid Bar) and Act 2 (Full 3D Phone)
  // Between 5.05s and 5.65s, the standalone bar docks seamlessly into the bottom of the 3D phone!
  const act2Reveal = easeInOutCubic((timeSec - 5.0) / 0.65);
  const act1Opacity = 1 - easeInOutCubic((timeSec - 5.15) / 0.45);

  // ===========================================================================
  // ACT 2 (5.1s – 18.0s): FULL 3D SMARTPHONE — WALLPAPER FEATURE & LIVE PREVIEW
  // ===========================================================================
  // Timeline inside the 3D phone (matching user's base recording in Anucio/Wallpaper e barra liquida):
  // - 5.1s – 7.1s: Phone opens on Configurações (Ajustes) with Fundo #1 active.
  //                Touch taps "Papel de Parede [NOVO]" at 6.65s -> opens Papel de Parede section at 7.05s.
  // - 7.1s – 10.8s: Inside Papel de Parede:
  //                7.5s – 8.6s: Scrolls down to "Coleção de Fundos (70) • 1080×1920 HD" grid.
  //                8.85s: Touch taps Fundo #32 (B&W floral meadow) -> background & preview change to #32!
  //                9.4s – 10.1s: Scrolls slightly & at 10.15s taps Fundo #4 (Starry Night) -> changes to #4!
  //                10.75s: Touch taps Fundo #5 (Sunset pastel sky from user's recording) -> changes to #5!
  // - 11.2s – 14.3s: Scrolls back up to "Prévia da Interface Real" & "Opacidade do Papel de Parede".
  //                Camera pushes in close on the Live Preview & Opacity Slider!
  //                12.1s – 14.1s: Opacity slider glides smoothly (78% -> 24% -> 68%), showing real-time
  //                darkening (0% = black) and solid image brightening (100% = solid) in both preview & app!
  // - 14.3s – 18.0s: Camera pulls back & sweeps down as touch taps "Hoje" on the Liquid Bottom Bar (14.7s).
  //                Liquid wave travels from Ajustes (4) -> Hoje (0)!
  //                Home screen ("Graça e paz, Usuário! • Misericórdias Novas no Alvorecer") appears with
  //                the new wallpaper applied and scrolls smoothly down through Versículo & Música do Dia!

  const act2NavTransitions = useMemo(
    () => [
      { start: 14.65, duration: 0.65, fromIdx: 4, toIdx: 0 }, // Ajustes -> Hoje
    ],
    []
  );
  const act2Nav = computeLiquidNavAtTime(timeSec, act2NavTransitions, 4);

  // Active Screen inside Phone: 'settings-menu' | 'settings-wallpaper' | 'home'
  const settingsToWallpaperProgress = easeInOutCubic((timeSec - 6.85) / 0.38);
  const wallpaperToHomeProgress = easeInOutCubic((timeSec - 14.85) / 0.42);

  // Active Wallpaper & Opacity over time (matching user's base recording)
  let currentWallpaperId = 'bg-1';
  let currentWallpaperTitle = 'Fundo 1';
  if (timeSec >= 10.75) {
    currentWallpaperId = 'bg-5';
    currentWallpaperTitle = 'Fundo 5';
  } else if (timeSec >= 10.0) {
    currentWallpaperId = 'bg-4';
    currentWallpaperTitle = 'Fundo 4';
  } else if (timeSec >= 8.85) {
    currentWallpaperId = 'bg-32';
    currentWallpaperTitle = 'Fundo 32';
  }

  const currentWallpaperUrl = `/wallpapers/verse_bgs/${currentWallpaperId.replace('bg-', 'bg_')}.jpg`;

  // Opacity slider choreography (78% -> 24% -> 68%)
  let currentOpacity = 78;
  if (timeSec >= 12.0 && timeSec < 13.1) {
    const p = easeInOutCubic((timeSec - 12.0) / 1.0);
    currentOpacity = Math.round(lerp(78, 24, p));
  } else if (timeSec >= 13.1 && timeSec < 14.2) {
    const p = easeInOutCubic((timeSec - 13.1) / 1.0);
    currentOpacity = Math.round(lerp(24, 68, p));
  } else if (timeSec >= 14.2) {
    currentOpacity = 68;
  }

  // Wallpaper section scroll position:
  // - 7.0s – 7.5s: 0px (top of Papel de Parede)
  // - 7.5s – 8.6s: scrolls down to 575px (showing the 3x3 grid of 9:16 HD wallpapers #1..#9)
  // - 8.6s – 11.1s: stays on the wallpaper grid while tapping #32 (or #7/#4/#5)
  // - 11.1s – 11.9s: scrolls back up to 65px (framing Prévia da Interface Real + Opacidade slider)
  let wallpaperScrollTop = 0;
  if (timeSec >= 7.5 && timeSec < 11.1) {
    const downP = easeInOutCubic((timeSec - 7.5) / 1.05);
    wallpaperScrollTop = lerp(0, 560, downP);
  } else if (timeSec >= 11.1) {
    const upP = easeInOutCubic((timeSec - 11.1) / 0.8);
    wallpaperScrollTop = lerp(560, 68, upP);
  }

  // Home screen scroll position in finale (15.5s – 17.6s)
  const homeScrollTop =
    timeSec >= 15.5 ? lerp(0, 480, easeInOutCubic((timeSec - 15.5) / 2.0)) : 0;

  useLayoutEffect(() => {
    if (wallpaperScrollRef.current) {
      wallpaperScrollRef.current.scrollTop = wallpaperScrollTop;
    }
    if (homeScrollRef.current) {
      homeScrollRef.current.scrollTop = homeScrollTop;
    }
  }, [wallpaperScrollTop, homeScrollTop]);

  // Apple-style dynamic 3D camera keyframes for the Smartphone (Act 2: 5.0s – 18.0s)
  const act2CameraKeyframes: KeyframeCamera[] = useMemo(
    () => [
      // 5.0s: Phone emerges with dramatic angled reveal
      { t: 5.0, rotX: 14, rotY: -24, rotZ: -2.5, scale: 1.25, panX: 0, panY: 40 },
      // 6.5s: Push-in & tilt onto "Papel de Parede [NOVO]" row in Configurações
      { t: 6.6, rotX: 8, rotY: -16, rotZ: -1.2, scale: 1.78, panX: 25, panY: 55 },
      // 8.5s: Sweeping Apple orbital flip to the right as user scrolls the 9:16 Wallpaper Grid!
      { t: 8.6, rotX: -5, rotY: 21, rotZ: 1.8, scale: 1.72, panX: -28, panY: -85 },
      // 10.6s: Close-up angled tracking on the Wallpaper Grid as #32 -> #4 -> #5 are tapped
      { t: 10.7, rotX: 4, rotY: 15, rotZ: 1.1, scale: 1.82, panX: -18, panY: -65 },
      // 12.2s: Fast Apple macro orbit back to left-front, framing "Prévia da Interface Real" & "Opacidade" slider!
      { t: 12.1, rotX: 11, rotY: -15, rotZ: -1.0, scale: 1.92, panX: 22, panY: 95 },
      // 13.9s: Slow push-in while Opacity Slider glides 78% -> 24% -> 68%
      { t: 13.9, rotX: 7, rotY: -9, rotZ: -0.5, scale: 1.98, panX: 12, panY: 75 },
      // 14.8s: Camera dips to bottom Liquid Bar as user taps "Hoje"
      { t: 14.8, rotX: 14, rotY: 12, rotZ: 0.9, scale: 1.74, panX: -15, panY: -210 },
      // 16.0s: Pull back to full-phone Hero Shot as "Hoje" opens with new Wallpaper
      { t: 16.1, rotX: 6, rotY: -14, rotZ: -0.8, scale: 1.52, panX: 0, panY: 0 },
      // 18.0s: Majestic floating hero pose at end of commercial
      { t: 18.0, rotX: 3.5, rotY: -9.5, rotZ: -0.3, scale: 1.46, panX: 0, panY: 0 },
    ],
    []
  );
  const act2Cam = interpolateCamera(timeSec, act2CameraKeyframes);

  // Touch Indicator Choreography inside the 390x844 Phone Screen (Act 2)
  let touchX = 195;
  let touchY = 400;
  let touchOpacity = 0;
  let touchScale = 1;
  let rippleProgress = 0;

  if (timeSec >= 6.35 && timeSec <= 7.05) {
    // Tap "Papel de Parede [NOVO]" in Configurações menu (x=195, y=385)
    const p = clamp((timeSec - 6.35) / 0.7);
    touchOpacity = Math.sin(p * Math.PI);
    touchX = 195;
    touchY = 385;
    const tap = clamp((timeSec - 6.55) / 0.35);
    touchScale = 1 - Math.sin(tap * Math.PI) * 0.22;
    rippleProgress = tap;
  } else if (timeSec >= 7.5 && timeSec <= 8.55) {
    // Swipe up to scroll down to Coleção de Fundos
    const p = clamp((timeSec - 7.5) / 1.05);
    touchOpacity = Math.sin(p * Math.PI) * 0.9;
    touchX = 205;
    touchY = lerp(640, 260, easeInOutCubic(p));
    touchScale = 0.92;
  } else if (timeSec >= 8.65 && timeSec <= 9.25) {
    // Tap Wallpaper card #32 (top-right card in grid: x=306, y=475)
    const p = clamp((timeSec - 8.65) / 0.6);
    touchOpacity = Math.sin(p * Math.PI);
    touchX = 306;
    touchY = 475;
    const tap = clamp((timeSec - 8.8) / 0.35);
    touchScale = 1 - Math.sin(tap * Math.PI) * 0.24;
    rippleProgress = tap;
  } else if (timeSec >= 9.8 && timeSec <= 10.4) {
    // Tap Wallpaper card #4 (middle-left card in grid: x=84, y=665)
    const p = clamp((timeSec - 9.8) / 0.6);
    touchOpacity = Math.sin(p * Math.PI);
    touchX = 84;
    touchY = 665;
    const tap = clamp((timeSec - 9.95) / 0.35);
    touchScale = 1 - Math.sin(tap * Math.PI) * 0.24;
    rippleProgress = tap;
  } else if (timeSec >= 10.55 && timeSec <= 11.15) {
    // Tap Wallpaper card #5 (middle-center card in grid: x=195, y=665)
    const p = clamp((timeSec - 10.55) / 0.6);
    touchOpacity = Math.sin(p * Math.PI);
    touchX = 195;
    touchY = 665;
    const tap = clamp((timeSec - 10.7) / 0.35);
    touchScale = 1 - Math.sin(tap * Math.PI) * 0.24;
    rippleProgress = tap;
  } else if (timeSec >= 11.95 && timeSec <= 14.15) {
    // Drag the Opacity Slider thumb (y=638, x moves with currentOpacity 78% -> 24% -> 68%)
    const appear = clamp((timeSec - 11.95) / 0.2);
    const fade = clamp((14.15 - timeSec) / 0.2);
    touchOpacity = Math.min(appear, fade) * 0.95;
    touchX = lerp(48, 342, currentOpacity / 100);
    touchY = 638;
    touchScale = 0.88;
  } else if (timeSec >= 14.45 && timeSec <= 15.05) {
    // Tap "Hoje" on the Liquid Bottom Bar (x=54, y=790)
    const p = clamp((timeSec - 14.45) / 0.6);
    touchOpacity = Math.sin(p * Math.PI);
    touchX = 54;
    touchY = 790;
    const tap = clamp((timeSec - 14.6) / 0.35);
    touchScale = 1 - Math.sin(tap * Math.PI) * 0.24;
    rippleProgress = tap;
  } else if (timeSec >= 15.55 && timeSec <= 17.3) {
    // Smooth swipe on Home screen to admire the wallpaper behind the cards
    const p = clamp((timeSec - 15.55) / 1.75);
    touchOpacity = Math.sin(p * Math.PI) * 0.85;
    touchX = 205;
    touchY = lerp(630, 270, easeInOutCubic(p));
    touchScale = 0.92;
  }

  // First 9 wallpapers displayed in the 3x3 9:16 vertical grid (with #3 showing bg_32 so both #32, #4, and #5 are right in the visible grid!)
  const demoGridWallpapers = useMemo(() => {
    const base = WALLPAPER_CATALOG.slice(0, 9).map((w) => ({ ...w }));
    // Put bg_32 in slot 3 so tapping it in the visible 3x3 grid shows the exact floral B&W wallpaper from the user's video!
    base[2] = {
      id: 'bg-32',
      title: 'Fundo 32',
      url: '/wallpapers/verse_bgs/bg_32.jpg',
      number: 32,
    };
    return base;
  }, []);

  const navTabs = useMemo(
    () => [
      { id: 'home', label: 'Hoje', Icon: AnimatedBookOpenIcon },
      { id: 'history', label: 'Histórico', Icon: AnimatedClockHistoryIcon },
      { id: 'favorites', label: 'Favoritos', Icon: AnimatedHeartIcon },
      { id: 'diary', label: 'Diário', Icon: AnimatedBookmarkDiaryIcon },
      { id: 'settings', label: 'Ajustes', Icon: AnimatedSettingsIcon },
    ],
    []
  );

  const depthSlices = useMemo(() => Array.from({ length: 18 }, (_, i) => -(i + 1)), []);
  const barDepthSlices = useMemo(() => Array.from({ length: 12 }, (_, i) => -(i + 1) * 1.5), []);

  const renderLiquidNavComponent = (
    navState: ReturnType<typeof computeLiquidNavAtTime>,
    isStandalone3D = false
  ) => {
    const ActiveIcon = navTabs[navState.activeIdx]?.Icon || AnimatedBookOpenIcon;
    const bubbleLeftPct = (navState.bubbleX / SVG_W) * 100;

    return (
      <div
        className="relative select-none"
        style={{
          width: isStandalone3D ? '420px' : '100%',
          height: isStandalone3D ? '92px' : '82px',
          transformStyle: isStandalone3D ? 'preserve-3d' : undefined,
        }}
      >
        {/* 3D Glass/Titanium Extrusion Slices when floating standalone in Act 1 */}
        {isStandalone3D &&
          barDepthSlices.map((z, idx) => (
            <svg
              key={z}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
              style={{
                transform: `translateZ(${z}px)`,
                opacity: idx === barDepthSlices.length - 1 ? 0.95 : 0.7,
              }}
            >
              <path
                d={buildLiquidBarPath(navState.notchX, navState.notchDepth)}
                fill={idx % 2 === 0 ? '#182118' : '#0F150F'}
                stroke="rgba(217, 199, 163, 0.22)"
                strokeWidth="1.2"
              />
            </svg>
          ))}

        {/* Main Liquid SVG Bar */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible drop-shadow-[0_18px_36px_rgba(0,0,0,0.75)]"
        >
          <defs>
            <linearGradient id="studioNavDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#232D23" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#151C15" stopOpacity="0.99" />
            </linearGradient>
          </defs>
          <path
            d={buildLiquidBarPath(navState.notchX, navState.notchDepth)}
            fill="url(#studioNavDark)"
            stroke="rgba(217, 199, 163, 0.38)"
            strokeWidth="1.4"
          />
        </svg>

        {/* Erupting / Floating Tactile Sage Bubble */}
        <div
          style={{
            left: `${bubbleLeftPct}%`,
            transform: `translate(-50%, ${navState.bubbleY.toFixed(1)}px) scale(${navState.bubbleScale.toFixed(
              3
            )}) ${isStandalone3D ? 'translateZ(10px)' : ''}`,
          }}
          className="pointer-events-none absolute top-[1px] z-20 w-12 h-12 rounded-full btn-tactile-sage flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
        >
          <ActiveIcon className="w-5 h-5" active={true} />
        </div>

        {/* 5 Tab Icons & Labels */}
        <div
          className="absolute inset-x-1 top-[22px] bottom-[4px] z-10 flex items-center justify-around"
          style={{ transform: isStandalone3D ? 'translateZ(4px)' : undefined }}
        >
          {navTabs.map((tab, idx) => {
            const Icon = tab.Icon;
            const isActive = idx === navState.activeIdx;
            return (
              <div
                key={tab.id}
                className="relative flex-1 h-full flex flex-col items-center justify-end pb-2"
              >
                <div
                  style={{
                    opacity: isActive ? 0 : 1,
                    transform: isActive ? 'translateY(-10px) scale(0.75)' : 'translateY(0) scale(1)',
                  }}
                  className="relative text-sand-300/85"
                >
                  <Icon className="w-5 h-5" active={false} />
                </div>
                <span
                  className={`text-[10px] tracking-tight mt-1 ${
                    isActive ? 'font-bold text-cream-100' : 'font-medium text-sand-300/80'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="dark relative w-screen h-screen overflow-hidden flex items-center justify-center select-none"
      style={{
        background:
          'radial-gradient(ellipse 85% 65% at 50% 45%, #162018 0%, #0A0E0B 55%, #030403 100%)',
      }}
    >
      <style>{`
        .studio-no-transition *,
        .studio-no-transition *::before,
        .studio-no-transition *::after {
          transition: none !important;
        }
        .studio-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Dynamic Studio Key Light & Volumetric Rim Glows */}
      <div
        className="pointer-events-none absolute -top-28 -left-24 w-[780px] h-[780px] rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(217,199,163,0.46) 0%, rgba(130,145,123,0.14) 50%, transparent 72%)',
          transform: `translate3d(${Math.sin(timeSec * 0.4) * 35}px, ${Math.cos(timeSec * 0.3) * 25}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 w-[760px] h-[760px] rounded-full opacity-45 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(130,145,123,0.38) 0%, rgba(56,71,54,0.20) 50%, transparent 74%)',
          transform: `translate3d(${-Math.cos(timeSec * 0.35) * 30}px, ${-Math.sin(timeSec * 0.4) * 20}px, 0)`,
        }}
      />

      {/* =====================================================================
          ACT 1 STAGE: STANDALONE 3D LIQUID NAVIGATION BAR (OUTSIDE THE PHONE)
         ===================================================================== */}
      {act1Opacity > 0.005 && (
        <div
          className="studio-no-transition pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{
            perspective: '1400px',
            opacity: act1Opacity,
          }}
        >
          {/* Subtle Floating Editorial Kicker Above the 3D Liquid Bar */}
          <div
            className="mb-24 text-center space-y-1.5"
            style={{
              opacity: clamp(1 - (timeSec - 4.4) / 0.6),
              transform: `translate3d(0, ${lerp(14, 0, clamp(timeSec / 0.6))}px, 0)`,
            }}
          >
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/[0.06] border border-sand-300/30 text-[11px] font-bold uppercase tracking-[0.2em] text-sand-300">
              <Sparkles className="w-3 h-3 text-sand-300" />
              <span>Novo Design • Amanhecer</span>
            </span>
            <h2 className="text-2xl font-serif font-bold text-cream-50 tracking-tight drop-shadow-md">
              Barra Líquida & Ícones Vivos
            </h2>
          </div>

          {/* 3D Floating Liquid Bar Assembly */}
          <div
            style={{
              transformStyle: 'preserve-3d',
              transform: `translate3d(${act1Cam.panX.toFixed(2)}px, ${act1Cam.panY.toFixed(
                2
              )}px, 0px) scale(${act1Cam.scale.toFixed(4)}) rotateX(${act1Cam.rotX.toFixed(
                3
              )}deg) rotateY(${act1Cam.rotY.toFixed(3)}deg) rotateZ(${act1Cam.rotZ.toFixed(
                3
              )}deg)`,
            }}
          >
            {/* Soft Ambient Floor Glow under the Floating Bar */}
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[390px] h-[36px] rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(217,199,163,0.32) 0%, rgba(0,0,0,0.85) 75%)',
                transform: 'translateZ(-25px)',
              }}
            />

            {renderLiquidNavComponent(act1Nav, true)}
          </div>
        </div>
      )}

      {/* =====================================================================
          ACT 2 STAGE: 3D SMARTPHONE WITH DYNAMIC APPLE CAMERA CHOREOGRAPHY
         ===================================================================== */}
      {act2Reveal > 0.005 && (
        <div
          className="studio-no-transition relative z-20 flex items-center justify-center"
          style={{
            perspective: '1650px',
            perspectiveOrigin: '50% 48%',
            opacity: act2Reveal,
          }}
        >
          <div
            className="relative"
            style={{
              width: `${PHONE_W + 24}px`,
              height: `${PHONE_H + 24}px`,
              transformStyle: 'preserve-3d',
              transform: `translate3d(${act2Cam.panX.toFixed(2)}px, ${act2Cam.panY.toFixed(
                2
              )}px, 0px) scale(${act2Cam.scale.toFixed(4)}) rotateX(${act2Cam.rotX.toFixed(
                3
              )}deg) rotateY(${act2Cam.rotY.toFixed(3)}deg) rotateZ(${act2Cam.rotZ.toFixed(
                3
              )}deg)`,
            }}
          >
            {/* 3D Titanium Chassis Depth Slices */}
            {depthSlices.map((z, idx) => {
              const isRimHighlight = idx === 1 || idx === depthSlices.length - 2;
              const isBackPlate = idx === depthSlices.length - 1;
              return (
                <div
                  key={z}
                  className="pointer-events-none absolute inset-0 rounded-[56px]"
                  style={{
                    transform: `translateZ(${z}px)`,
                    background: isBackPlate
                      ? '#090B09'
                      : isRimHighlight
                      ? 'linear-gradient(135deg, #525A50 0%, #242924 45%, #3E453D 100%)'
                      : 'linear-gradient(145deg, #282E28 0%, #141714 50%, #1E221E 100%)',
                    boxShadow: isBackPlate ? '0 50px 100px rgba(0,0,0,0.86)' : undefined,
                  }}
                />
              );
            })}

            {/* Side Hardware Buttons */}
            <div
              className="pointer-events-none absolute rounded-r-sm"
              style={{
                right: '-3px',
                top: '235px',
                width: '5px',
                height: '86px',
                background: 'linear-gradient(180deg, #565E54 0%, #262B26 50%, #484F47 100%)',
                transform: 'translateZ(-9px) rotateY(90deg)',
              }}
            />
            <div
              className="pointer-events-none absolute rounded-l-sm"
              style={{
                left: '-3px',
                top: '185px',
                width: '5px',
                height: '52px',
                background: 'linear-gradient(180deg, #4D554B 0%, #222622 50%, #3F453E 100%)',
                transform: 'translateZ(-9px) rotateY(-90deg)',
              }}
            />
            <div
              className="pointer-events-none absolute rounded-l-sm"
              style={{
                left: '-3px',
                top: '252px',
                width: '5px',
                height: '52px',
                background: 'linear-gradient(180deg, #4D554B 0%, #222622 50%, #3F453E 100%)',
                transform: 'translateZ(-9px) rotateY(-90deg)',
              }}
            />

            {/* Front Bezel */}
            <div
              className="relative w-full h-full rounded-[56px] p-[12px]"
              style={{
                background:
                  'linear-gradient(145deg, #2D332D 0%, #111311 35%, #0A0C0A 72%, #252A25 100%)',
                boxShadow:
                  'inset 0 0 0 1.5px rgba(255,255,255,0.18), inset 0 0 8px rgba(0,0,0,0.9)',
              }}
            >
              {/* Phone Screen (390x844) */}
              <div
                className="relative w-full h-full rounded-[44px] overflow-hidden bg-black text-[#F7F3EA]"
                style={{
                  width: `${PHONE_W}px`,
                  height: `${PHONE_H}px`,
                }}
              >
                {/* GLOBAL WALLPAPER BACKGROUND LAYER INSIDE THE PHONE (0% = Black, 100% = Solid Image) */}
                <div className="pointer-events-none absolute inset-0 z-0 bg-black overflow-hidden">
                  <img
                    src={currentWallpaperUrl}
                    alt=""
                    style={{ opacity: currentOpacity / 100 }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Top iOS Status Bar + Dynamic Island (matching 23.37 / 48% from user's video) */}
                <div className="relative z-40 h-[50px] px-7 pt-2 flex items-center justify-between bg-[#121813]/85 backdrop-blur-md text-white">
                  <div className="flex items-center space-x-1.5 text-[14px] font-semibold tracking-tight tabular-nums">
                    <span>23.37</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                    </span>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[118px] h-[33px] rounded-full bg-black border border-white/[0.06] flex items-center justify-end pr-3">
                    <div className="w-3 h-3 rounded-full bg-[#0E131D] ring-1 ring-white/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1D3557]/80" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-end space-x-[1.5px] h-2.5">
                      <span className="w-[2.5px] h-[4px] bg-white rounded-[1px]" />
                      <span className="w-[2.5px] h-[6px] bg-white rounded-[1px]" />
                      <span className="w-[2.5px] h-[8px] bg-white rounded-[1px]" />
                      <span className="w-[2.5px] h-[10px] bg-white rounded-[1px]" />
                    </div>
                    <Wifi className="w-3.5 h-3.5 text-white stroke-[2.4]" />
                    <div className="px-1.5 py-[1px] rounded-[5px] bg-[#34C759] text-white text-[10px] font-bold leading-tight">
                      49
                    </div>
                  </div>
                </div>

                {/* App Navbar */}
                <header className="relative z-30 bg-[#121813]/85 backdrop-blur-xl border-b border-graphite-800/80">
                  <div className="px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 text-left">
                      <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-sm ring-1 ring-graphite-700 flex items-center justify-center shrink-0">
                        <img
                          src="/icons/amanhecer-escuro.png"
                          alt="Amanhecer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xl font-bold tracking-tight text-cream-50 font-serif block leading-none">
                          Amanhecer
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-sand-300 block mt-0.5">
                          Devocional Diário
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <div className="surface-editorial p-2 text-cream-100 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-sand-300" />
                      </div>
                      <div className="surface-editorial p-2 text-cream-100 rounded-full">
                        <Moon className="w-4 h-4 text-sand-300" />
                      </div>
                      <div className="surface-editorial p-2 text-cream-100 rounded-full">
                        <HelpCircle className="w-4 h-4 text-sand-300" />
                      </div>
                    </div>
                  </div>
                </header>

                {/* MAIN SCREEN CONTENT AREA (730px) */}
                <div className="relative z-10 w-full h-[730px] overflow-hidden">
                  {/* ---------- VIEW 1: CONFIGURAÇÕES MENU (5.0s – 7.2s) ---------- */}
                  <div
                    className="absolute inset-0 px-4 pt-4 pb-28 overflow-hidden"
                    style={{
                      opacity: 1 - settingsToWallpaperProgress,
                      transform: `translate3d(${-settingsToWallpaperProgress * 30}px, 0, 0)`,
                      pointerEvents: settingsToWallpaperProgress > 0.5 ? 'none' : 'auto',
                    }}
                  >
                    <div className="space-y-5">
                      <div>
                        <h1 className="text-3xl font-bold font-serif text-cream-50 tracking-tight drop-shadow-xs">
                          Configurações
                        </h1>
                        <p className="text-xs text-sand-300 mt-0.5">
                          Escolha uma seção para personalizar seu aplicativo
                        </p>
                      </div>

                      {/* Card Usuário */}
                      <div className="w-full surface-editorial rounded-3xl p-4 flex items-center justify-between gap-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl btn-tactile-sage flex items-center justify-center shrink-0">
                            <AnimatedUserIcon active={true} className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold font-serif text-cream-50">
                              Usuário
                            </h2>
                            <p className="text-xs text-sand-300/90 mt-0.5">
                              Toque para alterar seu nome ou apelido
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-sand-300" />
                      </div>

                      {/* Grupo: Aparência e Leitura */}
                      <div className="space-y-2">
                        <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-sand-300 drop-shadow-2xs">
                          Aparência e Leitura
                        </h3>

                        <div className="surface-editorial rounded-3xl overflow-hidden divide-y divide-graphite-800">
                          {/* Papel de Parede [NOVO] */}
                          <div
                            className="w-full p-4 flex items-center justify-between gap-3"
                            style={{
                              transform:
                                timeSec >= 6.5 && timeSec <= 6.9 ? 'scale(0.97)' : 'scale(1)',
                              backgroundColor:
                                timeSec >= 6.5 && timeSec <= 6.9
                                  ? 'rgba(217, 199, 163, 0.12)'
                                  : undefined,
                            }}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sand-200 to-sand-300 text-sage-950 flex items-center justify-center shrink-0">
                                <AnimatedImageWallpaperIcon active={true} className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-cream-50">
                                    Papel de Parede
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-sand-300/20 text-sand-200 text-[9px] font-bold uppercase tracking-wider">
                                    Novo
                                  </span>
                                </div>
                                <p className="text-xs text-sand-300/85 mt-0.5">
                                  Foto da Galeria • 78%
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-sand-300" />
                          </div>

                          {/* Tema de Exibição */}
                          <div className="w-full p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-sand-300 flex items-center justify-center shrink-0">
                                <AnimatedMoonIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-cream-50 block">
                                  Tema de Exibição
                                </span>
                                <p className="text-xs text-sand-300/85 mt-0.5">Modo Escuro</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-sand-300" />
                          </div>

                          {/* Tamanho da Letra */}
                          <div className="w-full p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-sage-400/15 text-sage-300 flex items-center justify-center shrink-0">
                                <AnimatedTypeIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-cream-50 block">
                                  Tamanho da Letra
                                </span>
                                <p className="text-xs text-sand-300/85 mt-0.5">
                                  Fonte de leitura em 16px
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-sand-300" />
                          </div>
                        </div>
                      </div>

                      {/* Grupo: Lembretes e Privacidade */}
                      <div className="space-y-2">
                        <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-sand-300">
                          Lembretes e Privacidade
                        </h3>
                        <div className="surface-editorial rounded-3xl overflow-hidden divide-y divide-graphite-800">
                          <div className="w-full p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-sand-300/15 text-sand-200 flex items-center justify-center shrink-0">
                                <AnimatedBellIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-cream-50 block">
                                  Notificações Diárias
                                </span>
                                <p className="text-xs text-sand-300/85 mt-0.5">
                                  Ativadas (06:06 e lembretes)
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sand-300 text-sage-950">
                              Ativas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---------- VIEW 2: PAPEL DE PAREDE SECTION (6.85s – 15.1s) ---------- */}
                  <div
                    ref={wallpaperScrollRef}
                    className="studio-hide-scrollbar absolute inset-0 px-4 pt-4 pb-32 overflow-y-auto"
                    style={{
                      opacity: settingsToWallpaperProgress * (1 - wallpaperToHomeProgress),
                      transform: `translate3d(${
                        (1 - settingsToWallpaperProgress) * 30 - wallpaperToHomeProgress * 30
                      }px, 0, 0)`,
                      pointerEvents:
                        settingsToWallpaperProgress > 0.5 && wallpaperToHomeProgress < 0.5
                          ? 'auto'
                          : 'none',
                    }}
                  >
                    <div className="space-y-5 pb-24">
                      {/* Header Voltar */}
                      <div className="space-y-3">
                        <div className="inline-flex items-center space-x-2 py-2 px-3.5 rounded-full surface-editorial text-xs font-bold text-cream-100">
                          <ArrowLeft className="w-4 h-4 text-sand-300" />
                          <span>Voltar para Configurações</span>
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold font-serif text-cream-50 tracking-tight">
                            Papel de Parede
                          </h1>
                          <p className="text-xs text-sand-300 mt-0.5">
                            Escolha uma paisagem inspiradora ou envie da sua galeria com ajuste de opacidade
                          </p>
                        </div>
                      </div>

                      {/* Card 1: Prévia da Interface Real + Slider de Opacidade */}
                      <section className="surface-editorial rounded-3xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AnimatedImageWallpaperIcon
                              active={true}
                              className="w-4 h-4 text-sand-300"
                            />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-cream-100">
                              Prévia da Interface Real
                            </h2>
                          </div>
                          <span className="text-[11px] font-semibold text-sand-300">
                            {currentWallpaperTitle} • {currentOpacity}%
                          </span>
                        </div>

                        {/* Mini Live Preview Box */}
                        <div className="relative overflow-hidden rounded-[28px] border-2 border-graphite-700 shadow-2xl w-full h-[340px] bg-black">
                          <img
                            src={currentWallpaperUrl}
                            alt=""
                            style={{ opacity: currentOpacity / 100 }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="relative z-10 flex flex-col justify-between h-full text-cream-50">
                            <div className="px-3.5 py-2 bg-graphite-950/80 backdrop-blur-md border-b border-graphite-800/70 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-lg overflow-hidden ring-1 ring-graphite-700">
                                  <img
                                    src="/icons/amanhecer-escuro.png"
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <span className="text-xs font-bold font-serif block leading-none">
                                    Amanhecer
                                  </span>
                                  <span className="text-[7px] font-semibold uppercase tracking-widest text-sand-300 block">
                                    Devocional Diário
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="surface-editorial p-1 rounded-full">
                                  <ShieldCheck className="w-2.5 h-2.5 text-sand-300" />
                                </div>
                                <div className="surface-editorial p-1 rounded-full">
                                  <Moon className="w-2.5 h-2.5 text-sand-300" />
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 px-3.5 py-2 space-y-2 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full surface-editorial text-[8px] font-semibold text-cream-100">
                                    <Sparkles className="w-2 h-2 text-sand-300" />
                                    <span>Prévia ao Vivo</span>
                                  </span>
                                  <h4 className="text-xs font-bold font-serif text-white drop-shadow-md mt-0.5">
                                    Graça e paz, Usuário!
                                  </h4>
                                </div>
                                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-black/55 text-white border border-white/25 text-[9px] font-semibold">
                                  <Maximize2 className="w-2.5 h-2.5" />
                                  <span>Expandir</span>
                                </span>
                              </div>

                              <div className="surface-hero-sage text-cream-50 rounded-2xl p-3 space-y-1 shadow-md">
                                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[7px] font-semibold uppercase tracking-wider text-sand-200">
                                  <Sparkles className="w-2 h-2 text-sand-300" />
                                  <span>Devocional de Hoje • 5 min</span>
                                </div>
                                <h5 className="text-[11px] font-bold font-serif text-white leading-snug">
                                  Quando Passares pelas Águas, Estarei Contigo
                                </h5>
                                <p className="text-[8px] text-sand-200">
                                  Isaías 43:1-3 • Presença Soberana e Proteção Divina
                                </p>
                                <div className="pt-0.5">
                                  <span className="py-1 px-3 btn-tactile-cream font-bold rounded-full text-[8px] inline-flex items-center space-x-1">
                                    <Play className="w-2 h-2 fill-current text-sage-800" />
                                    <span>Começar Leitura</span>
                                  </span>
                                </div>
                              </div>

                              <div className="surface-editorial rounded-2xl p-2.5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-bold uppercase tracking-widest text-sand-300">
                                    Versículo do Dia
                                  </span>
                                  <span className="text-[7px] px-1.5 py-0.5 rounded-full border border-sand-300/35">
                                    Compartilhar
                                  </span>
                                </div>
                                <p className="font-serif italic text-[9px] text-cream-50 line-clamp-1">
                                  "O SENHOR é a minha luz e a minha salvação; de quem terei medo?"
                                </p>
                              </div>
                            </div>

                            <div className="px-3 pb-2">
                              <div className="surface-editorial rounded-full px-3 py-1 flex items-center justify-around text-[7px]">
                                <span className="font-bold text-cream-100">Hoje</span>
                                <span className="text-sand-300/70">Histórico</span>
                                <span className="text-sand-300/70">Favoritos</span>
                                <span className="text-sand-300/70">Diário</span>
                                <span className="text-sand-300/70">Ajustes</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Controle de Opacidade Customizado para Renderização 60fps */}
                        <div className="p-4 rounded-2xl bg-graphite-900/90 border border-graphite-700 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cream-100">
                              Opacidade do Papel de Parede
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-sand-300 text-sage-950 text-xs font-bold tabular-nums">
                              {currentOpacity}%
                            </span>
                          </div>

                          {/* Custom visual slider bar matching screenshot */}
                          <div className="relative h-2.5 w-full rounded-full bg-graphite-700 my-2">
                            <div
                              className="absolute left-0 top-0 bottom-0 rounded-full bg-[#D9C7A3]"
                              style={{ width: `${currentOpacity}%` }}
                            />
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D9C7A3] shadow-md border-2 border-cream-50"
                              style={{ left: `calc(${currentOpacity}% - 10px)` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-medium text-sand-300/80">
                            <span>0% = Preto total</span>
                            <span>50% = Equilibrado</span>
                            <span>100% = Imagem sólida</span>
                          </div>
                        </div>

                        {/* Botões Subir da Galeria & Usar Padrão */}
                        <div className="space-y-2">
                          <div className="w-full py-3 px-4 rounded-2xl btn-tactile-sage text-xs font-bold flex items-center justify-center space-x-2">
                            <AnimatedUploadGalleryIcon active={true} className="w-4 h-4" />
                            <span>Subir Imagem da Galeria</span>
                          </div>
                          <div className="w-full py-2.5 px-4 rounded-2xl border border-graphite-700 bg-graphite-800/80 text-cream-100 text-xs font-semibold flex items-center justify-center space-x-2">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Usar Fundo Padrão do App</span>
                          </div>
                        </div>
                      </section>

                      {/* Card 2: Coleção de Fundos (70) • 1080x1920 HD */}
                      <section className="surface-editorial rounded-3xl p-4 space-y-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold font-serif text-cream-50">
                              Coleção de Fundos (70)
                            </h3>
                            <p className="text-[11px] text-sand-300/85">
                              Imagens em proporção vertical Full HD (1080×1920) sem cortes nem perda de nitidez.
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-graphite-800 text-sand-200 text-[10px] font-bold shrink-0">
                            1080×1920 HD
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          {demoGridWallpapers.map((item) => {
                            const isSelected = currentWallpaperId === item.id;
                            return (
                              <div
                                key={item.id}
                                className={`relative aspect-[9/16] rounded-2xl overflow-hidden border-2 bg-graphite-900 ${
                                  isSelected
                                    ? 'border-sand-300 ring-2 ring-sand-300/45 scale-[1.02]'
                                    : 'border-graphite-700/60'
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-semibold text-white">
                                  #{item.number}
                                </span>
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full btn-tactile-sage flex items-center justify-center shadow-lg">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  </div>

                  {/* ---------- VIEW 3: HOME PAGE WITH APPLIED WALLPAPER (14.85s – 18.0s) ---------- */}
                  <div
                    ref={homeScrollRef}
                    className="studio-hide-scrollbar absolute inset-0 px-4 pt-4 pb-32 overflow-y-auto"
                    style={{
                      opacity: wallpaperToHomeProgress,
                      transform: `translate3d(${(1 - wallpaperToHomeProgress) * 30}px, 0, 0)`,
                      pointerEvents: wallpaperToHomeProgress > 0.5 ? 'auto' : 'none',
                    }}
                  >
                    <div className="space-y-6 pb-20">
                      <div className="space-y-2.5 pt-2">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full surface-editorial text-cream-100 text-xs font-semibold">
                          <Moon className="w-3.5 h-3.5 text-sand-300 shrink-0" />
                          <span>Boa noite</span>
                        </div>
                        <div className="space-y-0.5">
                          <h1 className="text-2xl font-bold text-white drop-shadow-md font-serif tracking-tight">
                            Graça e paz, Usuário!
                          </h1>
                          <p className="text-xs font-medium capitalize text-sand-200 drop-shadow-xs">
                            Terça-Feira, 24 De Novembro
                          </p>
                        </div>
                      </div>

                      {/* Hero Card Devocional de Hoje */}
                      <section className="surface-hero-sage text-cream-50 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-3/5 opacity-45 pointer-events-none overflow-hidden">
                          <svg
                            viewBox="0 0 240 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full object-cover"
                          >
                            <circle cx="178" cy="68" r="46" fill="#D9C7A3" opacity="0.22" />
                            <circle cx="178" cy="68" r="31" fill="#D9C7A3" />
                            <path
                              d="M30 200 C85 132, 155 152, 240 120 L240 200 Z"
                              fill="#82917B"
                              opacity="0.6"
                            />
                            <path
                              d="M0 200 C70 155, 145 175, 240 144 L240 200 Z"
                              fill="#50604B"
                              opacity="0.82"
                            />
                          </svg>
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-sand-200">
                            <Sparkles className="w-3 h-3 text-sand-300" />
                            <span>Devocional de Hoje • {devotional.estimatedMinutes} min</span>
                          </div>
                          <div className="space-y-1.5">
                            <h2 className="text-2xl font-bold font-serif tracking-tight leading-snug text-white">
                              {devotional.title}
                            </h2>
                            <p className="text-xs text-sand-200 font-medium">
                              {devotional.verseOfTheDay.reference} • {devotional.theme}
                            </p>
                          </div>
                          <p className="text-xs text-cream-100/85 line-clamp-2 leading-relaxed">
                            {devotional.reflection}
                          </p>
                          <div className="pt-2 flex items-center space-x-3">
                            <div className="py-3 px-6 btn-tactile-cream font-bold rounded-full text-xs flex items-center space-x-2">
                              <Play className="w-3.5 h-3.5 fill-current text-sage-800" />
                              <span>Começar Leitura</span>
                            </div>
                            <div className="p-3 rounded-full border bg-white/10 border-white/20 text-cream-100">
                              <Heart className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Versículo do Dia */}
                      <section className="surface-editorial rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full bg-gradient-to-b from-cream-100 via-sand-300 to-sand-400" />
                        <div className="relative z-10 pl-2">
                          <div className="flex items-center justify-between mb-3.5">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-sand-300">
                              Versículo do Dia
                            </span>
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cream-100/10 border border-sand-300/35 text-cream-100 text-[11px] font-semibold">
                              <Share2 className="w-3 h-3" />
                              <span>Compartilhar</span>
                            </div>
                          </div>
                          <blockquote className="font-serif italic text-lg text-cream-50 leading-relaxed">
                            "{dailyVerse.text}"
                          </blockquote>
                          <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-sand-300/20 text-xs">
                            <span className="font-bold text-cream-100">
                              — {dailyVerse.reference}
                            </span>
                            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cream-100/15 text-sand-200 border border-sand-300/35">
                              {dailyVerse.category}
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* Música do Dia */}
                      <section className="surface-warm-sand rounded-3xl p-6 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-2xl btn-tactile-sage flex items-center justify-center shrink-0">
                              <Headphones className="w-4 h-4" />
                            </div>
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-widest text-cream-100">
                                Música do Dia
                              </h2>
                              <p className="text-[11px] text-sand-300/90">
                                Louvor selecionado para edificar o seu dia
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-cream-100/[0.06] border border-sand-300/25 space-y-1.5">
                            <h3 className="text-lg font-bold font-serif text-cream-50">
                              {songOfTheDay.title}
                            </h3>
                            <p className="text-xs font-semibold text-sand-300">
                              {songOfTheDay.artist}
                            </p>
                            <p className="text-xs text-cream-200/90 italic pt-1">
                              "{songOfTheDay.recommendationReason}"
                            </p>
                          </div>
                        </div>
                      </section>

                      <DonationCard source="home" />
                    </div>
                  </div>

                  {/* ---------- LIQUID BOTTOM NAV INSIDE THE PHONE ---------- */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3.5 pointer-events-none">
                    {renderLiquidNavComponent(act2Nav, false)}
                  </div>
                </div>

                {/* Bottom iOS Home Indicator */}
                <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 z-40 w-[134px] h-[5px] rounded-full bg-white/90" />

                {/* Translucent Touch Indicator */}
                {touchOpacity > 0.01 && (
                  <div
                    className="pointer-events-none absolute z-50"
                    style={{
                      left: `${touchX}px`,
                      top: `${touchY}px`,
                      opacity: touchOpacity,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {rippleProgress > 0 && rippleProgress < 1 && (
                      <div
                        className="absolute left-1/2 top-1/2 rounded-full border-2 border-sand-200/85"
                        style={{
                          width: `${34 + rippleProgress * 48}px`,
                          height: `${34 + rippleProgress * 48}px`,
                          opacity: (1 - rippleProgress) * 0.8,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}
                    <div
                      className="w-10 h-10 rounded-full border border-white/85 bg-white/22"
                      style={{
                        transform: `scale(${touchScale})`,
                        boxShadow:
                          '0 0 22px rgba(247, 243, 234, 0.38), inset 0 0 8px rgba(255,255,255,0.45)',
                      }}
                    />
                  </div>
                )}

                {/* Dynamic Studio Glass Reflection across the 3D Screen */}
                <div
                  className="pointer-events-none absolute inset-0 z-50 rounded-[44px]"
                  style={{
                    background: `linear-gradient(${115 + act2Cam.rotY * 0.7}deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 26%, rgba(255,255,255,0) 48%, rgba(255,255,255,0.04) 84%, rgba(255,255,255,0.10) 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
