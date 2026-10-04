'use client';

import React from 'react';
import type { TimelinePoint2022 } from '@/lib/types';

interface SparklineChartProps {
  timeline2022: TimelinePoint2022[];
  pontosSessao2026: Array<{ tempo: string; pct: number; lulaPct: number; oposicaoPct: number }>;
  currentPct2026: number;
}

export function SparklineChart({
  timeline2022,
  pontosSessao2026,
  currentPct2026
}: SparklineChartProps) {
  // Configuração da ViewBox do SVG
  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Escalas: X vai de 0% a 100% de urnas; Y vai de 35% a 55% de votos válidos
  const yMin = 38;
  const yMax = 52;

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Filtrar pontos de 2022 para traçado limpo a cada ~5% de apuração
  const sample2022 = timeline2022.filter((p, i) => i === 0 || i % 10 === 0 || i === timeline2022.length - 1);

  // Caminho SVG para Lula 2022
  const pathLula2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.lulaPct).toFixed(1)}`)
    .join(' ');

  // Caminho SVG para Bolsonaro 2022
  const pathBolso2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.bolsonaroPct).toFixed(1)}`)
    .join(' ');

  // Posição atual de 2026 no eixo X
  const currentX = scaleX(currentPct2026);

  return (
    <section className="mt-8 border border-[var(--border)] rounded bg-[var(--card)] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Curva de Apuração (% Votos vs % Urnas Totalizadas)
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Trajetória dos dois líderes conforme as seções são abertas pelo TSE
          </p>
        </div>

        {/* Legenda Editorial */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#C5221F]" />
            <span className="text-[var(--foreground)]">Lula/PT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1E3A8A]" />
            <span className="text-[var(--foreground)]">Oposição/PL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <span className="w-3 h-0.5 border-t border-dashed border-[var(--muted)]" />
            <span>2022 (Referência Histórica)</span>
          </div>
        </div>
      </div>

      {/* Gráfico SVG Puro */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] overflow-visible"
        >
          {/* Linhas de Grade Horizontais */}
          {[40, 45, 50].map((val) => {
            const y = scaleY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[var(--muted)] text-[10px] font-mono tabular-nums"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Marcadores do Eixo X (% de urnas) */}
          {[0, 25, 50, 75, 100].map((val) => {
            const x = scaleX(val);
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={padding.top + plotH}
                  x2={x}
                  y2={padding.top + plotH + 5}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotH + 18}
                  textAnchor="middle"
                  className="fill-[var(--muted)] text-[10px] font-mono tabular-nums"
                >
                  {val}% urnas
                </text>
              </g>
            );
          })}

          {/* Curva 2022 (Pontilhada / Referência) */}
          {pathLula2022 && (
            <path
              d={pathLula2022}
              fill="none"
              stroke="#C5221F"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          )}
          {pathBolso2022 && (
            <path
              d={pathBolso2022}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
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
                stroke="var(--foreground)"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <circle
                cx={currentX}
                cy={padding.top}
                r="3"
                className="fill-[var(--foreground)]"
              />
              <text
                x={Math.min(width - padding.right - 40, Math.max(padding.left + 40, currentX))}
                y={padding.top - 6}
                textAnchor="middle"
                className="fill-[var(--foreground)] text-[10px] font-mono font-bold"
              >
                2026: {currentPct2026.toFixed(1)}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
