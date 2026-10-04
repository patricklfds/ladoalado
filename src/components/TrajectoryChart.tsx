'use client';

import React from 'react';
import type { TimelinePoint2022, CandidateResult, TimelinePoint2026 } from '@/lib/types';
import { formatCandidateName, getCandidateColor } from '@/lib/candidateUtils';

interface TrajectoryChartProps {
  timeline2022: TimelinePoint2022[];
  timeline2026?: TimelinePoint2026[];
  currentPct2026: number;
  cand1?: CandidateResult;
  cand2?: CandidateResult;
}

function findCandidatePct(cand: CandidateResult | undefined, candsMap: Record<string, number>): number | null {
  if (!cand || !candsMap) return null;
  const candNome = cand.nome.toUpperCase().trim();

  // 1. Busca exata ou por inclusão direta
  for (const [key, val] of Object.entries(candsMap)) {
    const k = key.toUpperCase().trim();
    if (k === candNome || k.includes(candNome) || candNome.includes(k)) {
      return val;
    }
  }

  // 2. Busca por partes do nome (ex: LULA ou FLAVIO)
  const candParts = candNome.split(' ').filter(p => p.length > 3);
  for (const [key, val] of Object.entries(candsMap)) {
    const kParts = key.toUpperCase().trim().split(' ');
    if (candParts.some(p => kParts.includes(p))) {
      return val;
    }
  }

  return null;
}

/**
 * Constrói uma curva spline Catmull-Rom para curvas cúbicas de Bézier no SVG,
 * garantindo passagem matemática exata por todos os pontos com transição suave e contínua.
 */
