import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatedBookOpenIcon,
  AnimatedBookmarkDiaryIcon,
  AnimatedClockHistoryIcon,
  AnimatedHeartIcon,
  AnimatedSettingsIcon,
} from './AnimatedIcons';

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
}

const SVG_W = 400;
const SVG_H = 86;
const BAR_TOP_Y = 22;
const BAR_BOT_Y = 82;
const TAB_CENTERS = [44, 122, 200, 278, 356];

/**
 * Constrói o caminho SVG da barra inferior com recorte líquido (scoop/cradle ou gota ascendente)
 * idêntico à referência `animação da barra inferior.mp4`.
 */
function buildLiquidBarPath(notchX: number, notchDepth: number): string {
  const r = 28;
  const left = 4;
  const right = SVG_W - 4;

  // Largura da onda líquida ao redor de notchX
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

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  favoritesCount = 0,
}) => {
  const tabs = [
    { id: 'home', label: 'Hoje', Icon: AnimatedBookOpenIcon },
    { id: 'history', label: 'Histórico', Icon: AnimatedClockHistoryIcon },
    {
      id: 'favorites',
      label: 'Favoritos',
      Icon: AnimatedHeartIcon,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    { id: 'diary', label: 'Diário', Icon: AnimatedBookmarkDiaryIcon },
    { id: 'settings', label: 'Ajustes', Icon: AnimatedSettingsIcon },
  ];

  const resolvedIndex = Math.max(
    0,
    tabs.findIndex(
      (t) => t.id === currentView || (t.id === 'home' && currentView === 'devotional')
    )
  );

  // Estado animado da onda líquida e da bolha flutuante
  const [animState, setAnimState] = useState(() => ({
    notchX: TAB_CENTERS[resolvedIndex],
    notchDepth: 26, // +26 = berço côncavo, < 0 = cúpula líquida subindo (nav_03)
    bubbleX: TAB_CENTERS[resolvedIndex],
    bubbleY: 0, // 0 = posição elevada padrão, +26 = submersa na barra
    bubbleScale: 1,
    activeIdx: resolvedIndex,
    animKey: 0,
  }));

  const prevIndexRef = useRef<number>(resolvedIndex);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const fromIdx = prevIndexRef.current;
    const toIdx = resolvedIndex;
    if (fromIdx === toIdx) return;

    prevIndexRef.current = toIdx;
    const startX = TAB_CENTERS[fromIdx];
    const targetX = TAB_CENTERS[toIdx];
    const startTime = performance.now();
    const duration = 480; // ms

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);

      // Interpolação horizontal suave com leve overshoot elástico
      const easeOutBack = (x: number) => {
        const c1 = 1.35;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      };

      let notchX = targetX;
      let notchDepth = 26;
      let bubbleX = targetX;
      let bubbleY = 0;
      let bubbleScale = 1;
      let displayedIdx = toIdx;

      if (t < 0.28) {
        // Fase 1 (nav_02): Círculo antigo mergulha na barra enquanto a cavidade desliza
        const p = t / 0.28;
        const smoothP = p * p * (3 - 2 * p);
        displayedIdx = fromIdx;
        bubbleX = startX;
        bubbleY = smoothP * 28;
        bubbleScale = 1 - smoothP * 0.72;
        notchX = startX + (targetX - startX) * (smoothP * 0.65);
        notchDepth = 26 - smoothP * 14;
      } else if (t < 0.56) {
        // Fase 2 (nav_03): A barra forma uma gota/onda ascendente no novo ícone
        const p = (t - 0.28) / 0.28;
        const domePulse = Math.sin(p * Math.PI);
        displayedIdx = toIdx;
        notchX = startX + (targetX - startX) * (0.65 + p * 0.35);
        // A borda superior sobe formando a cúpula líquida (-12px acima da linha da barra)
        notchDepth = 12 - domePulse * 24;
        bubbleX = targetX;
        bubbleY = (1 - p) * 24 - domePulse * 4;
        bubbleScale = 0.35 + p * 0.75;
      } else {
        // Fase 3 (nav_04 -> nav_05): A gota se desprende e a cavidade côncava se acomoda
        const p = (t - 0.56) / 0.44;
        const springP = easeOutBack(p);
        displayedIdx = toIdx;
        notchX = targetX;
        notchDepth = -6 + springP * 32;
        bubbleX = targetX;
        bubbleY = (1 - springP) * -5;
        bubbleScale = 1 + Math.sin(p * Math.PI) * 0.06;
      }

      setAnimState((prev) => ({
        notchX,
        notchDepth,
        bubbleX,
        bubbleY,
        bubbleScale,
        activeIdx: displayedIdx,
        animKey: t >= 0.28 && prev.activeIdx !== toIdx ? prev.animKey + 1 : prev.animKey,
      }));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setAnimState((prev) => ({
          notchX: targetX,
          notchDepth: 26,
          bubbleX: targetX,
          bubbleY: 0,
          bubbleScale: 1,
          activeIdx: toIdx,
          animKey: prev.animKey,
        }));
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resolvedIndex]);

  const ActiveIcon = tabs[animState.activeIdx]?.Icon || AnimatedBookOpenIcon;
  const bubbleLeftPct = (animState.bubbleX / SVG_W) * 100;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none ae-reveal-up ae-stagger-4"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto px-3 pb-2.5 sm:pb-3.5 pointer-events-auto">
        <div className="relative h-[82px] select-none">
          {/* Camada SVG Líquida com Recorte Côncavo e Onda Dinâmica */}
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible drop-shadow-[0_14px_28px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_16px_34px_rgba(0,0,0,0.65)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="amanhecerNavLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.97" />
                <stop offset="100%" stopColor="#FAF6EC" stopOpacity="0.97" />
              </linearGradient>
              <linearGradient id="amanhecerNavDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#222B22" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#161D16" stopOpacity="0.98" />
              </linearGradient>
            </defs>

            {/* Superfície modo claro */}
            <path
              d={buildLiquidBarPath(animState.notchX, animState.notchDepth)}
              fill="url(#amanhecerNavLight)"
              stroke="rgba(217, 199, 163, 0.72)"
              strokeWidth="1.25"
              className="block dark:hidden"
            />
            {/* Superfície modo escuro */}
            <path
              d={buildLiquidBarPath(animState.notchX, animState.notchDepth)}
              fill="url(#amanhecerNavDark)"
              stroke="rgba(217, 199, 163, 0.30)"
              strokeWidth="1.25"
              className="hidden dark:block"
            />
          </svg>

          {/* Círculo Flutuante Ativo (Emerge da Onda Líquida) */}
          <div
            key={animState.animKey}
            style={{
              left: `${bubbleLeftPct}%`,
              transform: `translate(-50%, ${animState.bubbleY.toFixed(1)}px) scale(${animState.bubbleScale.toFixed(
                3
              )})`,
            }}
            className="pointer-events-none absolute top-[1px] z-20 w-12 h-12 rounded-full btn-tactile-sage flex items-center justify-center shadow-lg"
          >
            <ActiveIcon className="w-5 h-5" active={true} />
          </div>

          {/* Botões Interativos das 5 Abas */}
          <div className="absolute inset-x-1 top-[22px] bottom-[4px] z-10 flex items-center justify-around">
            {tabs.map((tab, idx) => {
              const Icon = tab.Icon;
              const isActive = idx === resolvedIndex;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id as AppView)}
                  className="relative flex-1 h-full flex flex-col items-center justify-end pb-2 group focus:outline-none cursor-pointer"
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Ícone inativo (esmaece suavemente quando a aba está ativa na bolha superior) */}
                  <div
                    className={`relative transition-all duration-200 ${
                      isActive
                        ? 'opacity-0 -translate-y-3 scale-75 pointer-events-none'
                        : 'opacity-100 translate-y-0 scale-100 text-graphite-400 dark:text-sand-300/80 group-hover:text-graphite-800 dark:group-hover:text-cream-50 group-hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className="w-5 h-5" active={false} />
                    {tab.badge && (
                      <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-sage-700 dark:bg-sand-300 text-white dark:text-sage-950 rounded-full text-[8px] font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] tracking-tight transition-all duration-200 mt-1 ${
                      isActive
                        ? 'font-bold text-sage-900 dark:text-cream-100 translate-y-0'
                        : 'font-medium text-graphite-400 dark:text-sand-300/80 group-hover:text-graphite-700 dark:group-hover:text-cream-50'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
