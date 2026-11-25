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
}

const BAR_HEIGHT = 64;
const DROPLET_W = 104;
const DROPLET_H = 72;

interface SpringPhysicsState {
  /** Posição horizontal normalizada (em fração 0..1 da largura da barra) */
  xPct: number;
  vxPct: number;
  /** Rastro viscoso secundário para deformação líquida (gota esticando) */
  trailXPct: number;
  trailVxPct: number;
  /** Inflação da lente líquida: 0 = pílula em repouso, 1 = gota de aumento inflada */
  inflation: number;
  vInflation: number;
  /** Oscilação elástica de tensão superficial (squash & stretch ao pousar) */
  wobble: number;
  vWobble: number;
  /** Inclinação 3D sutil da barra inteira reagindo ao toque e impacto */
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
}) => {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState<number>(392);
  const [svgBackdropSupported] = useState<boolean>(() => supportsSvgBackdropFilter());
  const [barMapUrl, setBarMapUrl] = useState<string>('');
  const [dropletMapUrl] = useState<string>(() => generateDropletLensMap(DROPLET_W, DROPLET_H));

  // Mede largura real da barra para alinhar 1:1 o mapa óptico SVG <feDisplacementMap>
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const nextW = Math.max(280, Math.round(rect.width));
      setBarWidth((prev) => (Math.abs(prev - nextW) > 1 ? nextW : prev));
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const url = generateBarRefractionMap(barWidth, BAR_HEIGHT, 20);
    if (url) setBarMapUrl(url);
  }, [barWidth]);

  // Estado visual renderizado a 60/120fps pela engine de física de mola
  const [renderState, setRenderState] = useState<SpringPhysicsState>(() => {
    const initPct = tabCenterPct(resolvedIndex);
    return {
      xPct: initPct,
      vxPct: 0,
      trailXPct: initPct,
      trailVxPct: 0,
      inflation: 0,
      vInflation: 0,
      wobble: 0,
      vWobble: 0,
      barTiltDeg: 0,
      vBarTilt: 0,
      barPressScale: 1,
      vBarPress: 0,
    };
  });

  // Referências mutáveis da simulação física contínua (evita recriar loops RAF)
  const physicsRef = useRef<SpringPhysicsState>({
    xPct: tabCenterPct(resolvedIndex),
    vxPct: 0,
    trailXPct: tabCenterPct(resolvedIndex),
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
    targetXPct: tabCenterPct(resolvedIndex),
    isPointerDown: false,
    isDragging: false,
    flightBoostUntil: 0,
  });

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const prevResolvedIndexRef = useRef<number>(resolvedIndex);

  const ensurePhysicsLoop = () => {
    if (rafIdRef.current !== null) return;
    lastFrameTimeRef.current = performance.now();

    const step = (now: number) => {
      const rawDt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      // Sub-stepping garante estabilidade numérica absoluta em telas 60Hz, 90Hz e 120Hz
      const dt = Math.min(rawDt, 0.032);
      const subSteps = 2;
      const h = dt / subSteps;

      const s = physicsRef.current;
      const tgt = targetRef.current;

      for (let i = 0; i < subSteps; i++) {
        // 1. Mola Horizontal Principal (estilo Apple SwiftUI .interactiveSpring)
        const kX = tgt.isDragging ? 880 : 325;
        const cX = tgt.isDragging ? 46 : 21.5; // sub-amortecida (overshoot elástico suave!)
        const prevVx = s.vxPct;
        const ax = (tgt.targetXPct - s.xPct) * kX - s.vxPct * cX;
        s.vxPct += ax * h;
        s.xPct += s.vxPct * h;

        // Impulso de aceleração alimenta a oscilação gelatinosa da gota d'água
        const dv = s.vxPct - prevVx;
        s.vWobble += clamp(dv * 8.5, -18, 18);

        // 2. Rastro Líquido Viscoso (estica atrás da gota principal durante saltos rápidos)
        const kTrail = 185;
        const cTrail = 17.5;
        const aTrail = (s.xPct - s.trailXPct) * kTrail - s.trailVxPct * cTrail;
        s.trailVxPct += aTrail * h;
        s.trailXPct += s.trailVxPct * h;

        // 3. Mola de Inflação da Lente Líquida (sobe ao tocar/viajar, pousa elástica ao chegar)
        const distRemaining = Math.abs(tgt.targetXPct - s.xPct);
        const speed = Math.abs(s.vxPct);
        const shouldInflate =
          tgt.isPointerDown ||
          now < tgt.flightBoostUntil ||
          distRemaining > 0.035 ||
          speed > 0.22;

        const targetInflation = shouldInflate ? 1 : 0;
        const kInf = shouldInflate ? 460 : 215;
        const cInf = shouldInflate ? 22 : 14.5; // bounce elástico ao assentar na aba!
        const aInf = (targetInflation - s.inflation) * kInf - s.vInflation * cInf;
        s.vInflation += aInf * h;
        s.inflation += s.vInflation * h;

        // 4. Mola de Tensão Superficial (Wobble / Squash & Stretch)
        const aWob = (0 - s.wobble) * 540 - s.vWobble * 15;
        s.vWobble += aWob * h;
        s.wobble += s.vWobble * h;

        // 5. Física de Massa da Barra Inteira (inclinação 3D e compressão tátil)
        const targetTilt = tgt.isPointerDown
          ? (s.xPct - 0.5) * 2.4
          : clamp(s.vxPct * 0.45, -1.2, 1.2);
        const aTilt = (targetTilt - s.barTiltDeg) * 280 - s.vBarTilt * 19;
        s.vBarTilt += aTilt * h;
        s.barTiltDeg += s.vBarTilt * h;

        const targetScale = tgt.isPointerDown ? 0.988 : 1;
        const aScale = (targetScale - s.barPressScale) * 360 - s.vBarPress * 22;
        s.vBarPress += aScale * h;
        s.barPressScale += s.vBarPress * h;
      }

      setRenderState({ ...s });

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
        setRenderState({ ...s });
        rafIdRef.current = null;
      } else {
        rafIdRef.current = requestAnimationFrame(step);
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  // Quando a view muda (via toque na barra ou navegação externa do app), dispara o voo líquido!
  useEffect(() => {
    const prevIdx = prevResolvedIndexRef.current;
    prevResolvedIndexRef.current = resolvedIndex;
    if (targetRef.current.isPointerDown) return;

    const nextPct = tabCenterPct(resolvedIndex, barWidth);
    targetRef.current.targetXPct = nextPct;

    if (prevIdx !== resolvedIndex) {
      const dir = Math.sign(nextPct - physicsRef.current.xPct);
      // Impulso inicial orgânico estilo gota se desprendendo
      physicsRef.current.vInflation = Math.max(physicsRef.current.vInflation, 3.6);
      physicsRef.current.vWobble += dir * 2.4;
      targetRef.current.flightBoostUntil = performance.now() + 280;
    }
    ensurePhysicsLoop();
  }, [resolvedIndex, barWidth]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // INTERAÇÃO TÁTIL COMPLETA: TOQUE OU SEGURAR & DESLIZAR (ESTILO WHATSAPP iOS)
  // =========================================================================
  const pointerStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    lastHoveredIdx: number;
  }>({
    pointerId: null,
    startX: 0,
    lastHoveredIdx: resolvedIndex,
  });

  const clientXToPctWithRubberBand = (clientX: number): number => {
    const el = containerRef.current;
    if (!el) return tabCenterPct(resolvedIndex, barWidth);
    const rect = el.getBoundingClientRect();
    const raw = (clientX - rect.left) / Math.max(1, rect.width);
    const minCenter = tabCenterPct(0, rect.width);
    const maxCenter = tabCenterPct(tabs.length - 1, rect.width);

    if (raw < minCenter) {
      return minCenter - (minCenter - raw) * 0.28;
    }
    if (raw > maxCenter) {
      return maxCenter + (raw - maxCenter) * 0.28;
    }
    return raw;
  };

  const pctToNearestTabIndex = (pct: number): number => {
    const pad = 6 / Math.max(1, barWidth);
    const inner = Math.max(0.01, 1 - pad * 2);
    const norm = (pct - pad) / inner;
    const idx = Math.round(norm * tabs.length - 0.5);
    return clamp(idx, 0, tabs.length - 1);
  };

  const startGesture = (id: number, clientX: number) => {
    const pct = clientXToPctWithRubberBand(clientX);
    const nearestIdx = pctToNearestTabIndex(pct);

    pointerStateRef.current = {
      pointerId: id,
      startX: clientX,
      lastHoveredIdx: nearestIdx,
    };

    targetRef.current.isPointerDown = true;
    targetRef.current.isDragging = false;
    targetRef.current.targetXPct = tabCenterPct(nearestIdx, barWidth);
    physicsRef.current.vInflation = Math.max(physicsRef.current.vInflation, 4.0);
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

      const movedPx = Math.abs(clientX - pointerStateRef.current.startX);
      if (movedPx > 5) {
        targetRef.current.isDragging = true;
      }

      if (targetRef.current.isDragging) {
        const pct = clientXToPctWithRubberBand(clientX);
        targetRef.current.targetXPct = pct;
        pointerStateRef.current.lastHoveredIdx = pctToNearestTabIndex(pct);
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
      targetRef.current.targetXPct = tabCenterPct(finalIdx, barWidth);
      targetRef.current.flightBoostUntil = performance.now() + 200;

      physicsRef.current.vWobble -= 1.6;
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
  }, [barWidth, resolvedIndex, tabs, onNavigate]);

  // =========================================================================
  // GEOMETRIA ÓPTICA E DEFORMAÇÃO LÍQUIDA POR FRAME
  // =========================================================================
  const inf = clamp(renderState.inflation, -0.18, 1.35);
  const infPositive = clamp(inf, 0, 1.25);

  const dropletCenterX = renderState.xPct * barWidth;
  const trailCenterX = renderState.trailXPct * barWidth;
  const speedNorm = Math.min(1.4, Math.abs(renderState.vxPct) * 0.45);

  // Squash & Stretch conservando volume líquido:
  // Em repouso: ~74x52px dentro da barra de 64px.
  // Inflada/em movimento: ~106..132px x 72px (ultrapassa topo e base da barra igual WhatsApp iOS 26 / Imagem 1!)
  const liquidLagStretch = Math.min(0.26, Math.abs(dropletCenterX - trailCenterX) / 260);
  const baseScaleX = 0.72 + inf * 0.30;
  const baseScaleY = 0.72 + inf * 0.32;

  const stretchFactor = 1 + speedNorm * 0.15 + liquidLagStretch + renderState.wobble * 0.06;
  const squashFactor = 1 / Math.sqrt(Math.max(0.76, Math.min(1.22, stretchFactor)));

  const dropletScaleX = clamp(baseScaleX * stretchFactor, 0.58, 1.34);
  const dropletScaleY = clamp(baseScaleY * squashFactor, 0.58, 1.16);

  // Potência dinâmica da refração cromática na gota (em unidades objectBoundingBox 0..1, 100% Retina-independente!):
  // Em repouso (infPositive = 0) o ícone ativo fica 100% nítido;
  // Quando inflada/em movimento (infPositive -> 1) atua como lente d'água convexa suave estilo iOS 26!
  const dropDispG = infPositive * 0.25;
  const dropDispR = dropDispG * 1.14;
  const dropDispB = dropDispG * 0.87;

  // Caminho SVG de onda líquida especular na borda da barra (a barra reage fluidamente à passagem da gota)
  const bulgeAmp = infPositive * 4.8;
  const bulgeHalfSpan = 54;
  const bx0 = clamp(dropletCenterX - bulgeHalfSpan, 32, barWidth - 32);
  const bx3 = clamp(dropletCenterX + bulgeHalfSpan, 32, barWidth - 32);
  const cx = clamp(dropletCenterX, 34, barWidth - 34);
  const topBulgeY = -bulgeAmp;
  const botBulgeY = BAR_HEIGHT + bulgeAmp;
  const rBar = BAR_HEIGHT / 2;

  const liquidRimPath = [
    `M ${rBar} 0`,
    `L ${bx0.toFixed(1)} 0`,
    `C ${(cx - 26).toFixed(1)} 0, ${(cx - 20).toFixed(1)} ${topBulgeY.toFixed(1)}, ${cx.toFixed(
      1
    )} ${topBulgeY.toFixed(1)}`,
    `C ${(cx + 20).toFixed(1)} ${topBulgeY.toFixed(1)}, ${(cx + 26).toFixed(
      1
    )} 0, ${bx3.toFixed(1)} 0`,
    `L ${(barWidth - rBar).toFixed(1)} 0`,
    `A ${rBar} ${rBar} 0 0 1 ${barWidth} ${rBar}`,
    `A ${rBar} ${rBar} 0 0 1 ${(barWidth - rBar).toFixed(1)} ${BAR_HEIGHT}`,
    `L ${bx3.toFixed(1)} ${BAR_HEIGHT}`,
    `C ${(cx + 26).toFixed(1)} ${BAR_HEIGHT}, ${(cx + 20).toFixed(1)} ${botBulgeY.toFixed(
      1
    )}, ${cx.toFixed(1)} ${botBulgeY.toFixed(1)}`,
    `C ${(cx - 20).toFixed(1)} ${botBulgeY.toFixed(1)}, ${(cx - 26).toFixed(
      1
    )} ${BAR_HEIGHT}, ${bx0.toFixed(1)} ${BAR_HEIGHT}`,
    `L ${rBar} ${BAR_HEIGHT}`,
    `A ${rBar} ${rBar} 0 0 1 0 ${rBar}`,
    `A ${rBar} ${rBar} 0 0 1 ${rBar} 0`,
    'Z',
  ].join(' ');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none select-none"
      role="navigation"
      aria-label="Navegação Principal"
    >
      {/* Filtros Ópticos SVG (color-interpolation-filters="sRGB" garante alinhamento 0px exato no centro e refração pura nas bordas) */}
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
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.005 0.032" result="softBackdrop" />
              <feImage
                href={barMapUrl}
                x="0"
                y="0"
                width="1"
                height="1"
                preserveAspectRatio="none"
                result="barMap"
              />
              {/* Dispersão cromática sutil nas bordas curvas de vidro da barra */}
              <feDisplacementMap
                in="softBackdrop"
                in2="barMap"
                scale={0.072}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispR"
              />
              <feColorMatrix
                in="dispR"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="chanR"
              />
              <feDisplacementMap
                in="softBackdrop"
                in2="barMap"
                scale={0.062}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispG"
              />
              <feColorMatrix
                in="dispG"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="chanG"
              />
              <feDisplacementMap
                in="softBackdrop"
                in2="barMap"
                scale={0.052}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispB"
              />
              <feColorMatrix
                in="dispB"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="chanB"
              />
              <feBlend in="chanR" in2="chanG" mode="screen" result="chanRG" />
              <feBlend in="chanRG" in2="chanB" mode="screen" />
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
              {/* Refração de lente d'água + aberração cromática prismática no menisco */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="dropMap"
                scale={dropDispR}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dR"
              />
              <feColorMatrix
                in="dR"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="cR"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="dropMap"
                scale={dropDispG}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dG"
              />
              <feColorMatrix
                in="dG"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="cG"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="dropMap"
                scale={dropDispB}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dB"
              />
              <feColorMatrix
                in="dB"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="cB"
              />
              <feBlend in="cR" in2="cG" mode="screen" result="cRG" />
              <feBlend in="cRG" in2="cB" mode="screen" />
            </filter>
          )}
        </defs>
      </svg>

      <div className="max-w-md mx-auto px-3.5 pb-3 sm:pb-4 pointer-events-auto">
        {/* IMPORTANTE: Este wrapper NÃO aplica opacity < 1, filter nem backdrop-filter,
            para que TANTO a barra (z-10) QUANTO a gota líquida (z-30) sejam irmãs no mesmo
            Backdrop Root global e refratem em tempo real o Wallpaper + HUD + Ícones! */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onTouchStart={handleTouchStart}
          style={{
            height: `${BAR_HEIGHT}px`,
            transform: `perspective(900px) rotateZ(${renderState.barTiltDeg.toFixed(
              3
            )}deg) scale(${renderState.barPressScale.toFixed(4)})`,
          }}
          className="liquid-physics-node relative w-full touch-none cursor-pointer"
        >
          {/* =================================================================
              CAMADA 1 (z-10): CÁPSULA PRINCIPAL APPLE LIQUID GLASS
              Refrata o Papel de Parede (z-0) + Cards/Textos da HUD (z-10 do App)
             ================================================================= */}
          <div
            style={{
              backdropFilter:
                svgBackdropSupported && barMapUrl
                  ? 'url(#amanhecer-lg-bar-filter) saturate(185%) brightness(1.04)'
                  : 'blur(16px) saturate(190%) brightness(1.06)',
              WebkitBackdropFilter: 'blur(16px) saturate(190%) brightness(1.06)',
            }}
            className="liquid-physics-node pointer-events-none absolute inset-0 z-10 rounded-full apple-liquid-glass-bar"
          />

          {/* Onda Líquida Especular Dinâmica nas Bordas da Barra (acompanha a gota) */}
          <svg
            viewBox={`0 0 ${barWidth} ${BAR_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="liquid-physics-node pointer-events-none absolute inset-0 z-[15] w-full h-full overflow-visible"
          >
            <defs>
              <radialGradient
                id="lgWaveGlow"
                cx={`${(renderState.xPct * 100).toFixed(1)}%`}
                cy="50%"
                r="38%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.88)" />
                <stop offset="45%" stopColor="rgba(210,235,255,0.36)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
              </radialGradient>
            </defs>
            <path
              d={liquidRimPath}
              fill="rgba(255, 255, 255, 0.015)"
              stroke="url(#lgWaveGlow)"
              strokeWidth={1.15 + infPositive * 0.55}
            />
          </svg>

          {/* =================================================================
              CAMADA 2 (z-20): ÍCONES VIVOS E RÓTULOS DAS 5 ABAS
              Ficam ACIMA da barra (z-10) e ABAIXO da lente da gota (z-30),
              para que a gota inflada magnifique e refrate os ícones ao passar!
             ================================================================= */}
          <div className="relative z-20 h-full flex items-center justify-around px-[6px]">
            {tabs.map((tab, idx) => {
              const Icon = tab.Icon;
              const isSelected = idx === resolvedIndex;
              const tabPct = tabCenterPct(idx, barWidth);
              // Proximidade contínua ao centro da gota líquida (0..1)
              const distInTabs = Math.abs(renderState.xPct - tabPct) * tabs.length;
              const proximity = clamp(1 - distInTabs, 0, 1);
              const liftY = -proximity * (1.2 + infPositive * 1.8);
              const iconScale = 1 + proximity * (0.07 + infPositive * 0.09);

              const activeToneClass = hasWallpaper
                ? 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]'
                : 'text-graphite-900 dark:text-white drop-shadow-[0_1px_6px_rgba(255,255,255,0.3)]';
              const inactiveToneClass = hasWallpaper
                ? 'text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]'
                : 'text-graphite-700/80 dark:text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]';

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
                    style={{
                      transform: `translate3d(0, ${liftY.toFixed(2)}px, 0) scale(${iconScale.toFixed(
                        3
                      )})`,
                    }}
                    className={`liquid-physics-node relative ${
                      proximity > 0.45 ? activeToneClass : inactiveToneClass
                    }`}
                  >
                    <Icon className="w-[21px] h-[21px]" active={isSelected || proximity > 0.55} />
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[8px] font-bold shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      transform: `translate3d(0, ${(liftY * 0.45).toFixed(2)}px, 0)`,
                    }}
                    className={`liquid-physics-node text-[10px] tracking-tight leading-none mt-0.5 ${
                      proximity > 0.45
                        ? `font-bold ${activeToneClass}`
                        : `font-medium ${inactiveToneClass}`
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* =================================================================
              CAMADA 3 (z-30): GOTA / LENTE ATIVA DE LIQUID GLASS
              Irmã direta da barra: refrata Wallpaper + HUD + Barra + Ícones!
             ================================================================= */}
          <div
            style={{
              width: `${DROPLET_W}px`,
              height: `${DROPLET_H}px`,
              left: 0,
              top: `${(BAR_HEIGHT - DROPLET_H) / 2}px`,
              transform: `translate3d(${(dropletCenterX - DROPLET_W / 2).toFixed(
                2
              )}px, 0, 0) scale(${dropletScaleX.toFixed(4)}, ${dropletScaleY.toFixed(4)})`,
              backdropFilter:
                svgBackdropSupported && dropletMapUrl
                  ? `url(#amanhecer-lg-droplet-filter) saturate(${Math.round(
                      165 + infPositive * 45
                    )}%) brightness(${(1.05 + infPositive * 0.08).toFixed(2)}) contrast(${(
                      1.02 +
                      infPositive * 0.06
                    ).toFixed(2)})`
                  : `blur(${(1.5 - infPositive * 1.2).toFixed(
                      1
                    )}px) saturate(200%) brightness(1.12) contrast(1.06)`,
              WebkitBackdropFilter: `blur(${Math.max(
                0,
                1.5 - infPositive * 1.2
              ).toFixed(1)}px) saturate(200%) brightness(1.12) contrast(1.06)`,
            }}
            className={`liquid-physics-node pointer-events-none absolute z-30 rounded-full apple-liquid-droplet-lens ${
              infPositive > 0.2 ? 'apple-liquid-droplet-inflated' : ''
            }`}
          >
            {/* Reflexo especular curvo de menisco d'água (topo-esquerdo + caustica inferior + dispersão prismática) */}
            <div
              style={{
                opacity: 0.55 + clamp(infPositive, 0, 1) * 0.45,
              }}
              className="liquid-physics-node absolute inset-0 rounded-full apple-liquid-droplet-specular"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
