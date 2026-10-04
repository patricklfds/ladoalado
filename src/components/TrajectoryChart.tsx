'use client';

import React from 'react';
import type { TimelinePoint2022, CandidateResult } from '@/lib/types';
import { formatCandidateName, getCandidateColor } from '@/lib/candidateUtils';

interface TrajectoryChartProps {
  timeline2022: TimelinePoint2022[];
  currentPct2026: number;
  cand1?: CandidateResult;
  cand2?: CandidateResult;
}

export function TrajectoryChart({
  timeline2022,
  currentPct2026,
  cand1,
  cand2
}: TrajectoryChartProps) {
  const width = 800;
  const height = 180;
  const padding = { top: 20, right: 110, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Escalas: X vai de 0% a 100% de urnas; Y vai de 35% a 55%
  const cand1Pct = cand1?.percentual ?? 47.85;
  const cand2Pct = cand2?.percentual ?? 44.10;

  const cand1Nome = cand1 ? formatCandidateName(cand1.nome) : '1º Colocado';
  const cand2Nome = cand2 ? formatCandidateName(cand2.nome) : '2º Colocado';

  const cand1Cor = cand1 ? getCandidateColor(cand1) : 'var(--color-pt)';
  const cand2Cor = cand2 ? getCandidateColor(cand2) : 'var(--color-pl)';

  // Definir mínimo e máximo de Y dinamicamente para acomodar qualquer candidato
  const minVal = Math.min(cand1Pct, cand2Pct, 38);
  const maxVal = Math.max(cand1Pct, cand2Pct, 52);
  const yMin = Math.max(0, Math.floor(minVal - 2));
  const yMax = Math.min(100, Math.ceil(maxVal + 2));

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Traçado 2022 (Referência histórica dos 2 primeiros de 2022)
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
    const startY1 = Math.max(yMin, cand1Pct - 5);
    const startY2 = Math.min(yMax, cand2Pct + 4);
    for (let i = 1; i <= steps2026; i++) {
      const p = (i / steps2026) * currentPct2026;
      const progress = p / currentPct2026;
      const y1 = startY1 + (cand1Pct - startY1) * Math.pow(progress, 0.8);
      const y2 = startY2 + (cand2Pct - startY2) * Math.pow(progress, 0.8);
      points2026Curve.push({ x: scaleX(p), y1: scaleY(y1), y2: scaleY(y2) });
    }
  }

  const pathCand12026 = points2026Curve.length > 0
    ? points2026Curve.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y1.toFixed(1)}`).join(' ')
    : '';

  const pathCand22026 = points2026Curve.length > 0
    ? points2026Curve.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y2.toFixed(1)}`).join(' ')
    : '';

  const currentX = scaleX(currentPct2026);
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

        {/* Legenda Dinâmica em Linha */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[var(--fg-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[2px] rounded-full" style={{ backgroundColor: cand1Cor }} />
            <span className="text-[var(--fg)]">{cand1Nome}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-[2px] rounded-full" style={{ backgroundColor: cand2Cor }} />
            <span className="text-[var(--fg)]">{cand2Nome}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--fg-subtle)]">
            <span className="w-2.5 h-[1px] border-t border-dashed border-[var(--fg-subtle)]" />
            <span>2022 (referência)</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          role="img"
          aria-label={`Gráfico de curva de apuração comparada: ${cand1Nome} (${cand1Pct.toFixed(1)}%) e ${cand2Nome} (${cand2Pct.toFixed(1)}%) com referência histórica de 2022`}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[550px] overflow-visible"
        >
          {/* Linha de 50% (Maioria absoluta) se estiver dentro da faixa */}
          {50 >= yMin && 50 <= yMax && (
            <>
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
            </>
          )}

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

          {/* Curvas 2022 (Pontilhadas de referência histórica) */}
          {pathLula2022 && (
            <path
              d={pathLula2022}
              fill="none"
              stroke="var(--color-pt)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.35"
            />
          )}
          {pathBolso2022 && (
            <path
              d={pathBolso2022}
              fill="none"
              stroke="var(--color-pl)"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.35"
            />
          )}

          {/* Curvas 2026 (Sólidas com cores dinâmicas dos candidatos 1º e 2º) */}
          {pathCand12026 && (
            <path
              d={pathCand12026}
              fill="none"
              stroke={cand1Cor}
              strokeWidth="2"
            />
          )}
          {pathCand22026 && (
            <path
              d={pathCand22026}
              fill="none"
              stroke={cand2Cor}
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

              {/* Ponto Candidato 1 2026 */}
              <circle
                cx={currentX}
                cy={scaleY(cand1Pct)}
                r="3.5"
                fill={cand1Cor}
              />
              <text
                x={currentX + 6}
                y={scaleY(cand1Pct) + 3}
                fill={cand1Cor}
                className="text-[10px] font-mono font-medium"
              >
                {cand1Pct.toFixed(1)}% {cand1Nome.split(' ')[0]}
              </text>

              {/* Ponto Candidato 2 2026 */}
              <circle
                cx={currentX}
                cy={scaleY(cand2Pct)}
                r="3.5"
                fill={cand2Cor}
              />
              <text
                x={currentX + 6}
                y={scaleY(cand2Pct) + 3}
                fill={cand2Cor}
                className="text-[10px] font-mono font-medium"
              >
                {cand2Pct.toFixed(1)}% {cand2Nome.split(' ')[0]}
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
