'use client';

import React from 'react';
import type { TimelinePoint2022 } from '@/lib/types';

interface TrajectoryChartProps {
  timeline2022: TimelinePoint2022[];
  currentPct2026: number;
  cand1Pct2026?: number;
  cand2Pct2026?: number;
  cand1Pct2022?: number;
  cand2Pct2022?: number;
}

export function TrajectoryChart({
  timeline2022,
  currentPct2026,
  cand1Pct2026 = 47.85,
  cand2Pct2026 = 44.10,
  cand1Pct2022 = 45.61,
  cand2Pct2022 = 46.62
}: TrajectoryChartProps) {
  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 90, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Escalas: X vai de 0% a 100% de urnas; Y vai de 38% a 52%
  const yMin = 38;
  const yMax = 52;

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Traçado 2022
  const sample2022 = timeline2022.filter((p, i) => i === 0 || i % 6 === 0 || i === timeline2022.length - 1);

  const pathLula2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.lulaPct).toFixed(1)}`)
    .join(' ');

  const pathBolso2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.bolsonaroPct).toFixed(1)}`)
    .join(' ');

  // Traçado contínuo 2026 até o ponto atual
  const steps2026 = 24;
  const points2026Curve: Array<{ x: number; y1: number; y2: number }> = [];
  if (currentPct2026 > 0) {
    for (let i = 1; i <= steps2026; i++) {
      const p = (i / steps2026) * currentPct2026;
      const progress = p / currentPct2026;
      const y1 = 41.5 + (cand1Pct2026 - 41.5) * Math.pow(progress, 0.8);
      const y2 = 49.0 + (cand2Pct2026 - 49.0) * Math.pow(progress, 0.8);
      points2026Curve.push({ x: scaleX(p), y1: scaleY(y1), y2: scaleY(y2) });
    }
  }

  const pathLula2026 = points2026Curve.length > 0
    ? points2026Curve.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y1.toFixed(1)}`).join(' ')
    : '';

  const pathOpo2026 = points2026Curve.length > 0
    ? points2026Curve.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y2.toFixed(1)}`).join(' ')
    : '';

  const currentX = scaleX(currentPct2026);
  const viradaX = scaleX(76.5);
  const y50 = scaleY(50);

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-lg tracking-tight text-[var(--fg)]">
            Curva de Apuração
          </h3>
          <p className="text-xs text-[var(--fg-muted)]">
            Percentual de votos válidos conforme as urnas são totalizadas
          </p>
        </div>

        {/* Legenda Minimalista em Linha */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-[var(--fg-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[2px] bg-[var(--color-pt)]" />
            <span>Lula</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[2px] bg-[var(--color-pl)]" />
            <span>Flávio Bolsonaro</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--fg-subtle)]">
            <span className="w-2.5 h-[1px] border-t border-dashed border-[var(--fg-subtle)]" />
            <span>2022 (referência)</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] overflow-visible"
        >
          {/* Linha de 50% (Maioria absoluta) */}
          <line
            x1={padding.left}
            y1={y50}
            x2={width - padding.right}
            y2={y50}
            stroke="var(--border)"
            strokeDasharray="2 4"
            strokeWidth="1"
          />
          <text
            x={padding.left - 6}
            y={y50 + 3}
            textAnchor="end"
            className="fill-[var(--fg-subtle)] text-[10px] font-mono tabular-nums"
          >
            50%
          </text>

          {/* Marcadores do Eixo X (% de urnas) */}
          {[0, 25, 50, 75, 100].map((val) => {
            const x = scaleX(val);
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={padding.top + plotH}
                  x2={x}
                  y2={padding.top + plotH + 4}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotH + 16}
                  textAnchor="middle"
                  className="fill-[var(--fg-subtle)] text-[10px] font-mono tabular-nums"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Curvas 2022 (Pontilhadas) */}
          {pathLula2022 && (
            <path
              d={pathLula2022}
              fill="none"
              stroke="var(--color-pt)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}
          {pathBolso2022 && (
            <path
              d={pathBolso2022}
              fill="none"
              stroke="var(--color-pl)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}

          {/* Curvas 2026 (Sólidas) */}
          {pathLula2026 && (
            <path
              d={pathLula2026}
              fill="none"
              stroke="var(--color-pt)"
              strokeWidth="2"
            />
          )}
          {pathOpo2026 && (
            <path
              d={pathOpo2026}
              fill="none"
              stroke="var(--color-pl)"
              strokeWidth="2"
            />
          )}

          {/* Marcador vertical da posição atual de 2026 */}
          {currentPct2026 > 0 && (
            <g>
              <line
                x1={currentX}
                y1={padding.top}
                x2={currentX}
                y2={padding.top + plotH}
                stroke="var(--fg-subtle)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Ponto Lula 2026 */}
              <circle
                cx={currentX}
                cy={scaleY(cand1Pct2026)}
                r="3.5"
                fill="var(--color-pt)"
              />
              <text
                x={currentX + 6}
                y={scaleY(cand1Pct2026) + 3}
                className="fill-[var(--color-pt)] text-[10px] font-mono font-medium"
              >
                {cand1Pct2026.toFixed(1)}%
              </text>

              {/* Ponto Oposição 2026 */}
              <circle
                cx={currentX}
                cy={scaleY(cand2Pct2026)}
                r="3.5"
                fill="var(--color-pl)"
              />
              <text
                x={currentX + 6}
                y={scaleY(cand2Pct2026) + 3}
                className="fill-[var(--color-pl)] text-[10px] font-mono font-medium"
              >
                {cand2Pct2026.toFixed(1)}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