function smoothSvgPath(points: Array<{ x: number; y: number }>, tension = 0.75): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y };
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : { x: 2 * points[points.length - 1].x - points[points.length - 2].x, y: 2 * points[points.length - 1].y - points[points.length - 2].y };

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export function TrajectoryChart({
  timeline2022,
  timeline2026,
  currentPct2026,
  cand1,
  cand2
}: TrajectoryChartProps) {
  const width = 800;
  const height = 190;
  const padding = { top: 20, right: 110, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Candidatos atuais
  const cand1Pct = cand1?.percentual ?? 47.85;
  const cand2Pct = cand2?.percentual ?? 44.10;

  const cand1Nome = cand1 ? formatCandidateName(cand1.nome) : '1º Colocado';
  const cand2Nome = cand2 ? formatCandidateName(cand2.nome) : '2º Colocado';

  const cand1Cor = cand1 ? getCandidateColor(cand1) : 'var(--color-pt)';
  const cand2Cor = cand2 ? getCandidateColor(cand2) : 'var(--color-pl)';

  // Obter pontos históricos reais de 2026 até o percentual atual apurado
  const validTimeline2026 = (timeline2026 || [])
    .filter(p => p.urnasPct > 0 && p.urnasPct <= (currentPct2026 + 0.1))
    .sort((a, b) => a.urnasPct - b.urnasPct);

  // Garantir que o ponto atual exato esteja incluído
  const hasCurrentPoint = validTimeline2026.some(p => Math.abs(p.urnasPct - currentPct2026) < 0.1);
  const pointsToDraw = [...validTimeline2026];
  if (!hasCurrentPoint && currentPct2026 > 0 && cand1 && cand2) {
    pointsToDraw.push({
      urnasPct: currentPct2026,
      timestamp: '',
      candidatos: {
        [cand1.nome.toUpperCase().trim()]: cand1Pct,
        [cand2.nome.toUpperCase().trim()]: cand2Pct
      }
    });
    pointsToDraw.sort((a, b) => a.urnasPct - b.urnasPct);
  }

  // Considerar estritamente os candidatos da disputa (1º, 2º e marco de 50%)
  const candValues1 = pointsToDraw.map(p => findCandidatePct(cand1, p.candidatos)).filter((v): v is number => v !== null);
  const candValues2 = pointsToDraw.map(p => findCandidatePct(cand2, p.candidatos)).filter((v): v is number => v !== null);

  const relevantValues: number[] = [
    cand1Pct,
    cand2Pct,
    50,
    ...candValues1,
    ...candValues2
  ].filter(v => typeof v === 'number' && !isNaN(v) && v > 0);

  const rawMin = Math.min(...relevantValues);
  const rawMax = Math.max(...relevantValues);

  // Escala focada na zona de disputa presidencial (mantendo 50% e os concorrentes com excelente respiro vertical)
  const yMin = Math.max(0, Math.min(36, Math.floor(rawMin - 3)));
  const yMax = Math.min(100, Math.max(54, Math.ceil(rawMax + 2)));

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Marcadores do Eixo Y (múltiplos de 5 entre yMin e yMax, incluindo 50%)
  const yTicks: number[] = [];
  for (let val = Math.ceil(yMin / 5) * 5; val <= Math.floor(yMax / 5) * 5; val += 5) {
    yTicks.push(val);
  }
  if (!yTicks.includes(50) && 50 >= yMin && 50 <= yMax) {
    yTicks.push(50);
    yTicks.sort((a, b) => a - b);
  }

  // Traçado 2022 (Referência histórica suavizada dos 2 primeiros de 2022)
  const sample2022 = timeline2022.filter((p, i) => i === 0 || i % 4 === 0 || i === timeline2022.length - 1);

  const ptsLula2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map(p => ({ x: scaleX(p.secoesTotalizadasPct), y: scaleY(p.lulaPct) }));

  const ptsBolso2022 = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .map(p => ({ x: scaleX(p.secoesTotalizadasPct), y: scaleY(p.bolsonaroPct) }));

  const pathLula2022 = smoothSvgPath(ptsLula2022, 0.7);
  const pathBolso2022 = smoothSvgPath(ptsBolso2022, 0.7);

  // Mapear pontos reais para coordenadas do SVG
  const pointsCand1: Array<{ x: number; y: number; pct: number }> = [];
  const pointsCand2: Array<{ x: number; y: number; pct: number }> = [];

  for (const pt of pointsToDraw) {
    const p1 = findCandidatePct(cand1, pt.candidatos);
    const p2 = findCandidatePct(cand2, pt.candidatos);

    if (p1 !== null) {
      pointsCand1.push({ x: scaleX(pt.urnasPct), y: scaleY(p1), pct: p1 });
    }
    if (p2 !== null) {
      pointsCand2.push({ x: scaleX(pt.urnasPct), y: scaleY(p2), pct: p2 });
    }
  }

  // Traçar linhas perfeitamente suavizadas conectando os pontos reais da apuração
  const pathCand12026 = smoothSvgPath(pointsCand1, 0.75);
  const pathCand22026 = smoothSvgPath(pointsCand2, 0.75);

  const currentX = scaleX(currentPct2026);

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
          {/* Marcadores e Linhas Guia do Eixo Y */}
          {yTicks.map((val) => {
            const y = scaleY(val);
            const is50 = val === 50;
            return (
              <g key={`ytick-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray={is50 ? "3 3" : "1 4"}
                  strokeWidth={is50 ? "1" : "0.75"}
                  opacity={is50 ? 0.7 : 0.3}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className={`tabular-nums text-[10px] font-mono ${is50 ? 'fill-[var(--fg)] font-medium' : 'fill-[var(--fg-subtle)]'}`}
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

          {/* Marcadores de pontos históricos reais registrados ao longo da apuração */}
          {pointsCand1.length > 1 && pointsCand1.slice(0, -1).map((pt, idx) => (
            <circle
              key={`c1-pt-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="1.5"
              fill={cand1Cor}
              opacity="0.35"
            />
          ))}
          {pointsCand2.length > 1 && pointsCand2.slice(0, -1).map((pt, idx) => (
            <circle
              key={`c2-pt-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="1.5"
              fill={cand2Cor}
              opacity="0.35"
            />
          ))}

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
