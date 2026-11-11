import React, { useState } from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { METRIC_DICTIONARY } from '../../services/analytics/metrics-dictionary';

export interface SparklineProps {
  data: number[];
  color?: string;
}

export const MiniSparkline: React.FC<SparklineProps> = ({
  data,
  color = 'currentColor',
}) => {
  if (!data || data.length < 2) {
    return <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded" />;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const width = 72;
  const height = 24;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export interface KPICardProps {
  id: string;
  label: string;
  formattedValue: string;
  previousValue: number | null;
  deltaPercent: number | null;
  confidence: 'confirmed' | 'estimated' | 'unavailable';
  unavailableReason?: string;
  sparkline: number[];
  showComparison: boolean;
}

export const PrecisionKPICard: React.FC<KPICardProps> = ({
  id,
  label,
  formattedValue,
  previousValue,
  deltaPercent,
  confidence,
  unavailableReason,
  sparkline,
  showComparison,
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const dict = METRIC_DICTIONARY[id];

  const badgeColors = {
    confirmed:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70',
    estimated:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
    unavailable:
      'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  };

  const badgeLabels = {
    confirmed: 'Confirmado',
    estimated: 'Estimado',
    unavailable: 'Indisponível',
  };

  return (
    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-lg p-4 flex flex-col justify-between transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Top Row: Label + Confidence Badge + Info Tooltip Trigger */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
            {label}
          </span>
          <button
            type="button"
            onClick={() => setTooltipOpen((v) => !v)}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0"
            aria-label={`Explicação da métrica ${label}`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${badgeColors[confidence]}`}
        >
          {badgeLabels[confidence]}
        </span>
      </div>

      {/* Value + Sparkline */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div
          className={`font-semibold tracking-tight tabular-nums ${
            confidence === 'unavailable'
              ? 'text-sm text-zinc-400 dark:text-zinc-500'
              : 'text-2xl text-zinc-900 dark:text-zinc-50'
          }`}
        >
          {formattedValue}
        </div>

        {confidence !== 'unavailable' && (
          <div className="text-zinc-600 dark:text-zinc-400">
            <MiniSparkline data={sparkline} />
          </div>
        )}
      </div>

      {/* Comparison Row */}
      <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px]">
        {showComparison && deltaPercent !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
              deltaPercent > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : deltaPercent < 0
                ? 'text-rose-700 dark:text-rose-400'
                : 'text-zinc-500'
            }`}
          >
            {deltaPercent > 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : deltaPercent < 0 ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
            </span>
          </span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-500">
            {unavailableReason ? 'Dados insuficientes' : 'Período atual'}
          </span>
        )}

        {showComparison && previousValue !== null && (
          <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">
            ant: {previousValue.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {/* Explanatory Tooltip Popover */}
      {tooltipOpen && (
        <div className="absolute left-2 right-2 top-10 z-30 p-3 rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-800 border border-zinc-700 shadow-lg text-[11px] leading-relaxed space-y-1.5">
          <p className="font-semibold text-white">{label}</p>
          {dict ? (
            <>
              <p className="text-zinc-300">{dict.definition}</p>
              <p className="text-zinc-400">
                <strong className="text-zinc-200">Cálculo:</strong> {dict.calculationMethod}
              </p>
              <p className="text-zinc-400">
                <strong className="text-zinc-200">Limitações:</strong> {dict.limitations}
              </p>
            </>
          ) : (
            <p className="text-zinc-300">
              {unavailableReason ||
                'Métrica calculada em tempo real a partir dos eventos consentidos.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- Gráfico Interativo de Séries Temporais ----------
export interface TimeSeriesChartProps {
  series: Array<{
    date: string;
    uniqueVisitors: number;
    sessions: number;
    pageviews: number;
    appOpens: number;
    pwaStandaloneOpens: number;
    readingsCompleted: number;
    sharesCompleted: number;
  }>;
}

type SeriesMetricKey =
  | 'uniqueVisitors'
  | 'sessions'
  | 'pageviews'
  | 'readingsCompleted'
  | 'pwaStandaloneOpens'
  | 'sharesCompleted';

const METRIC_LABELS: Record<SeriesMetricKey, string> = {
  uniqueVisitors: 'Visitantes Únicos',
  sessions: 'Sessões',
  pageviews: 'Visualizações de Página',
  readingsCompleted: 'Leituras Confirmadas',
  pwaStandaloneOpens: 'Aberturas PWA',
  sharesCompleted: 'Compartilhamentos',
};

export const InteractiveTimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  series,
}) => {
  const [primaryMetric, setPrimaryMetric] =
    useState<SeriesMetricKey>('uniqueVisitors');
  const [secondaryMetric, setSecondaryMetric] =
    useState<SeriesMetricKey>('readingsCompleted');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!series || series.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
        Nenhum dado disponível para o intervalo selecionado.
      </div>
    );
  }

  const values1 = series.map((d) => d[primaryMetric] || 0);
  const values2 = series.map((d) => d[secondaryMetric] || 0);
  const maxVal = Math.max(...values1, ...values2, 4);

  const width = 860;
  const height = 240;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getCoords = (vals: number[]) =>
    vals.map((v, i) => {
      const x =
        padLeft +
        (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
      const y = padTop + plotH - (v / maxVal) * plotH;
      return { x, y, v };
    });

  const coords1 = getCoords(values1);
  const coords2 = getCoords(values2);

  const line1 = coords1.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area1 =
    coords1.length > 1
      ? `${coords1[0].x.toFixed(1)},${padTop + plotH} ${line1} ${coords1[
          coords1.length - 1
        ].x.toFixed(1)},${padTop + plotH}`
      : '';
  const line2 = coords2.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Evolução Diária Comparada
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Passe o cursor sobre os pontos para inspecionar os valores exatos por data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 inline-block" />
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value as SeriesMetricKey)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-100"
            >
              {Object.entries(METRIC_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <select
              value={secondaryMetric}
              onChange={(e) =>
                setSecondaryMetric(e.target.value as SeriesMetricKey)
              }
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-100"
            >
              {Object.entries(METRIC_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none overflow-visible"
        >
          {/* Linhas horizontais de grade */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padTop + plotH - ratio * plotH;
            const labelVal = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px] tabular-nums"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Área sombreada sutil da métrica primária */}
          {area1 && (
            <polygon
              points={area1}
              className="fill-zinc-900/[0.04] dark:fill-zinc-100/[0.05]"
            />
          )}

          {/* Linha Primária */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-zinc-900 dark:text-zinc-100"
            strokeWidth="2"
            points={line1}
          />

          {/* Linha Secundária */}
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="4 2"
            points={line2}
          />

          {/* Pontos e zonas de hover */}
          {series.map((item, idx) => {
            const c1 = coords1[idx];
            const c2 = coords2[idx];
            const showDateLabel =
              idx === 0 ||
              idx === series.length - 1 ||
              idx % Math.max(1, Math.floor(series.length / 6)) === 0;

            return (
              <g
                key={item.date}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                {hoverIdx === idx && (
                  <line
                    x1={c1.x}
                    y1={padTop}
                    x2={c1.x}
                    y2={padTop + plotH}
                    stroke="currentColor"
                    className="text-zinc-300 dark:text-zinc-700"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={c1.x}
                  cy={c1.y}
                  r={hoverIdx === idx ? 4.5 : 2.5}
                  className="fill-zinc-900 dark:fill-zinc-100"
                />
                <circle
                  cx={c2.x}
                  cy={c2.y}
                  r={hoverIdx === idx ? 4.5 : 2.5}
                  fill="#059669"
                />
                <rect
                  x={c1.x - plotW / Math.max(2, series.length) / 2}
                  y={padTop}
                  width={plotW / Math.max(2, series.length)}
                  height={plotH}
                  fill="transparent"
                />
                {showDateLabel && (
                  <text
                    x={c1.x}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-zinc-400 dark:fill-zinc-500 text-[10px] tabular-nums"
                  >
                    {item.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoverIdx !== null && series[hoverIdx] && (
          <div className="mt-2 p-2.5 rounded-md bg-zinc-900 text-zinc-100 dark:bg-zinc-800 border border-zinc-700 text-xs flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono font-semibold">{series[hoverIdx].date}</span>
            <div className="flex items-center gap-4 tabular-nums">
              <span>
                {METRIC_LABELS[primaryMetric]}:{' '}
                <strong>{series[hoverIdx][primaryMetric]}</strong>
              </span>
              <span className="text-emerald-400">
                {METRIC_LABELS[secondaryMetric]}:{' '}
                <strong>{series[hoverIdx][secondaryMetric]}</strong>
              </span>
              <span className="text-zinc-400">
                Pageviews: {series[hoverIdx].pageviews}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Heatmap 7 dias x 24 horas (Seção 5.1 & 11) ----------
const SHORT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const ReadingHourHeatmap: React.FC<{ matrix: number[][] }> = ({
  matrix,
}) => {
  if (!matrix || matrix.length !== 7) return null;
  let maxCell = 1;
  for (const row of matrix) {
    for (const v of row) {
      if (v > maxCell) maxCell = v;
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5 space-y-3 overflow-x-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Mapa de Calor de Leituras por Dia e Horário (America/Sao_Paulo)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Concentração de aberturas e confirmações de leitura ao longo das 24h
          </p>
        </div>
      </div>

      <div className="min-w-[640px] space-y-1.5 pt-2">
        <div className="grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-zinc-400 tabular-nums">
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-center">
              {String(h).padStart(2, '0')}h
            </div>
          ))}
        </div>

        {matrix.map((row, dayIdx) => (
          <div
            key={dayIdx}
            className="grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-1 items-center"
          >
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {SHORT_DAYS[dayIdx]}
            </span>
            {row.map((val, hourIdx) => {
              const intensity = val === 0 ? 0 : Math.max(0.18, val / maxCell);
              return (
                <div
                  key={hourIdx}
                  title={`${SHORT_DAYS[dayIdx]} às ${String(hourIdx).padStart(
                    2,
                    '0'
                  )}:00 — ${val} leituras`}
                  style={{
                    backgroundColor:
                      val === 0
                        ? undefined
                        : `rgba(5, 150, 105, ${intensity.toFixed(2)})`,
                  }}
                  className={`h-6 rounded-sm flex items-center justify-center text-[10px] tabular-nums transition-colors ${
                    val === 0
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-transparent'
                      : intensity > 0.55
                      ? 'text-white font-semibold'
                      : 'text-zinc-900 dark:text-zinc-100 font-medium'
                  }`}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
