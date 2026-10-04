'use client';

import React from 'react';
import type { TimelinePoint2022 } from '@/lib/types';

interface SparklineChartProps {
  timeline2022: TimelinePoint2022[];
  pontosSessao2026: Array<{ tempo: string; pct: number; lulaPct: number; oposicaoPct: number }>;
  currentPct2026: number;
  cand1Pct2026?: number;
  cand2Pct2026?: number;
  cand1Pct2022?: number;
  cand2Pct2022?: number;
}

export function SparklineChart({
  timeline2022,
  pontosSessao2026,
  currentPct2026,
  cand1Pct2026 = 47.85,
  cand2Pct2026 = 44.10,
  cand1Pct2022 = 45.61,
  cand2Pct2022 = 46.62
}: SparklineChartProps) {
  const width = 800;
  const height = 200;
  const padding = { top: 25, right: 35, bottom: 35, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Escalas: X vai de 0% a 100% de urnas; Y vai de 38% a 52% de votos válidos
  const yMin = 38;
  const yMax = 52;

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Filtrar pontos de 2022 para traçado limpo a cada ~5% de apuração
  const sample2022 = timeline2022.filter((p, i) => i === 0 || i % 8 === 0 || i === timeline2022.length - 1);

  // Caminhos SVG para 2022 (Referência Histórica)
  const pathLula2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.lulaPct).toFixed(1)}`)
    .join(' ');

  const pathBolso2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.secoesTotalizadasPct).toFixed(1)} ${scaleY(p.bolsonaroPct).toFixed(1)}`)
    .join(' ');

  // Trajetória de 2026: gerar curva contínua até o ponto atual
  const steps2026 = 20;
  const points2026Curve: Array<{ x: number; y1: number; y2: number }> = [];
  if (currentPct2026 > 0) {
    for (let i = 1; i <= steps2026; i++) {
      const p = (i / steps2026) * currentPct2026;
      // Curva suave simulada até os valores atuais
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
  const viradaX = scaleX(76.5); // Ponto de virada em 2022

  return (
    <section className="mt-8 border border-[var(--border)] rounded bg-[var(--card)] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Curva de Apuração (% Votos vs % Urnas Totalizadas)
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Trajetória dos dois líderes conforme as seções são abertas pelo TSE
          </p>
        </div>

        {/* Legenda Editorial Aprimorada */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#C5221F]" />
            <span className="text-[var(--foreground)] font-semibold">Lula (2026)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#1E3A8A]" />
            <span className="text-[var(--foreground)] font-semibold">Oposição (2026)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <span className="w-3.5 h-0.5 border-t border-dashed border-[var(--muted)] opacity-70" />
            <span>2022 (Referência Histórica)</span>
          </div>
        </div>
      </div>

      {/* Gráfico SVG Puro */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] overflow-visible"
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

          {/* Marcador da Virada Histórica de 2022 (~76.5% das urnas) */}
          <g opacity="0.45">
            <line
              x1={viradaX}
              y1={padding.top + 10}
              x2={viradaX}
              y2={padding.top + plotH}
              stroke="var(--muted)"
              strokeDasharray="1 3"
              strokeWidth="1"
            />
            <text
              x={viradaX}
              y={padding.top + 5}
              textAnchor="middle"
              className="fill-[var(--muted)] text-[9px] font-mono uppercase tracking-wider"
            >
              Virada 2022 (76%)
            </text>
          </g>

          {/* Curvas de 2022 (Dashed) */}
          {pathLula2022 && (
            <path
              d={pathLula2022}
              fill="none"
              stroke="#C5221F"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}
          {pathBolso2022 && (
            <path
              d={pathBolso2022}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}

          {/* Curvas Sólidas de 2026 (Até o ponto atual) */}
          {pathLula2026 && (
            <path
              d={pathLula2026}
              fill="none"
              stroke="#C5221F"
              strokeWidth="2.5"
            />
          )}
          {pathOpo2026 && (
            <path
              d={pathOpo2026}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="2.5"
            />
          )}

          {/* Marcador Vertical da Posição Atual de 2026 com Pontos Exatos */}
          {currentPct2026 > 0 && (
            <g>
              <line
                x1={currentX}
                y1={padding.top}
                x2={currentX}
                y2={padding.top + plotH}
                stroke="var(--foreground)"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Ponto 2026 Lula */}
              <circle
                cx={currentX}
                cy={scaleY(cand1Pct2026)}
                r="4"
                fill="#C5221F"
                stroke="var(--card)"
                strokeWidth="1.5"
              />

              {/* Ponto 2026 Oposição */}
              <circle
                cx={currentX}
                cy={scaleY(cand2Pct2026)}
                r="4"
                fill="#1E3A8A"
                stroke="var(--card)"
                strokeWidth="1.5"
              />

              {/* Pontos de Referência de 2022 no mesmo X (círculos vazados) */}
              <circle
                cx={currentX}
                cy={scaleY(cand1Pct2022)}
                r="3.5"
                fill="none"
                stroke="#C5221F"
                strokeWidth="1.5"
                strokeDasharray="1 1"
              />
              <circle
                cx={currentX}
                cy={scaleY(cand2Pct2022)}
                r="3.5"
                fill="none"
                stroke="#1E3A8A"
                strokeWidth="1.5"
                strokeDasharray="1 1"
              />

              {/* Label do marcador */}
              <text
                x={Math.min(width - padding.right - 45, Math.max(padding.left + 45, currentX))}
                y={padding.top - 8}
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
