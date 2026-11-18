import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  BookMarked,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Headphones,
  Heart,
  HelpCircle,
  History,
  MessageSquare,
  Moon,
  Play,
  Plus,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  Wifi,
  X,
} from 'lucide-react';
import { getDevotionalForDate } from '../content/devotionals/vault';
import { selectDailyVerse } from '../services/daily-verse/selection-engine';
import { getDailyVerifiedSong } from '../content/songs/catalog';
import { DonationCard } from '../components/DonationCard';

declare global {
  interface Window {
    __setDemoTime?: (tSeconds: number) => void;
    __demoReady?: boolean;
  }
}

const PRAYER_TEXT =
  'Senhor, obrigado por mais um amanhecer. Peço sabedoria para este dia e proteção para a minha família.';

const PHONE_W = 390;
const PHONE_H = 844;

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

function easeOutBack(t: number): number {
  const x = clamp(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * Computes natural human-paced character count for a given elapsed typing duration.
 * Adds subtle micro-pauses after commas and periods so typing feels organic.
 */
function getTypedLength(text: string, progress: number): number {
  const p = clamp(progress);
  if (p <= 0) return 0;
  if (p >= 1) return text.length;

  const weights: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    let w = 1;
    if (ch === ',' || ch === '.') w = 3.2;
    else if (ch === ' ') w = 1.3;
    weights.push(w);
    totalWeight += w;
  }

  const target = p * totalWeight;
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (acc >= target) return i + 1;
  }
  return text.length;
}

function getLocalElementCenter(
  el: HTMLElement | null,
  root: HTMLElement | null,
  scrollContainer?: HTMLElement | null,
  scrollOffset = 0
): { x: number; y: number } | null {
  if (!el || !root) return null;
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    x += cur.offsetLeft;
    y += cur.offsetTop;
    if (scrollContainer && cur === scrollContainer) {
      y -= scrollOffset;
    }
    cur = cur.offsetParent as HTMLElement | null;
  }
  if (!cur) return null;
  return { x, y };
}

