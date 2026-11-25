import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatedBookOpenIcon,
  AnimatedBookmarkDiaryIcon,
  AnimatedClockHistoryIcon,
  AnimatedHeartIcon,
  AnimatedSettingsIcon,
} from './AnimatedIcons';
import {
  generateBarRefractionMap,
  generateDropletLensMap,
  LiquidGlassConfig,
  resolveLiquidGlassConfig,
  supportsSvgBackdropFilter,
} from '../utils/liquidGlassOptics';

export type AppView =
  | 'home'
  | 'devotional'
  | 'history'
  | 'favorites'
  | 'diary'
  | 'settings'
  | 'audit';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  favoritesCount?: number;
  hasWallpaper?: boolean;
  liquidGlassConfig?: Partial<LiquidGlassConfig>;
}

const BAR_HEIGHT = 64;
const DROPLET_W = 104;
const DROPLET_H = 72;

interface SpringPhysicsState {
  xPct: number;
  vxPct: number;
  trailXPct: number;
  trailVxPct: number;
  inflation: number;
  vInflation: number;
  wobble: number;
  vWobble: number;
  barTiltDeg: number;
  vBarTilt: number;
  barPressScale: number;
  vBarPress: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  favoritesCount = 0,
  hasWallpaper = false,
  liquidGlassConfig,
}) => {
  const cfg = useMemo(() => resolveLiquidGlassConfig(liquidGlassConfig), [liquidGlassConfig]);
  const cfgRef = useRef<LiquidGlassConfig>(cfg);
  cfgRef.current = cfg;

  const tabs = useMemo(
    () => [
      { id: 'home' as AppView, label: 'Hoje', Icon: AnimatedBookOpenIcon, badge: null },
      { id: 'history' as AppView, label: 'Histórico', Icon: AnimatedClockHistoryIcon, badge: null },
      {
        id: 'favorites' as AppView,
        label: 'Favoritos',
        Icon: AnimatedHeartIcon,
        badge: favoritesCount > 0 ? favoritesCount : null,
      },
      { id: 'diary' as AppView, label: 'Diário', Icon: AnimatedBookmarkDiaryIcon, badge: null },
      { id: 'settings' as AppView, label: 'Ajustes', Icon: AnimatedSettingsIcon, badge: null },
    ],
    [favoritesCount]
  );

  const resolvedIndex = Math.max(
    0,
    tabs.findIndex(
      (t) => t.id === currentView || (t.id === 'home' && currentView === 'devotional')
    )
  );

  const tabCenterPct = (idx: number, width = 392) => {
    const pad = 6;
    const inner = Math.max(1, width - pad * 2);
    return (pad + ((idx + 0.5) / tabs.length) * inner) / Math.max(1, width);
  };

  // Refs diretos de DOM (ZERO re-renders do React durante os 60/120fps da mola e do arraste!)
  const containerRef = useRef<HTMLDivElement>(null);
  const dropletRef = useRef<HTMLDivElement>(null);
  const dropletSpecularRef = useRef<HTMLDivElement>(null);
  const rimPathRef = useRef<SVGPathElement>(null);
  const rimGradRef = useRef<SVGRadialGradientElement>(null);
  const iconWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const barWidthRef = useRef<number>(392);
  const [barAspect, setBarAspect] = useState<number>(392 / BAR_HEIGHT);
  const [svgBackdropSupported] = useState<boolean>(() => supportsSvgBackdropFilter());
  const [barMapUrl, setBarMapUrl] = useState<string>('');
  const [dropletMapUrl, setDropletMapUrl] = useState<string>('');
  const [highlightedIdx, setHighlightedIdx] = useState<number>(resolvedIndex);
  const highlightedIdxRef = useRef<number>(resolvedIndex);

  const physicsRef = useRef<SpringPhysicsState>({
    xPct: tabCenterPct(resolvedIndex, 392),
    vxPct: 0,
    trailXPct: tabCenterPct(resolvedIndex, 392),
    trailVxPct: 0,
    inflation: 0,
    vInflation: 0,
    wobble: 0,
    vWobble: 0,
    barTiltDeg: 0,
    vBarTilt: 0,
    barPressScale: 1,
    vBarPress: 0,
  });

  const targetRef = useRef<{
    targetXPct: number;
    isPointerDown: boolean;
    isDragging: boolean;
    flightBoostUntil: number;
  }>({
    targetXPct: tabCenterPct(resolvedIndex, 392),
    isPointerDown: false,
    isDragging: false,
    flightBoostUntil: 0,
  });

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const prevResolvedIndexRef = useRef<number>(resolvedIndex);

  /**
   * Aplica a geometria de mola e deformação líquida diretamente na GPU via DOM refs,
   * sem disparar NENHUM re-render do React por quadro.
   */
  const applyFrameToDom = () => {
    const s = physicsRef.current;
    const c = cfgRef.current;
    const w = barWidthRef.current;

    const rippleMult = 0.25 + c.rippleEffect * 1.15;
    const inf = clamp(s.inflation * rippleMult, -0.15, 1.35);
    const infPositive = clamp(inf, 0, 1.25);

    const dropletCenterX = s.xPct * w;
    const trailCenterX = s.trailXPct * w;
    const speedNorm = Math.min(1.4, Math.abs(s.vxPct) * 0.45);
    const liquidLagStretch = Math.min(0.25, Math.abs(dropletCenterX - trailCenterX) / 260) * rippleMult;

    const baseScaleX = 0.72 + inf * 0.29;
    const baseScaleY = 0.72 + inf * 0.30;

    const stretchFactor = 1 + (speedNorm * 0.14 + liquidLagStretch + s.wobble * 0.06) * (0.4 + c.springBounce);
    const squashFactor = 1 / Math.sqrt(Math.max(0.76, Math.min(1.22, stretchFactor)));

    const sx = clamp(baseScaleX * stretchFactor, 0.58, 1.34);
    const sy = clamp(baseScaleY * squashFactor, 0.58, 1.16);

    if (containerRef.current) {
      containerRef.current.style.transform = `perspective(900px) rotateZ(${s.barTiltDeg.toFixed(
        2
      )}deg) scale3d(${s.barPressScale.toFixed(4)}, ${s.barPressScale.toFixed(4)}, 1)`;
    }

    if (dropletRef.current) {
      const tx = dropletCenterX - DROPLET_W / 2;
      dropletRef.current.style.transform = `translate3d(${tx.toFixed(
        2
      )}px, 0, 0) scale3d(${sx.toFixed(4)}, ${sy.toFixed(4)}, 1)`;
      if (infPositive > 0.18) {
        dropletRef.current.classList.add('apple-liquid-droplet-inflated');
      } else {
        dropletRef.current.classList.remove('apple-liquid-droplet-inflated');
      }
    }

    if (dropletSpecularRef.current) {
      const specOp = clamp((0.35 + infPositive * 0.65) * (0.35 + c.rimIntensity * 1.1), 0, 1);
      dropletSpecularRef.current.style.opacity = specOp.toFixed(3);
    }

    // Onda líquida especular nas bordas da barra (leve: apenas atualiza atributo SVG 'd')
    if (rimPathRef.current) {
      const bulgeAmp = infPositive * 4.6;
      const bulgeHalfSpan = 52;
      const bx0 = clamp(dropletCenterX - bulgeHalfSpan, 32, w - 32);
      const bx3 = clamp(dropletCenterX + bulgeHalfSpan, 32, w - 32);
      const cx = clamp(dropletCenterX, 34, w - 34);
      const topY = -bulgeAmp;
      const botY = BAR_HEIGHT + bulgeAmp;
      const rBar = BAR_HEIGHT / 2;

      const d = `M ${rBar} 0 L ${bx0.toFixed(1)} 0 C ${(cx - 25).toFixed(1)} 0, ${(
        cx - 19
      ).toFixed(1)} ${topY.toFixed(1)}, ${cx.toFixed(1)} ${topY.toFixed(1)} C ${(
        cx + 19
      ).toFixed(1)} ${topY.toFixed(1)}, ${(cx + 25).toFixed(1)} 0, ${bx3.toFixed(1)} 0 L ${(
        w - rBar
      ).toFixed(1)} 0 A ${rBar} ${rBar} 0 0 1 ${w} ${rBar} A ${rBar} ${rBar} 0 0 1 ${(
        w - rBar
      ).toFixed(1)} ${BAR_HEIGHT} L ${bx3.toFixed(1)} ${BAR_HEIGHT} C ${(cx + 25).toFixed(
        1
      )} ${BAR_HEIGHT}, ${(cx + 19).toFixed(1)} ${botY.toFixed(1)}, ${cx.toFixed(
        1
      )} ${botY.toFixed(1)} C ${(cx - 19).toFixed(1)} ${botY.toFixed(1)}, ${(
        cx - 25
      ).toFixed(1)} ${BAR_HEIGHT}, ${bx0.toFixed(1)} ${BAR_HEIGHT} L ${rBar} ${BAR_HEIGHT} A ${rBar} ${rBar} 0 0 1 0 ${rBar} A ${rBar} ${rBar} 0 0 1 ${rBar} 0 Z`;

      rimPathRef.current.setAttribute('d', d);
      rimPathRef.current.setAttribute('stroke-width', (0.9 + c.rimIntensity * 0.9 + infPositive * 0.45).toFixed(2));
    }

    if (rimGradRef.current) {
      rimGradRef.current.setAttribute('cx', `${(s.xPct * 100).toFixed(1)}%`);
    }

    // Elevação suave dos 5 ícones conforme proximidade da gota (GPU transform direto)
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let idx = 0; idx < tabs.length; idx++) {
      const tabPct = tabCenterPct(idx, w);
      const dist = Math.abs(s.xPct - tabPct);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
      const distInTabs = dist * tabs.length;
      const proximity = clamp(1 - distInTabs, 0, 1);
      const liftY = -proximity * (c.hideTabLabels ? 0.8 : 1.3 + infPositive * 1.5);
      const iconScale = 1 + proximity * (0.08 + infPositive * 0.08);

      const iconEl = iconWrapRefs.current[idx];
      if (iconEl) {
        iconEl.style.transform = `translate3d(0, ${liftY.toFixed(2)}px, 0) scale3d(${iconScale.toFixed(
          3
        )}, ${iconScale.toFixed(3)}, 1)`;
      }
      const labelEl = labelRefs.current[idx];
      if (labelEl) {
        labelEl.style.transform = `translate3d(0, ${(liftY * 0.4).toFixed(2)}px, 0)`;
      }
    }

    // Só atualiza classe de destaque quando a gota realmente cruza para outra aba (máx 1x por aba!)
    if (nearestIdx !== highlightedIdxRef.current) {
      highlightedIdxRef.current = nearestIdx;
      setHighlightedIdx(nearestIdx);
    }
  };

  const ensurePhysicsLoop = () => {
    if (rafIdRef.current !== null) return;
    lastFrameTimeRef.current = performance.now();

    const step = (now: number) => {
      const rawDt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      const dt = Math.min(rawDt, 0.032);
      const subSteps = 2;
      const h = dt / subSteps;

      const s = physicsRef.current;
      const tgt = targetRef.current;
      const bounce = cfgRef.current.springBounce;

      // Damping ajustado dinamicamente pelo controle de Elasticidade da Mola (sem perder rapidez)
      const tapStiffness = 290 + bounce * 85;
      const tapDamping = 28 - bounce * 11.5; // bounce=0 -> crítico suave (28), bounce=1 -> mola viva (16.5)

      for (let i = 0; i < subSteps; i++) {
        const kX = tgt.isDragging ? 880 : tapStiffness;
        const cX = tgt.isDragging ? 46 : tapDamping;
        const prevVx = s.vxPct;
        const ax = (tgt.targetXPct - s.xPct) * kX - s.vxPct * cX;
        s.vxPct += ax * h;
        s.xPct += s.vxPct * h;

        const dv = s.vxPct - prevVx;
        s.vWobble += clamp(dv * (4 + bounce * 6.5), -16, 16);

        const aTrail = (s.xPct - s.trailXPct) * 185 - s.trailVxPct * 17.5;
        s.trailVxPct += aTrail * h;
        s.trailXPct += s.trailVxPct * h;

        const distRemaining = Math.abs(tgt.targetXPct - s.xPct);
        const speed = Math.abs(s.vxPct);
        const shouldInflate =
          tgt.isPointerDown ||
          now < tgt.flightBoostUntil ||
          distRemaining > 0.032 ||
          speed > 0.2;

        const targetInflation = shouldInflate ? 1 : 0;
        const kInf = shouldInflate ? 450 : 215;
        const cInf = shouldInflate ? 22 : 19 - bounce * 6;
        const aInf = (targetInflation - s.inflation) * kInf - s.vInflation * cInf;
        s.vInflation += aInf * h;
        s.inflation += s.vInflation * h;

        const aWob = (0 - s.wobble) * 520 - s.vWobble * 15.5;
        s.vWobble += aWob * h;
        s.wobble += s.vWobble * h;

        const targetTilt = tgt.isPointerDown
          ? (s.xPct - 0.5) * (1.2 + bounce * 1.6)
          : clamp(s.vxPct * 0.4, -1.1, 1.1);
        const aTilt = (targetTilt - s.barTiltDeg) * 280 - s.vBarTilt * 19;
        s.vBarTilt += aTilt * h;
        s.barTiltDeg += s.vBarTilt * h;

        const targetScale = tgt.isPointerDown ? 0.989 : 1;
        const aScale = (targetScale - s.barPressScale) * 360 - s.vBarPress * 22;
        s.vBarPress += aScale * h;
        s.barPressScale += s.vBarPress * h;
      }

      applyFrameToDom();

      const atRest =
        !tgt.isPointerDown &&
        now >= tgt.flightBoostUntil &&
        Math.abs(tgt.targetXPct - s.xPct) < 0.0004 &&
        Math.abs(s.vxPct) < 0.002 &&
        Math.abs(s.xPct - s.trailXPct) < 0.0006 &&
        Math.abs(s.inflation) < 0.003 &&
        Math.abs(s.vInflation) < 0.01 &&
        Math.abs(s.wobble) < 0.002 &&
        Math.abs(s.barTiltDeg) < 0.01 &&
        Math.abs(1 - s.barPressScale) < 0.0005;

      if (atRest) {
        s.xPct = tgt.targetXPct;
        s.vxPct = 0;
        s.trailXPct = tgt.targetXPct;
        s.trailVxPct = 0;
        s.inflation = 0;
        s.vInflation = 0;
        s.wobble = 0;
        s.vWobble = 0;
        s.barTiltDeg = 0;
        s.vBarTilt = 0;
        s.barPressScale = 1;
        s.vBarPress = 0;
        applyFrameToDom();
        rafIdRef.current = null;
      } else {
        rafIdRef.current = requestAnimationFrame(step);
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  // Mede largura real da barra sem re-renderizar a cada pixel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const nextW = Math.max(280, Math.round(rect.width));
      if (Math.abs(barWidthRef.current - nextW) > 1) {
        barWidthRef.current = nextW;
        setBarAspect(nextW / BAR_HEIGHT);
        targetRef.current.targetXPct = tabCenterPct(resolvedIndex, nextW);
        if (rafIdRef.current === null) {
          physicsRef.current.xPct = targetRef.current.targetXPct;
          physicsRef.current.trailXPct = targetRef.current.targetXPct;
          applyFrameToDom();
        }
      }
    };

    updateSize();
    applyFrameToDom();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [resolvedIndex]);

  // Regenera os mapas ópticos compactos (meia resolução) com debounce leve ao mover sliders
  useEffect(() => {
    if (cfg.ecoGpuMode || !svgBackdropSupported) return;
    const timer = window.setTimeout(() => {
      setBarMapUrl(generateBarRefractionMap(barAspect, cfg));
      setDropletMapUrl(generateDropletLensMap(cfg));
    }, 24);
    return () => window.clearTimeout(timer);
  }, [
    barAspect,
    svgBackdropSupported,
    cfg.ecoGpuMode,
    cfg.edgeIntensity,
    cfg.edgeDistance,
    cfg.baseIntensity,
    cfg.baseDistance,
    cfg.cornerBoost,
    cfg.enableCenterWarp,
  ]);

  useEffect(() => {
    applyFrameToDom();
  }, [cfg.rimIntensity, cfg.rippleEffect, cfg.hideTabLabels]);

  // Voo líquido ao mudar de aba
  useEffect(() => {
    const prevIdx = prevResolvedIndexRef.current;
    prevResolvedIndexRef.current = resolvedIndex;
    if (targetRef.current.isPointerDown) return;

    const nextPct = tabCenterPct(resolvedIndex, barWidthRef.current);
    targetRef.current.targetXPct = nextPct;

    if (prevIdx !== resolvedIndex) {
      const dir = Math.sign(nextPct - physicsRef.current.xPct);
      physicsRef.current.vInflation = Math.max(
        physicsRef.current.vInflation,
        2.5 + cfgRef.current.rippleEffect * 2.2
      );
      physicsRef.current.vWobble += dir * (1.2 + cfgRef.current.springBounce * 2.0);
      targetRef.current.flightBoostUntil = performance.now() + 260;
    }
    ensurePhysicsLoop();
  }, [resolvedIndex]);

  // Evento opcional disparado pelas Configurações para testar o salto líquido ao vivo sem sair dos Ajustes!
  useEffect(() => {
    const onTestPulse = () => {
      const w = barWidthRef.current;
      const demoStartPct = tabCenterPct(1, w);
      const returnPct = tabCenterPct(resolvedIndex, w);
      physicsRef.current.xPct = demoStartPct;
      physicsRef.current.trailXPct = tabCenterPct(0, w);
      physicsRef.current.vInflation = 4.2;
      targetRef.current.targetXPct = returnPct;
      targetRef.current.flightBoostUntil = performance.now() + 340;
      ensurePhysicsLoop();
    };
    window.addEventListener('amanhecer:test-liquid-hop', onTestPulse);
    return () => window.removeEventListener('amanhecer:test-liquid-hop', onTestPulse);
  }, [resolvedIndex]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // INTERAÇÃO DE TOQUE E ARRASTE CONTÍNUO (ESTILO WHATSAPP iOS)
  // =========================================================================
  const pointerStateRef = useRef<{
    pointerId: number | null;
    startX: number;
  }>({
    pointerId: null,
    startX: 0,
  });

  const clientXToPctWithRubberBand = (clientX: number): number => {
    const el = containerRef.current;
    const w = barWidthRef.current;
    if (!el) return tabCenterPct(resolvedIndex, w);
    const rect = el.getBoundingClientRect();
    const raw = (clientX - rect.left) / Math.max(1, rect.width);
    const minCenter = tabCenterPct(0, rect.width);
    const maxCenter = tabCenterPct(tabs.length - 1, rect.width);

    if (raw < minCenter) return minCenter - (minCenter - raw) * 0.28;
    if (raw > maxCenter) return maxCenter + (raw - maxCenter) * 0.28;
    return raw;
  };

  const pctToNearestTabIndex = (pct: number): number => {
    const pad = 6 / Math.max(1, barWidthRef.current);
    const inner = Math.max(0.01, 1 - pad * 2);
    const norm = (pct - pad) / inner;
    const idx = Math.round(norm * tabs.length - 0.5);
    return clamp(idx, 0, tabs.length - 1);
  };

  const startGesture = (id: number, clientX: number) => {
    const pct = clientXToPctWithRubberBand(clientX);
    const nearestIdx = pctToNearestTabIndex(pct);

    pointerStateRef.current = { pointerId: id, startX: clientX };
    targetRef.current.isPointerDown = true;
    targetRef.current.isDragging = false;
    targetRef.current.targetXPct = tabCenterPct(nearestIdx, barWidthRef.current);
    physicsRef.current.vInflation = Math.max(
      physicsRef.current.vInflation,
      3.2 + cfgRef.current.rippleEffect * 1.6
    );
    ensurePhysicsLoop();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
    startGesture(e.pointerId, e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pointerStateRef.current.pointerId !== null) return;
    const t = e.changedTouches[0];
    if (t) startGesture(t.identifier + 10000, t.clientX);
  };

  useEffect(() => {
    const moveGesture = (id: number, clientX: number) => {
      if (pointerStateRef.current.pointerId === null) return;
      if (id !== pointerStateRef.current.pointerId) return;

      if (Math.abs(clientX - pointerStateRef.current.startX) > 5) {
        targetRef.current.isDragging = true;
      }
      if (targetRef.current.isDragging) {
        targetRef.current.targetXPct = clientXToPctWithRubberBand(clientX);
        ensurePhysicsLoop();
      }
    };

    const endGesture = (id: number, clientX: number) => {
      if (pointerStateRef.current.pointerId === null) return;
      if (id !== pointerStateRef.current.pointerId) return;

      const wasDragging = targetRef.current.isDragging;
      const pct = clientXToPctWithRubberBand(clientX);
      const finalIdx = pctToNearestTabIndex(pct);
      const finalTab = tabs[finalIdx];

      pointerStateRef.current.pointerId = null;
      targetRef.current.isPointerDown = false;
      targetRef.current.isDragging = false;
      targetRef.current.targetXPct = tabCenterPct(finalIdx, barWidthRef.current);
      targetRef.current.flightBoostUntil = performance.now() + 190;

      physicsRef.current.vWobble -= 1.4 * (0.4 + cfgRef.current.springBounce);
      ensurePhysicsLoop();

      if (wasDragging && finalTab && finalIdx !== resolvedIndex) {
        onNavigate(finalTab.id);
      }
    };

    const onWinPointerMove = (e: PointerEvent) => moveGesture(e.pointerId, e.clientX);
    const onWinPointerUp = (e: PointerEvent) => endGesture(e.pointerId, e.clientX);
    const onWinTouchMove = (e: TouchEvent) => {
      if (pointerStateRef.current.pointerId === null) return;
      const t = e.changedTouches[0];
      if (t) moveGesture(pointerStateRef.current.pointerId, t.clientX);
    };
    const onWinTouchEnd = (e: TouchEvent) => {
      if (pointerStateRef.current.pointerId === null) return;
      const t = e.changedTouches[0];
      if (t) endGesture(pointerStateRef.current.pointerId, t.clientX);
    };

    window.addEventListener('pointermove', onWinPointerMove, { passive: true });
    window.addEventListener('pointerup', onWinPointerUp, { passive: true });
    window.addEventListener('pointercancel', onWinPointerUp, { passive: true });
    window.addEventListener('touchmove', onWinTouchMove, { passive: true });
    window.addEventListener('touchend', onWinTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onWinTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onWinPointerMove);
      window.removeEventListener('pointerup', onWinPointerUp);
      window.removeEventListener('pointercancel', onWinPointerUp);
      window.removeEventListener('touchmove', onWinTouchMove);
      window.removeEventListener('touchend', onWinTouchEnd);
      window.removeEventListener('touchcancel', onWinTouchEnd);
    };
  }, [resolvedIndex, tabs, onNavigate]);

  // Shaders ópticos estáticos por configuração (NUNCA mutam durante os frames de animação!)
  const useSvgShader = svgBackdropSupported && !cfg.ecoGpuMode;
  const barDispScale = Number((0.015 + cfg.edgeIntensity * 0.095).toFixed(4));
  const dropDispScale = Number((0.04 + cfg.edgeIntensity * 0.24).toFixed(4));
  const blurCss = `${cfg.blurRadius.toFixed(1)}px`;
  const dropBlurCss = `${Math.max(0, cfg.blurRadius * 0.35).toFixed(1)}px`;

  // Película e reflexos dinâmicos controlados pelos sliders (Rim Intensity, Rim Distance, Tint Opacity)
  const rimAlpha = clamp(0.15 + cfg.rimIntensity * 0.8, 0.05, 0.98);
  const rimSpreadPx = Math.round(6 + cfg.rimDistance * 24);
  const tintTop = clamp(cfg.tintOpacity * 1.45, 0, 0.82);
  const tintMid = clamp(cfg.tintOpacity * 0.75, 0, 0.7);
  const tintBot = clamp(cfg.tintOpacity * 1.1, 0, 0.78);

  const activeToneClass = hasWallpaper
    ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]'
    : 'text-graphite-900 dark:text-white drop-shadow-[0_1px_6px_rgba(255,255,255,0.3)]';
  const inactiveToneClass = hasWallpaper
    ? 'text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]'
    : 'text-graphite-700/80 dark:text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]';

  const currentWidthForSvg = Math.round(barAspect * BAR_HEIGHT);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none select-none"
      role="navigation"
      aria-label="Navegação Principal"
    >
      {/* Filtros Ópticos Estáticos de Passe Único (1x <feDisplacementMap> — até 8x mais leve na GPU mobile!) */}
      {useSvgShader && (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 opacity-0"
        >
          <defs>
            {barMapUrl && (
              <filter
                id="amanhecer-lg-bar-filter"
                x="0"
                y="0"
                width="1"
                height="1"
                filterUnits="objectBoundingBox"
                primitiveUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  href={barMapUrl}
                  x="0"
                  y="0"
                  width="1"
                  height="1"
                  preserveAspectRatio="none"
                  result="barMap"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="barMap"
                  scale={barDispScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            )}

            {dropletMapUrl && (
              <filter
                id="amanhecer-lg-droplet-filter"
                x="0"
                y="0"
                width="1"
                height="1"
                filterUnits="objectBoundingBox"
                primitiveUnits="objectBoundingBox"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  href={dropletMapUrl}
                  x="0"
                  y="0"
                  width="1"
                  height="1"
                  preserveAspectRatio="none"
                  result="dropMap"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="dropMap"
                  scale={dropDispScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            )}
          </defs>
        </svg>
      )}

      <div className="max-w-md mx-auto px-3.5 pb-3 sm:pb-4 pointer-events-auto">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onTouchStart={handleTouchStart}
          style={{
            height: `${BAR_HEIGHT}px`,
            willChange: 'transform',
          }}
          className="liquid-physics-node relative w-full touch-none cursor-pointer"
        >
          {/* CAMADA 1 (z-10): Cápsula Principal Liquid Glass */}
          <div
            style={{
              backdropFilter:
                useSvgShader && barMapUrl
                  ? `url(#amanhecer-lg-bar-filter) blur(${blurCss}) saturate(185%) brightness(1.04)`
                  : `blur(${Math.max(4, cfg.blurRadius * 2.2).toFixed(1)}px) saturate(190%) brightness(1.05)`,
              WebkitBackdropFilter: `blur(${Math.max(4, cfg.blurRadius * 2.2).toFixed(
                1
              )}px) saturate(190%) brightness(1.05)`,
              background: `linear-gradient(180deg, rgba(255,255,255,${tintTop.toFixed(
                3
              )}) 0%, rgba(16,20,28,${tintMid.toFixed(3)}) 52%, rgba(255,255,255,${tintBot.toFixed(
                3
              )}) 100%)`,
              borderColor: `rgba(255,255,255,${(rimAlpha * 0.55).toFixed(3)})`,
              boxShadow: `0 20px 44px -12px rgba(0,0,0,0.45), inset 0 1.25px 0.5px rgba(255,255,255,${rimAlpha.toFixed(
                3
              )}), inset 0 -1.25px 2px rgba(255,255,255,${(rimAlpha * 0.48).toFixed(
                3
              )}), inset ${rimSpreadPx}px 6px ${rimSpreadPx + 6}px -12px rgba(255,255,255,${(
                rimAlpha * 0.62
              ).toFixed(3)}), inset -${rimSpreadPx}px -6px ${
                rimSpreadPx + 6
              }px -12px rgba(175,222,255,${(rimAlpha * 0.45).toFixed(3)})`,
            }}
            className="liquid-physics-node pointer-events-none absolute inset-0 z-10 rounded-full border"
          />

          {/* Onda Líquida Especular nas Bordas */}
          <svg
            viewBox={`0 0 ${currentWidthForSvg} ${BAR_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="liquid-physics-node pointer-events-none absolute inset-0 z-[15] w-full h-full overflow-visible"
          >
            <defs>
              <radialGradient
                ref={rimGradRef}
                id="lgWaveGlowFast"
                cx="10%"
                cy="50%"
                r={`${Math.round(22 + cfg.rimDistance * 28)}%`}
              >
                <stop offset="0%" stopColor={`rgba(255,255,255,${rimAlpha.toFixed(2)})`} />
                <stop offset="50%" stopColor={`rgba(195,232,255,${(rimAlpha * 0.45).toFixed(2)})`} />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </radialGradient>
            </defs>
            <path
              ref={rimPathRef}
              d={`M 32 0 L ${currentWidthForSvg - 32} 0 A 32 32 0 0 1 ${currentWidthForSvg} 32 A 32 32 0 0 1 ${
                currentWidthForSvg - 32
              } 64 L 32 64 A 32 32 0 0 1 0 32 A 32 32 0 0 1 32 0 Z`}
              fill="none"
              stroke="url(#lgWaveGlowFast)"
              strokeWidth="1.2"
            />
          </svg>

          {/* CAMADA 2 (z-20): Ícones Vivos & Rótulos */}
          <div className="relative z-20 h-full flex items-center justify-around px-[6px]">
            {tabs.map((tab, idx) => {
              const Icon = tab.Icon;
              const isSelected = idx === resolvedIndex;
              const isNear = idx === highlightedIdx;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (!targetRef.current.isDragging && tab.id !== currentView) {
                      onNavigate(tab.id);
                    }
                  }}
                  aria-label={tab.label}
                  aria-current={isSelected ? 'page' : undefined}
                  className="liquid-physics-node touch-none relative flex-1 h-full flex flex-col items-center justify-center gap-0.5 focus:outline-none cursor-pointer"
                >
                  <div
                    ref={(el) => {
                      iconWrapRefs.current[idx] = el;
                    }}
                    style={{ willChange: 'transform' }}
                    className={`liquid-physics-node relative ${
                      isNear ? activeToneClass : inactiveToneClass
                    }`}
                  >
                    <Icon
                      className={cfg.hideTabLabels ? 'w-[23px] h-[23px]' : 'w-[21px] h-[21px]'}
                      active={isSelected || isNear}
                    />
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[8px] font-bold shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  {!cfg.hideTabLabels && (
                    <span
                      ref={(el) => {
                        labelRefs.current[idx] = el;
                      }}
                      className={`liquid-physics-node text-[10px] tracking-tight leading-none mt-0.5 ${
                        isNear ? `font-bold ${activeToneClass}` : `font-medium ${inactiveToneClass}`
                      }`}
                    >
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CAMADA 3 (z-30): Gota / Lente Líquida Ativa (Composta 100% na GPU via translate3d + scale3d!) */}
          <div
            ref={dropletRef}
            style={{
              width: `${DROPLET_W}px`,
              height: `${DROPLET_H}px`,
              left: 0,
              top: `${(BAR_HEIGHT - DROPLET_H) / 2}px`,
              willChange: 'transform',
              backdropFilter:
                useSvgShader && dropletMapUrl
                  ? `url(#amanhecer-lg-droplet-filter) blur(${dropBlurCss}) saturate(195%) brightness(1.08)`
                  : `blur(${dropBlurCss}) saturate(195%) brightness(1.08)`,
              WebkitBackdropFilter: `blur(${dropBlurCss}) saturate(195%) brightness(1.08)`,
            }}
            className="liquid-physics-node pointer-events-none absolute z-30 rounded-full apple-liquid-droplet-lens"
          >
            <div
              ref={dropletSpecularRef}
              className="liquid-physics-node absolute inset-0 rounded-full apple-liquid-droplet-specular"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
