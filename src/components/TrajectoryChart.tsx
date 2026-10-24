'use client';

import React, { useState, useRef } from 'react';
import type { TimelinePoint2022, CandidateResult, TimelinePoint2026 } from '@/lib/types';
import { formatCandidateName, getCandidateColor } from '@/lib/candidateUtils';
import { interpolateByUrnas } from '@/lib/comparator';

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

function interpolate2026AtUrnas(
  targetPct: number,
  points: TimelinePoint2026[],
  currentPct2026: number,
  cand1?: CandidateResult,
  cand2?: CandidateResult
): { p1: number; p2: number; timestamp?: string } | null {
  if (currentPct2026 <= 0 || targetPct > currentPct2026 + 0.05 || points.length === 0) {
    return null;
  }

  const first = points[0];
  if (targetPct <= first.urnasPct) {
    const p1 = findCandidatePct(cand1, first.candidatos);
    const p2 = findCandidatePct(cand2, first.candidatos);
    if (p1 === null || p2 === null) return null;
    return { p1, p2, timestamp: first.timestamp };
  }

  const last = points[points.length - 1];
  if (targetPct >= last.urnasPct) {
    const p1 = findCandidatePct(cand1, last.candidatos);
    const p2 = findCandidatePct(cand2, last.candidatos);
    if (p1 === null || p2 === null) return null;
    return { p1, p2, timestamp: last.timestamp };
  }

  for (let i = 0; i < points.length - 1; i++) {
    const ptA = points[i];
    const ptB = points[i + 1];
    if (ptA.urnasPct <= targetPct && ptB.urnasPct >= targetPct) {
      const p1A = findCandidatePct(cand1, ptA.candidatos);
      const p2A = findCandidatePct(cand2, ptA.candidatos);
      const p1B = findCandidatePct(cand1, ptB.candidatos);
      const p2B = findCandidatePct(cand2, ptB.candidatos);
      if (p1A === null || p2A === null || p1B === null || p2B === null) return null;

      const span = ptB.urnasPct - ptA.urnasPct;
      const ratio = span <= 0.0001 ? 0 : (targetPct - ptA.urnasPct) / span;
      return {
        p1: Number((p1A + (p1B - p1A) * ratio).toFixed(2)),
        p2: Number((p2A + (p2B - p2A) * ratio).toFixed(2)),
        timestamp: ratio < 0.5 ? ptA.timestamp : ptB.timestamp
      };
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

    const dx = Math.max(0, p2.x - p1.x);
    const rawCp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const rawCp2x = p2.x - ((p3.x - p1.x) / 6) * tension;

    // Clamping estrito de X dentro do segmento [p1.x, p2.x] para impedir laços horizontais em pontos de densidade desigual
    const cp1x = Math.min(p1.x + dx * 0.5, Math.max(p1.x, rawCp1x));
    const cp2x = Math.max(p2.x - dx * 0.5, Math.min(p2.x, rawCp2x));

    const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
    const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
    const cp1y = Math.min(maxY, Math.max(minY, p1.y + ((p2.y - p0.y) / 6) * tension));
    const cp2y = Math.min(maxY, Math.max(minY, p2.y - ((p3.y - p1.y) / 6) * tension));

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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const width = 800;
  const height = 195;
  const padding = { top: 22, right: 116, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Candidatos atuais
  const cand1Pct = cand1?.percentual ?? 50.45;
  const cand2Pct = cand2?.percentual ?? 49.55;
  const hasActive2026Votes = currentPct2026 > 0 && (cand1Pct > 0 || cand2Pct > 0);

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
  if (!hasCurrentPoint && hasActive2026Votes && cand1 && cand2) {
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

  // Traçado 2022 (Referência histórica suavizada do 2º turno de 2022)
  const sample2022 = timeline2022.filter((p, i) => i === 0 || i % 3 === 0 || i === timeline2022.length - 1);

  // Considerar estritamente os candidatos da disputa (2026 + referência 2022 + marco central de 50%)
  const candValues1 = pointsToDraw.map(p => findCandidatePct(cand1, p.candidatos)).filter((v): v is number => v !== null);
  const candValues2 = pointsToDraw.map(p => findCandidatePct(cand2, p.candidatos)).filter((v): v is number => v !== null);
  const ref2022Values = sample2022
    .filter(p => p.secoesTotalizadasPct > 0)
    .flatMap(p => [p.lulaPct, p.bolsonaroPct]);

  const relevantValues: number[] = [
    ...(currentPct2026 > 0 ? [cand1Pct, cand2Pct] : []),
    50,
    ...candValues1,
    ...candValues2,
    ...ref2022Values
  ].filter(v => typeof v === 'number' && !isNaN(v) && v > 0);

  // Escala simétrica em torno de 50% (ponto exato de virada no 2º turno), garantindo que 2022 e 2026 nunca sejam cortados
  const maxDeviation = Math.max(8, ...relevantValues.map(v => Math.abs(v - 50)));
  const halfSpan = Math.min(50, Math.max(10, Math.ceil(maxDeviation + 2)));
  const yMin = 50 - halfSpan;
  const yMax = 50 + halfSpan;

  const scaleX = (urnasPct: number) => padding.left + (Math.max(0, Math.min(100, urnasPct)) / 100) * plotW;
  const scaleY = (votosPct: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, votosPct));
    return padding.top + plotH - ((clamped - yMin) / (yMax - yMin)) * plotH;
  };

  // Marcadores do Eixo Y (múltiplos de 5 entre yMin e yMax, com 50% sempre no centro)
  const yTicks: number[] = [];
  for (let val = Math.ceil(yMin / 5) * 5; val <= Math.floor(yMax / 5) * 5; val += 5) {
    yTicks.push(val);
  }
  if (!yTicks.includes(50) && 50 >= yMin && 50 <= yMax) {
    yTicks.push(50);
    yTicks.sort((a, b) => a - b);
  }

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

  // Anti-colisão vertical dos rótulos na ponta direita quando os candidatos estão próximos (ex: cruzamento em 50%)
  const rawY1 = scaleY(cand1Pct);
  const rawY2 = scaleY(cand2Pct);
  const minLabelGap = 13;
  let labelY1 = rawY1;
  let labelY2 = rawY2;
  if (Math.abs(rawY2 - rawY1) < minLabelGap) {
    const midY = (rawY1 + rawY2) / 2;
    if (rawY1 <= rawY2) {
      labelY1 = midY - minLabelGap / 2;
      labelY2 = midY + minLabelGap / 2;
    } else {
      labelY1 = midY + minLabelGap / 2;
      labelY2 = midY - minLabelGap / 2;
    }
  }

  // Manipuladores do Scrubber Interativo (Mouse + Touch)
  const updateHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0) return;
    const svgX = ((clientX - rect.left) / rect.width) * width;
    const rawPct = ((svgX - padding.left) / plotW) * 100;
    if (rawPct < -2 || rawPct > 102) {
      setHoverPct(null);
      return;
    }
    const clamped = Math.max(0, Math.min(100, Number(rawPct.toFixed(2))));
    // Atração magnética sutil ao marco da virada de 2022 (67.76%) e à posição atual de 2026
    if (Math.abs(clamped - 67.76) < 0.65) {
      setHoverPct(67.76);
    } else if (currentPct2026 > 0 && Math.abs(clamped - currentPct2026) < 0.65) {
      setHoverPct(currentPct2026);
    } else {
      setHoverPct(clamped);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverFromClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      updateHoverFromClientX(e.touches[0].clientX);
    }
  };

  // Dados interpolados para o ponto inspecionado pelo Scrubber
  const hover2022 = hoverPct !== null && timeline2022.length > 0 ? interpolateByUrnas(timeline2022, hoverPct) : null;
  const hover2026 = hoverPct !== null ? interpolate2026AtUrnas(hoverPct, pointsToDraw, currentPct2026, cand1, cand2) : null;
  const hoverX = hoverPct !== null ? scaleX(hoverPct) : null;
  const virada2022X = scaleX(67.76);
  const y50 = scaleY(50);

  return (
    <section className="py-8 sm:py-11 border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg sm:text-xl tracking-[-0.025em] text-[var(--fg)]">
            Curva de Apuração
          </h3>
          <div className="min-h-[2.25rem] sm:min-h-[1.35rem] flex items-center mt-0.5">
            {hoverPct !== null && hover2022 ? (
              <p className="text-xs font-mono text-[var(--fg-muted)] tabular-nums leading-snug">
                <strong className="text-[var(--fg)] font-semibold">{hoverPct.toFixed(2)}% das urnas</strong>
                {' · '}
                {hover2026 ? (
                  <>
                    <span>2026: {cand1Nome.split(' ')[0]} <strong className="text-[var(--fg)] font-medium">{hover2026.p1.toFixed(2)}%</strong> vs {cand2Nome.split(' ')[0]} <strong className="text-[var(--fg)] font-medium">{hover2026.p2.toFixed(2)}%</strong></span>
                    {' · '}
                  </>
                ) : null}
                <span>2022 ({hover2022.timestamp}): Lula {hover2022.lulaPct.toFixed(2)}% vs Bolsonaro {hover2022.bolsonaroPct.toFixed(2)}%</span>
                <button
                  type="button"
                  onClick={() => setHoverPct(null)}
                  className="ml-2 sm:hidden text-[11px] underline text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
                >
                  limpar
                </button>
              </p>
            ) : (
              <p className="text-xs text-[var(--fg-muted)]">
                Evolução dos votos válidos de 0% a 100% das seções totalizadas
              </p>
            )}
          </div>
        </div>

        {/* Legenda Dinâmica em Linha */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[var(--fg-muted)] shrink-0">
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

      <div className="w-full">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Gráfico de curva de apuração comparada: ${cand1Nome} (${cand1Pct.toFixed(1)}%) e ${cand2Nome} (${cand2Pct.toFixed(1)}%) com referência histórica de 2022`}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPct(null)}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          className="w-full h-auto overflow-visible select-none cursor-crosshair touch-pan-y"
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
                  stroke={is50 ? "var(--fg-subtle)" : "var(--border)"}
                  strokeDasharray={is50 ? "3 3" : "1 4"}
                  strokeWidth={is50 ? "1" : "0.75"}
                  opacity={is50 ? 0.55 : 0.45}
                />
                <text
                  x={padding.left - 7}
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
              strokeWidth="1.25"
              strokeDasharray="2.5 2.5"
              opacity={hoverPct !== null ? 0.55 : hasActive2026Votes ? 0.35 : 0.65}
            />
          )}
          {pathBolso2022 && (
            <path
              d={pathBolso2022}
              fill="none"
              stroke="var(--color-pl)"
              strokeWidth="1.25"
              strokeDasharray="2.5 2.5"
              opacity={hoverPct !== null ? 0.55 : hasActive2026Votes ? 0.35 : 0.65}
            />
          )}

          {/* Rótulos finais de 2022 quando a apuração de 2026 ainda está em 0% */}
          {!hasActive2026Votes && ptsLula2022.length > 0 && ptsBolso2022.length > 0 && (
            <g opacity={hoverPct !== null ? 0.35 : 0.75}>
              <circle
                cx={scaleX(100)}
                cy={scaleY(50.9)}
                r="2.5"
                fill="var(--bg)"
                stroke="var(--color-pt)"
                strokeWidth="1.25"
              />
              <text
                x={scaleX(100) + 6}
                y={scaleY(50.9) - 2}
                fill="var(--color-pt)"
                className="text-[9.5px] font-mono tabular-nums"
              >
                50,9% Lula (22)
              </text>
              <circle
                cx={scaleX(100)}
                cy={scaleY(49.1)}
                r="2.5"
                fill="var(--bg)"
                stroke="var(--color-pl)"
                strokeWidth="1.25"
              />
              <text
                x={scaleX(100) + 6}
                y={scaleY(49.1) + 8}
                fill="var(--color-pl)"
                className="text-[9.5px] font-mono tabular-nums"
              >
                49,1% Bolso. (22)
              </text>
            </g>
          )}

          {/* Marco discreto da Virada Histórica de 2022 (67,76% · 50,0%) sem linha vertical duplicada */}
          {timeline2022.length > 0 && (
            <g>
              <circle
                cx={virada2022X}
                cy={y50}
                r={hoverPct !== null && Math.abs(hoverPct - 67.76) < 0.2 ? "3.5" : "2.4"}
                fill="var(--bg)"
                stroke="var(--fg-subtle)"
                strokeWidth="1.2"
                opacity={hoverPct !== null && Math.abs(hoverPct - 67.76) < 0.2 ? 1 : 0.75}
              />
              {hoverPct === null && (
                <>
                  <line
                    x1={virada2022X}
                    y1={padding.top - 3}
                    x2={virada2022X}
                    y2={padding.top + 3}
                    stroke="var(--fg-subtle)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <text
                    x={virada2022X}
                    y={padding.top - 7}
                    textAnchor="middle"
                    className="fill-[var(--fg-subtle)] text-[9.5px] font-mono tabular-nums"
                  >
                    virada 22 (67,8%)
                  </text>
                </>
              )}
            </g>
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
          {hasActive2026Votes && (
            <g opacity={hoverPct !== null ? 0.45 : 1}>
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
                cy={rawY1}
                r="3.5"
                fill={cand1Cor}
              />
              <text
                x={currentX + 6}
                y={labelY1 + 3}
                fill={cand1Cor}
                className="text-[10px] font-mono font-medium"
              >
                {cand1Pct.toFixed(1)}% {cand1Nome.split(' ')[0]}
              </text>

              {/* Ponto Candidato 2 2026 */}
              <circle
                cx={currentX}
                cy={rawY2}
                r="3.5"
                fill={cand2Cor}
              />
              <text
                x={currentX + 6}
                y={labelY2 + 3}
                fill={cand2Cor}
                className="text-[10px] font-mono font-medium"
              >
                {cand2Pct.toFixed(1)}% {cand2Nome.split(' ')[0]}
              </text>
            </g>
          )}

          {/* Cursor Scrubber Interativo (Hover / Touch) */}
          {hoverX !== null && hoverPct !== null && hover2022 && (
            <g className="pointer-events-none">
              <line
                x1={hoverX}
                y1={padding.top}
                x2={hoverX}
                y2={padding.top + plotH}
                stroke="var(--fg)"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Rótulo de % de urnas no topo do cursor */}
              <text
                x={Math.min(width - padding.right - 25, Math.max(padding.left + 25, hoverX))}
                y={padding.top - 7}
                textAnchor="middle"
                className="fill-[var(--fg)] text-[10px] font-mono font-medium tabular-nums"
              >
                {hoverPct.toFixed(1)}% · {hover2022.timestamp}
              </text>

              {/* Pontos 2022 na posição inspecionada */}
              {hoverPct > 0 && (
                <>
                  <circle
                    cx={hoverX}
                    cy={scaleY(hover2022.lulaPct)}
                    r="2.8"
                    fill="var(--bg)"
                    stroke="var(--color-pt)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={hoverX}
                    cy={scaleY(hover2022.bolsonaroPct)}
                    r="2.8"
                    fill="var(--bg)"
                    stroke="var(--color-pl)"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Pontos 2026 na posição inspecionada (se já apurado) */}
              {hover2026 && (
                <>
                  <circle
                    cx={hoverX}
                    cy={scaleY(hover2026.p1)}
                    r="4"
                    fill={cand1Cor}
                  />
                  <circle
                    cx={hoverX}
                    cy={scaleY(hover2026.p2)}
                    r="4"
                    fill={cand2Cor}
                  />
                </>
              )}
            </g>
          )}

          {/* Área de captura transparente cobrindo todo o plot para interação suave */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotW}
            height={plotH}
            fill="transparent"
          />
        </svg>
      </div>
    </section>
  );
}