export const ProductDemoStudioPage: React.FC = () => {
  const searchParams = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(),
    []
  );
  const aspectMode = searchParams.get('aspect') === 'widescreen' ? 'widescreen' : 'vertical';
  const autoplay = searchParams.get('autoplay') === '1';
  const initialTimeParam = parseFloat(searchParams.get('t') || '0');
  const [timeSec, setTimeSec] = useState<number>(
    Number.isFinite(initialTimeParam) ? clamp(initialTimeParam, 0, 12) : 0
  );

  // Real Amanhecer data matching the reference screenshots (Thursday, Nov 12, 2026)
  const demoDate = '2026-11-12';
  const devotional = useMemo(() => getDevotionalForDate(demoDate), []);
  const dailyVerse = useMemo(() => selectDailyVerse(demoDate), []);
  const songOfTheDay = useMemo(() => getDailyVerifiedSong(demoDate), []);

  // Refs for accurate touch-indicator coordinates inside the 390x844 phone screen
  const screenRef = useRef<HTMLDivElement>(null);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const diaryCardBtnRef = useRef<HTMLButtonElement>(null);
  const newEntryBtnRef = useRef<HTMLButtonElement>(null);
  const contentBoxRef = useRef<HTMLDivElement>(null);

  const [measuredTargets, setMeasuredTargets] = useState<{
    diaryCard: { x: number; y: number };
    newEntryBtn: { x: number; y: number };
    contentBox: { x: number; y: number };
  }>({
    diaryCard: { x: 195, y: 274 },
    newEntryBtn: { x: 318, y: 158 },
    contentBox: { x: 195, y: 505 },
  });

  // Expose deterministic time control for 60fps Puppeteer/Chrome CDP frame capture
  useEffect(() => {
    document.documentElement.classList.add('dark');
    window.__setDemoTime = (nextT: number) => {
      flushSync(() => {
        setTimeSec(clamp(nextT, 0, 12));
      });
    };
    window.__demoReady = true;
    return () => {
      delete window.__setDemoTime;
      delete window.__demoReady;
    };
  }, []);

  // Optional live browser preview when ?autoplay=1
  useEffect(() => {
    if (!autoplay) return;
    let rafId = 0;
    const start = performance.now() - timeSec * 1000;
    const tick = (now: number) => {
      const elapsed = ((now - start) / 1000) % 12;
      setTimeSec(elapsed);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoplay]);

  // ---------------------------------------------------------------------------
  // 12-SECOND CONTINUOUS TIMELINE CHOREOGRAPHY
  // ---------------------------------------------------------------------------
  // Stage 1: 0.00s – 2.00s -> Home screen at rest
  // Stage 2: 2.00s – 4.00s -> Finger swipe scrolls smoothly down until "Diário de Oração" is clear
  // Stage 3: 4.00s – 5.00s -> Touch taps "Diário de Oração" -> Diary screen opens smoothly
  // Stage 4: 5.00s – 7.00s -> Touch taps "+ Novo Registro" -> Modal opens smoothly
  // Stage 5: 7.00s – 12.00s -> Textarea focuses & prayer text types letter by letter with cursor
  // ---------------------------------------------------------------------------

  const SCROLL_TARGET_PX = 915;
  const scrollProgress = easeInOutCubic((timeSec - 2.05) / 1.75);
  const currentScrollTop = timeSec < 4.75 ? scrollProgress * SCROLL_TARGET_PX : SCROLL_TARGET_PX;

  // Screen transition (Home -> Diário) between 4.58s and 4.92s
  const diaryTransition = easeOutCubic((timeSec - 4.58) / 0.34);
  const isDiaryView = timeSec >= 4.58;

  // Modal transition ("Novo Registro no Diário") between 6.45s and 6.92s
  const modalProgress = easeOutCubic((timeSec - 6.45) / 0.42);
  const modalScale = lerp(0.92, 1, easeOutBack((timeSec - 6.45) / 0.44));
  const isModalOpen = timeSec >= 6.45;

  // Content field focus & typing (7.00s – 12.00s)
  const isFieldFocused = timeSec >= 7.12;
  const typingProgress = clamp((timeSec - 7.3) / 4.05);
  const typedChars = getTypedLength(PRAYER_TEXT, typingProgress);
  const visiblePrayerText = PRAYER_TEXT.slice(0, typedChars);

  // Blinking cursor (~2.2Hz while idle, solid while actively typing for realism)
  const isActivelyTyping = timeSec >= 7.3 && timeSec <= 11.35;
  const cursorVisible =
    isFieldFocused &&
    (isActivelyTyping || Math.floor((timeSec - 7.12) * 2.2) % 2 === 0);

  // Measure target button centers accurately once rendered in DOM
  useLayoutEffect(() => {
    if (homeScrollRef.current) {
      homeScrollRef.current.scrollTop = currentScrollTop;
    }
    const root = screenRef.current;
    if (!root) return;

    if (!isDiaryView && diaryCardBtnRef.current && homeScrollRef.current) {
      const c = getLocalElementCenter(
        diaryCardBtnRef.current,
        root,
        homeScrollRef.current,
        currentScrollTop
      );
      if (c) {
        setMeasuredTargets((prev) =>
          Math.abs(prev.diaryCard.y - c.y) > 0.5 ? { ...prev, diaryCard: c } : prev
        );
      }
    }

    if (isDiaryView && newEntryBtnRef.current) {
      const c = getLocalElementCenter(newEntryBtnRef.current, root);
      if (c) {
        setMeasuredTargets((prev) =>
          Math.abs(prev.newEntryBtn.y - c.y) > 0.5 ? { ...prev, newEntryBtn: c } : prev
        );
      }
    }

    if (isModalOpen && contentBoxRef.current) {
      const c = getLocalElementCenter(contentBoxRef.current, root);
      if (c) {
        setMeasuredTargets((prev) =>
          Math.abs(prev.contentBox.y - c.y) > 0.5 ? { ...prev, contentBox: c } : prev
        );
      }
    }
  }, [currentScrollTop, isDiaryView, isModalOpen]);

  // ---------------------------------------------------------------------------
  // TRANSLUCENT TOUCH INDICATOR STATE
  // ---------------------------------------------------------------------------
  let touchX = 205;
  let touchY = 620;
  let touchOpacity = 0;
  let touchScale = 1;
  let rippleProgress = 0;

  let diaryBtnPressScale = 1;
  let newEntryPressScale = 1;

  if (timeSec >= 1.95 && timeSec <= 3.85) {
    // Stage 2: Smooth natural finger-swipe upward
    const appear = clamp((timeSec - 1.95) / 0.16);
    const disappear = clamp((3.85 - timeSec) / 0.22);
    const swipe = easeInOutCubic((timeSec - 2.05) / 1.55);
    touchOpacity = Math.min(appear, disappear) * 0.92;
    touchX = lerp(212, 206, swipe);
    touchY = lerp(635, 255, swipe);
    touchScale = timeSec >= 2.05 && timeSec <= 3.65 ? 0.9 : 1.05;
  } else if (timeSec > 3.92 && timeSec <= 4.78) {
    // Stage 3: Glide to & tap "Diário de Oração"
    const glide = easeInOutCubic((timeSec - 3.92) / 0.34);
    const fadeOut = clamp((4.78 - timeSec) / 0.14);
    touchOpacity = clamp((timeSec - 3.92) / 0.14) * fadeOut;
    touchX = lerp(206, measuredTargets.diaryCard.x, glide);
    touchY = lerp(310, measuredTargets.diaryCard.y, glide);

    const tapPhase = (timeSec - 4.30) / 0.28;
    if (tapPhase >= 0 && tapPhase <= 1.2) {
      const pressPulse = Math.sin(clamp(tapPhase) * Math.PI);
      touchScale = 1 - pressPulse * 0.22;
      diaryBtnPressScale = 1 - pressPulse * 0.038;
      rippleProgress = clamp(tapPhase);
    }
  } else if (timeSec >= 5.55 && timeSec <= 6.62) {
    // Stage 4: Glide to & tap "+ Novo Registro"
    const glide = easeInOutCubic((timeSec - 5.55) / 0.42);
    const fadeOut = clamp((6.62 - timeSec) / 0.16);
    touchOpacity = clamp((timeSec - 5.55) / 0.16) * fadeOut;
    touchX = lerp(measuredTargets.diaryCard.x, measuredTargets.newEntryBtn.x, glide);
    touchY = lerp(measuredTargets.diaryCard.y + 40, measuredTargets.newEntryBtn.y, glide);

    const tapPhase = (timeSec - 6.08) / 0.32;
    if (tapPhase >= 0 && tapPhase <= 1.2) {
      const pressPulse = Math.sin(clamp(tapPhase) * Math.PI);
      touchScale = 1 - pressPulse * 0.24;
      newEntryPressScale = 1 - pressPulse * 0.065;
      rippleProgress = clamp(tapPhase);
    }
  } else if (timeSec >= 6.90 && timeSec <= 7.45) {
    // Stage 5: Quick subtle tap to focus "Conteúdo" text area before typing
    const glide = easeOutCubic((timeSec - 6.90) / 0.18);
    const fadeOut = clamp((7.45 - timeSec) / 0.16);
    touchOpacity = clamp((timeSec - 6.90) / 0.1) * fadeOut * 0.85;
    touchX = lerp(measuredTargets.newEntryBtn.x, measuredTargets.contentBox.x - 36, glide);
    touchY = lerp(measuredTargets.newEntryBtn.y + 120, measuredTargets.contentBox.y - 10, glide);

    const tapPhase = (timeSec - 7.05) / 0.24;
    if (tapPhase >= 0 && tapPhase <= 1) {
      const pressPulse = Math.sin(tapPhase * Math.PI);
      touchScale = 1 - pressPulse * 0.2;
      rippleProgress = tapPhase;
    }
  }

  // ---------------------------------------------------------------------------
  // 3D CAMERA DOLLY-IN & STUDIO LIGHTING PARAMETERS (0s to 12s)
  // ---------------------------------------------------------------------------
  const dollyProgress = easeInOutCubic(timeSec / 12);
  const rotateY = lerp(-15.5, -11.2, dollyProgress);
  const rotateX = lerp(5.4, 2.8, dollyProgress);
  const rotateZ = lerp(-1.2, -0.35, dollyProgress);
  const floatY = Math.sin((timeSec / 12) * Math.PI * 2.2) * 3.8;

  const basePhoneScale = aspectMode === 'vertical' ? 1.42 : 0.96;
  const endPhoneScale = aspectMode === 'vertical' ? 1.66 : 1.12;
  const phoneScale = lerp(basePhoneScale, endPhoneScale, dollyProgress);

  // Subtle shifting glass reflection angle synced with camera dolly
  const reflectionShift = lerp(-18, 16, dollyProgress);

  // 18 extrusion layers for realistic titanium 3D chassis thickness
  const depthSlices = useMemo(() => Array.from({ length: 18 }, (_, i) => -(i + 1)), []);

  return (
    <div
      className="dark relative w-screen h-screen overflow-hidden flex items-center justify-center select-none"
      style={{
        background:
          'radial-gradient(ellipse 85% 65% at 50% 42%, #131B14 0%, #0A0E0B 56%, #040504 100%)',
      }}
    >
      {/* Disable all CSS transitions/animations globally inside the studio so every 60fps frame is pure & flicker-free */}
      <style>{`
        .studio-no-transition *,
        .studio-no-transition *::before,
        .studio-no-transition *::after {
          transition: none !important;
          animation: none !important;
        }
        .studio-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Studio Key Light (Top-Left Warm Cream Glow) */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 w-[760px] h-[760px] rounded-full opacity-35 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(217,199,163,0.42) 0%, rgba(130,145,123,0.12) 48%, transparent 72%)',
          transform: `translate3d(${lerp(-10, 28, dollyProgress)}px, ${lerp(0, 18, dollyProgress)}px, 0)`,
        }}
      />

      {/* Studio Rim Light (Bottom-Right Deep Sage/Emerald) */}
      <div
        className="pointer-events-none absolute -bottom-36 -right-24 w-[740px] h-[740px] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(130,145,123,0.34) 0%, rgba(56,71,54,0.18) 50%, transparent 74%)',
          transform: `translate3d(${lerp(18, -18, dollyProgress)}px, ${lerp(10, -14, dollyProgress)}px, 0)`,
        }}
      />

      {/* Soft Studio Floor Shadow Pool */}
      <div
        className="pointer-events-none absolute rounded-full blur-[65px]"
        style={{
          width: aspectMode === 'vertical' ? '440px' : '460px',
          height: '96px',
          bottom: aspectMode === 'vertical' ? '8%' : '3%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.88) 0%, transparent 72%)',
          transform: `scale(${lerp(0.95, 1.12, dollyProgress)})`,
        }}
      />

      {/* Gentle Depth-of-Field Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 72% 72% at 50% 50%, transparent 56%, rgba(2,3,2,0.72) 100%)',
        }}
      />

      {/* 3D Perspective Stage */}
      <div
        className="studio-no-transition relative flex items-center justify-center"
        style={{
          perspective: '1700px',
          perspectiveOrigin: '50% 48%',
        }}
      >
        {/* 3D Smartphone Assembly */}
        <div
          className="relative"
          style={{
            width: `${PHONE_W + 24}px`,
            height: `${PHONE_H + 24}px`,
            transformStyle: 'preserve-3d',
            transform: `translate3d(0px, ${floatY.toFixed(2)}px, 0px) scale(${phoneScale.toFixed(
              5
            )}) rotateY(${rotateY.toFixed(3)}deg) rotateX(${rotateX.toFixed(
              3
            )}deg) rotateZ(${rotateZ.toFixed(3)}deg)`,
          }}
        >
          {/* Titanium Chassis Depth Extrusion Slices */}
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
                    ? 'linear-gradient(135deg, #4B524A 0%, #242924 45%, #3C423B 100%)'
                    : 'linear-gradient(145deg, #272C27 0%, #141714 50%, #1E221E 100%)',
                  boxShadow: isBackPlate
                    ? '0 45px 95px rgba(0,0,0,0.82)'
                    : undefined,
                }}
              />
            );
          })}

          {/* 3D Right Side Power Button */}
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

          {/* 3D Left Side Volume Buttons */}
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

          {/* Front Bezel Frame */}
          <div
            className="relative w-full h-full rounded-[56px] p-[12px]"
            style={{
              background:
                'linear-gradient(145deg, #2B302B 0%, #111311 35%, #0A0C0A 72%, #232823 100%)',
              boxShadow:
                'inset 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 8px rgba(0,0,0,0.9)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* Inner Black Glass Display */}
            <div
              ref={screenRef}
              className="relative w-full h-full rounded-[44px] overflow-hidden bg-[#121813] text-[#F7F3EA]"
              style={{
                width: `${PHONE_W}px`,
                height: `${PHONE_H}px`,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              {/* iOS Top Status Bar + Dynamic Island (Exact match to Reference Screenshots) */}
              <div className="relative z-40 h-[50px] px-7 pt-2 flex items-center justify-between bg-[#121813] text-white">
                {/* Left Time + indicator dot */}
                <div className="flex items-center space-x-1.5 text-[14px] font-semibold tracking-tight tabular-nums">
                  <span>22.12</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                  </span>
                </div>

                {/* Dynamic Island */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[118px] h-[33px] rounded-full bg-black border border-white/[0.06] flex items-center justify-end pr-3 shadow-inner">
                  <div className="w-3 h-3 rounded-full bg-[#0E131D] ring-1 ring-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D3557]/80" />
                  </div>
                </div>

                {/* Right Cellular + WiFi + Battery 56 */}
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-end space-x-[1.5px] h-2.5">
                    <span className="w-[2.5px] h-[4px] bg-white rounded-[1px]" />
                    <span className="w-[2.5px] h-[6px] bg-white rounded-[1px]" />
                    <span className="w-[2.5px] h-[8px] bg-white rounded-[1px]" />
                    <span className="w-[2.5px] h-[10px] bg-white/35 rounded-[1px]" />
                  </div>
                  <Wifi className="w-3.5 h-3.5 text-white stroke-[2.4]" />
                  <div className="flex items-center space-x-0.5">
                    <div className="px-1.5 py-[1px] rounded-[5px] bg-white text-black text-[10px] font-bold leading-tight">
                      56
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky App Navbar (Exact Real Component Styling) */}
              <header className="relative z-30 bg-[#121813]/90 backdrop-blur-xl border-b border-graphite-800/80">
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

              {/* APP VIEWPORT AREA (730px below status bar + navbar) */}
              <div className="relative w-full h-[730px] overflow-hidden bg-[#121813]">
                {/* Ambient Dark Radial Background matching src/index.css .dark body */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 90% 45% at 85% -5%, rgba(217, 199, 163, 0.14) 0%, transparent 65%), radial-gradient(ellipse 70% 40% at 10% 20%, rgba(247, 243, 234, 0.06) 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(217, 199, 163, 0.09) 0%, transparent 65%)',
                  }}
                />

                {/* -------------------- SCREEN A: HOME PAGE -------------------- */}
                <div
                  ref={homeScrollRef}
                  className="studio-hide-scrollbar absolute inset-0 overflow-y-auto px-4 pt-4 pb-44"
                  style={{
                    opacity: 1 - diaryTransition,
                    transform: `translate3d(${-diaryTransition * 24}px, 0, 0)`,
                    pointerEvents: isDiaryView ? 'none' : 'auto',
                  }}
                >
                  <div className="space-y-6">
                    {/* 1. Greeting Header */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full surface-editorial text-cream-100 text-xs font-semibold">
                          <Moon className="w-3.5 h-3.5 text-sand-300 shrink-0" />
                          <span>Boa noite</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold text-cream-50 font-serif tracking-tight">
                          Graça e paz, Usuário!
                        </h1>
                        <p className="text-xs font-medium capitalize text-sand-300">
                          Quinta-Feira, 12 De Novembro
                        </p>
                      </div>
                    </div>

                    {/* 2. Hero Card: Devocional de Hoje */}
                    <section className="surface-hero-sage text-cream-50 rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-sand-300/15 blur-2xl pointer-events-none" />
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
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-sand-200">
                          <Sparkles className="w-3 h-3 text-sand-300" />
                          <span>Devocional de Hoje</span>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{devotional.estimatedMinutes} min</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h2 className="text-2xl font-bold font-serif tracking-tight leading-snug text-white">
                            {devotional.title}
                          </h2>
                          <p className="text-xs text-sand-200 font-medium tracking-wide">
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
                          <div className="p-3 rounded-full border backdrop-blur-md bg-white/10 border-white/20 text-cream-100">
                            <Heart className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 3. Versículo do Dia */}
                    <section className="surface-editorial rounded-3xl p-6 relative overflow-hidden">
                      <span
                        aria-hidden="true"
                        className="absolute right-5 -top-3 font-serif text-8xl leading-none text-sand-300/15 select-none pointer-events-none"
                      >
                        “
                      </span>
                      <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full bg-gradient-to-b from-cream-100 via-sand-300 to-sand-400" />

                      <div className="relative z-10 pl-2">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-sand-300 ring-4 ring-sand-300/20" />
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-sand-300 leading-tight">
                              Versículo<br />do Dia
                            </h2>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-cream-100/10 text-sand-300 text-[10px] font-bold uppercase tracking-wider">
                              <Sparkles className="w-3 h-3 text-sand-300" />
                              <span>Novidade</span>
                            </div>
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cream-100/10 border border-sand-300/35 text-cream-100 text-[11px] font-semibold">
                              <Share2 className="w-3 h-3" />
                              <span>Compartilhar</span>
                            </div>
                          </div>
                        </div>

                        <blockquote className="font-serif italic text-lg text-cream-50 leading-relaxed">
                          "{dailyVerse.text}"
                        </blockquote>

                        <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-sand-300/20 text-xs">
                          <span className="font-bold text-cream-100 tracking-tight">
                            — {dailyVerse.reference}
                          </span>
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cream-100/15 text-sand-200 border border-sand-300/35">
                            {dailyVerse.category}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* 4. Música do Dia */}
                    <section className="surface-warm-sand rounded-3xl p-6 relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl btn-tactile-sage flex items-center justify-center shadow-xs shrink-0">
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
                          <h3 className="text-lg font-bold font-serif text-cream-50 leading-snug">
                            {songOfTheDay.title}
                          </h3>
                          <p className="text-xs font-semibold text-sand-300">
                            {songOfTheDay.artist}
                          </p>
                          <p className="text-xs text-cream-200/90 italic leading-relaxed pt-1">
                            "{songOfTheDay.recommendationReason}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-b from-red-600 to-red-700 text-white text-xs font-bold shadow-sm border border-red-500/40 whitespace-nowrap">
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Ouvir no YouTube</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-b from-[#1ED760] to-[#17A74A] text-white text-xs font-bold shadow-sm border border-white/20 whitespace-nowrap">
                            <Headphones className="w-3.5 h-3.5 shrink-0" />
                            <span>Ouvir no Spotify</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 5. Continue Sua Jornada (Mobile single-column matching Screenshot 3) */}
                    <section className="space-y-3.5">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-sand-300 uppercase tracking-widest">
                          Continue Sua Jornada
                        </h3>
                        <span className="text-[11px] text-cream-200/70">
                          Acesso rápido e offline
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Target Button: Diário de Oração */}
                        <button
                          ref={diaryCardBtnRef}
                          type="button"
                          style={{
                            transform: `scale(${diaryBtnPressScale})`,
                            borderColor:
                              diaryBtnPressScale < 0.995
                                ? 'rgba(217, 199, 163, 0.7)'
                                : undefined,
                          }}
                          className="surface-editorial text-left p-4 rounded-3xl flex items-center justify-between gap-3 w-full"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl btn-tactile-sage flex items-center justify-center shrink-0">
                              <BookMarked className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold font-serif text-cream-50">
                                Diário de Oração
                              </h4>
                              <p className="text-[11px] text-sand-300/90 mt-0.5">
                                Anote preces e gratidão
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-sand-300" />
                        </button>

                        {/* Favoritos */}
                        <div className="surface-editorial text-left p-4 rounded-3xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-sand-300 to-sand-400 text-sage-950 flex items-center justify-center shrink-0 shadow-xs">
                              <Heart className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold font-serif text-cream-50">
                                Favoritos
                              </h4>
                              <p className="text-[11px] text-sand-300/90 mt-0.5">
                                Mensagens salvas
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-sand-300" />
                        </div>

                        {/* Histórico */}
                        <div className="surface-editorial text-left p-4 rounded-3xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-cream-200 to-sand-300 text-sage-950 flex items-center justify-center shrink-0 shadow-xs">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold font-serif text-cream-50">
                                Histórico
                              </h4>
                              <p className="text-[11px] text-sand-300/90 mt-0.5">
                                Leituras anteriores
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-sand-300" />
                        </div>
                      </div>
                    </section>

                    {/* 6. Real DonationCard matching Screenshot 3 */}
                    <DonationCard source="home" />
                  </div>
                </div>

                {/* -------------------- SCREEN B: DIÁRIO PESSOAL -------------------- */}
                <div
                  className="absolute inset-0 overflow-hidden px-4 pt-4 pb-28"
                  style={{
                    opacity: diaryTransition,
                    transform: `translate3d(${(1 - diaryTransition) * 28}px, 0, 0)`,
                    pointerEvents: isDiaryView ? 'auto' : 'none',
                  }}
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold font-serif text-graphite-50 tracking-tight">
                          Diário Pessoal
                        </h1>
                        <p className="text-xs text-graphite-400 mt-0.5 max-w-[230px]">
                          Anotações espirituais e orações salvas unicamente no seu dispositivo
                        </p>
                      </div>

                      <button
                        ref={newEntryBtnRef}
                        type="button"
                        style={{ transform: `scale(${newEntryPressScale})` }}
                        className="btn-tactile-sage py-2.5 px-4 font-semibold rounded-full flex items-center space-x-1.5 text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="leading-tight text-center">
                          Novo<br />Registro
                        </span>
                      </button>
                    </div>

                    {/* Privacy Notice Banner */}
                    <div className="surface-warm-sand rounded-3xl p-4 text-xs text-graphite-300 flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-sage-300 flex-shrink-0" />
                      <p className="leading-relaxed">
                        <strong className="text-graphite-100">Privacidade local:</strong> Suas preces e anotações nunca são transmitidas para a nuvem nem lidas por IA.
                      </p>
                    </div>

                    {/* Filters & Backup Buttons (exact match to Screenshot 4) */}
                    <div className="space-y-2 pt-1">
                      <div className="inline-flex bg-graphite-850 p-1 rounded-full text-xs font-semibold">
                        <span className="px-3 py-1.5 rounded-full bg-graphite-800 text-sage-200 shadow-xs">
                          Todos (0)
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-graphite-400">
                          Orações
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-graphite-400">
                          Gratidão
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-graphite-400">
                          Anotações
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <div className="py-1.5 px-3 bg-graphite-800 border border-graphite-700 rounded-full text-graphite-300 text-xs font-medium flex items-center shadow-xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                        <div className="py-1.5 px-3 bg-graphite-800 border border-graphite-700 rounded-full text-graphite-300 text-xs font-medium flex items-center shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Empty State */}
                    <div className="text-center py-14 text-graphite-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-sage-600" />
                      <p className="text-xs">Nenhum registro encontrado nesta categoria.</p>
                      <span className="inline-block text-sage-300 text-xs font-semibold">
                        Criar primeira anotação
                      </span>
                    </div>
                  </div>
                </div>

                {/* -------------------- SCREEN C: NOVO REGISTRO MODAL -------------------- */}
                {modalProgress > 0.005 && (
                  <div
                    className="absolute inset-0 z-30 flex items-center justify-center p-4"
                    style={{
                      backgroundColor: `rgba(10, 14, 10, ${0.74 * modalProgress})`,
                      backdropFilter: `blur(${4 * modalProgress}px)`,
                    }}
                  >
                    <div
                      className="bg-graphite-800 border border-graphite-700 rounded-3xl w-full p-6 shadow-2xl relative overflow-hidden"
                      style={{
                        opacity: modalProgress,
                        transform: `scale(${modalScale}) translate3d(0, ${(1 - modalProgress) * 16}px, 0)`,
                      }}
                    >
                      <div className="flex items-center justify-between pb-3.5 border-b border-graphite-700">
                        <h2 className="text-base font-bold font-serif text-graphite-50">
                          Novo Registro no Diário
                        </h2>
                        <div className="text-graphite-400 p-1.5 rounded-full">
                          <X className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {/* Category selector matching Screenshot 1 */}
                        <div>
                          <label className="text-xs font-semibold text-graphite-300 block mb-1">
                            Categoria
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="py-2 px-3 rounded-full text-xs font-semibold border border-graphite-700 text-graphite-500 text-center">
                              Oração
                            </div>
                            <div className="py-2 px-3 rounded-full text-xs font-semibold border border-graphite-700 text-graphite-500 text-center">
                              Gratidão
                            </div>
                            <div className="py-2 px-3 rounded-full text-xs font-semibold border border-graphite-500 bg-graphite-700 text-graphite-100 text-center">
                              Reflexão
                            </div>
                          </div>
                        </div>

                        {/* Title Field */}
                        <div>
                          <label className="text-xs font-semibold text-graphite-300 block mb-1">
                            Título
                          </label>
                          <div className="w-full px-4 py-2.5 bg-graphite-900 border border-graphite-700 rounded-2xl text-xs text-graphite-400">
                            Ex: Oração pela minha família...
                          </div>
                        </div>

                        {/* Content Textarea (Focused & Typed Letter by Letter in Stage 5) */}
                        <div>
                          <label className="text-xs font-semibold text-graphite-300 block mb-1">
                            Conteúdo
                          </label>
                          <div
                            ref={contentBoxRef}
                            className={`w-full min-h-[124px] px-4 py-3 bg-graphite-900 rounded-2xl text-[13px] leading-relaxed ${
                              isFieldFocused
                                ? 'border border-sage-500 ring-2 ring-sage-600/80 text-graphite-50'
                                : 'border border-graphite-700 text-graphite-400'
                            }`}
                          >
                            {!isFieldFocused && visiblePrayerText.length === 0 ? (
                              <span className="text-graphite-400">
                                Escreva seus pensamentos, pedidos ou agradecimentos...
                              </span>
                            ) : (
                              <span className="whitespace-pre-wrap break-words text-cream-50">
                                {visiblePrayerText}
                                {cursorVisible && (
                                  <span className="inline-block w-[2px] h-[16px] bg-sand-300 align-text-bottom ml-[1px]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end space-x-2">
                          <div className="py-2.5 px-4 rounded-full text-xs font-semibold text-graphite-400">
                            Cancelar
                          </div>
                          <div className="py-2.5 px-6 bg-sage-800 text-cream-50 font-semibold rounded-full text-xs shadow-xs">
                            Salvar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- FLOATING BOTTOM NAV -------------------- */}
                <nav
                  className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
                  aria-label="Navegação Principal"
                >
                  <div className="px-4 pb-5">
                    <div className="surface-editorial backdrop-blur-xl rounded-full px-2 py-1.5 flex items-center justify-around relative">
                      {[
                        { id: 'home', label: 'Hoje', icon: BookOpen },
                        { id: 'history', label: 'Histórico', icon: History },
                        { id: 'favorites', label: 'Favoritos', icon: Heart },
                        { id: 'diary', label: 'Diário', icon: BookMarked },
                        { id: 'settings', label: 'Ajustes', icon: Settings },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const activeTab = isDiaryView ? 'diary' : 'home';
                        const isActive = tab.id === activeTab;
                        return (
                          <div
                            key={tab.id}
                            className="relative flex-1 flex flex-col items-center justify-center py-1"
                          >
                            {isActive ? (
                              <div className="flex flex-col items-center">
                                <div className="absolute -top-6 w-12 h-12 rounded-full btn-tactile-sage flex items-center justify-center ring-4 ring-graphite-950">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold text-cream-100 mt-6 tracking-tight">
                                  {tab.label}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-sand-300/80 py-1">
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium mt-1 tracking-tight">
                                  {tab.label}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Bottom iOS Home Indicator Bar */}
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 z-40 w-[134px] h-[5px] rounded-full bg-white/90" />

              {/* Translucent Touch Indicator Overlay */}
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
                  {/* Tap Ripple Wave */}
                  {rippleProgress > 0 && rippleProgress < 1 && (
                    <div
                      className="absolute left-1/2 top-1/2 rounded-full border-2 border-sand-200/80"
                      style={{
                        width: `${34 + rippleProgress * 46}px`,
                        height: `${34 + rippleProgress * 46}px`,
                        opacity: (1 - rippleProgress) * 0.75,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                  {/* Translucent Fingertip Disc (no heavy blur so app typography underneath stays razor-sharp) */}
                  <div
                    className="w-10 h-10 rounded-full border border-white/80 bg-white/20"
                    style={{
                      transform: `scale(${touchScale})`,
                      boxShadow:
                        '0 0 22px rgba(247, 243, 234, 0.32), inset 0 0 8px rgba(255,255,255,0.42)',
                    }}
                  />
                </div>
              )}

              {/* Soft Studio Glass Reflection Across Phone Screen */}
              <div
                className="pointer-events-none absolute inset-0 z-50 rounded-[44px]"
                style={{
                  background: `linear-gradient(${118 + reflectionShift * 0.35}deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 26%, rgba(255,255,255,0) 48%, rgba(255,255,255,0.04) 84%, rgba(255,255,255,0.09) 100%)`,
                  transform: 'translateZ(1px)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
