'use client';

import React from 'react';
import type { ElectionState, ComparisonMode } from '@/lib/types';
import { formatCandidateName, getCandidateColor, getHistoricalReference } from '@/lib/candidateUtils';

interface ComparisonArenaProps {
  estado2026: ElectionState | null;
  estado2022: ElectionState | null;
  modo: ComparisonMode;
  deltaLider: number;
  deltaSegundo: number;
  deltaLula: number;
  deltaOposicao: number;
  margem2026: number;
  margem2022: number;
}

export function ComparisonArena({
  estado2026,
  estado2022,
  modo,
  margem2026,
  margem2022
}: ComparisonArenaProps) {
  // Ordenação garantidamente dinâmica com desempate determinístico em 0%
  const cands2026 = [...(estado2026?.candidatos || [])].sort(
    (a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao)
  );
  const cands2022 = [...(estado2022?.candidatos || [])].sort(
    (a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao)
  );

  const pct2026 = estado2026?.secoesTotalizadasPct ?? 0;
  const pct2022 = estado2022?.secoesTotalizadasPct ?? 0;
  const hasVotes2026 = (estado2026?.totalVotosValidos ?? 0) > 0 && pct2026 > 0;
  const hasVotes2022 = (estado2022?.totalVotosValidos ?? 0) > 0 && pct2022 > 0;

  const lider2026 = cands2026[0];
  const segundo2026 = cands2026[1];
  const lider2022 = cands2022[0];
  const segundo2022 = cands2022[1];

  const votosDiff2026 = lider2026 && segundo2026 ? Math.max(0, lider2026.votos - segundo2026.votos) : 0;

  const refLider2026 = getHistoricalReference(lider2026, cands2022);
  const refSegundo2026 = getHistoricalReference(segundo2026, cands2022);
  const polymarket = estado2026?.polymarket;

  return (
    <section className="py-8 sm:py-11 border-b border-[var(--border)]">
      {/* Grid Principal Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12">
        {/* ================= COLUNA 2026 (HOJE) ================= */}
        <div>
          <div className="flex items-baseline justify-between gap-2 pb-3.5 mb-7 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-semibold text-xl sm:text-2xl tracking-[-0.03em] text-[var(--fg)]">
                2026
              </h2>
              <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-[var(--fg-muted)]">
                {estado2026?.status === 'finalizada' ? 'resultado final' : 'ao vivo'}
              </span>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">
              {hasVotes2026 && lider2026 ? (
                margem2026 > 0 ? (
                  <span>
                    <span className="font-semibold text-[var(--fg)]">{formatCandidateName(lider2026.nome)}</span>{' '}
                    <span className="text-[var(--fg-muted)]">lidera</span>{' '}
                    <span className="font-semibold text-[var(--fg)]">+{margem2026.toFixed(2)}%</span>
                  </span>
                ) : votosDiff2026 > 0 ? (
                  <span>
                    <span className="font-semibold text-[var(--fg)]">{formatCandidateName(lider2026.nome)}</span>{' '}
                    <span className="text-[var(--fg-muted)]">+{votosDiff2026.toLocaleString('pt-BR')} votos</span>
                  </span>
                ) : (
                  <span className="text-[var(--fg-muted)]">Empate exato (50,00%)</span>
                )
              ) : (
                <span className="text-xs font-mono tabular-nums text-[var(--fg-muted)]">
                  {pct2026.toFixed(2)}% apurado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-9">
            {/* 1º Lugar 2026 (Dinâmico) */}
            {lider2026 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: getCandidateColor(lider2026) }}
                      />
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[var(--fg)] truncate">
                      {formatCandidateName(lider2026.nome)}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-3xl sm:text-[2.6rem] font-light tracking-[-0.04em] leading-none text-[var(--fg)]">
                      {lider2026.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs font-mono tabular-nums text-[var(--fg-muted)]">
                  <span className="whitespace-nowrap">{lider2026.votos.toLocaleString('pt-BR')} votos</span>
                  {refLider2026 && (
                    hasVotes2026 && hasVotes2022 ? (
                      <span
                        className={`whitespace-nowrap ${
                          refLider2026.delta >= 0
                            ? 'text-[var(--color-positive)] font-medium'
                            : 'text-[var(--color-negative)] font-medium'
                        }`}
                      >
                        {refLider2026.delta >= 0 ? `+${refLider2026.delta.toFixed(2)}%` : `${refLider2026.delta.toFixed(2)}%`} {refLider2026.label} ({refLider2026.percentual.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-[var(--fg-subtle)]">
                        {hasVotes2022 ? `ref. 2022: ${refLider2026.percentual.toFixed(2)}%` : 'aguardando 1ª urna'}
                      </span>
                    )
                  )}
                </div>

                {/* Linha fina 2px com marcação central de maioria (50%) */}
                <div className="mt-3 relative w-full h-[2px] bg-[var(--track)] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, lider2026.percentual))}%`,
                      backgroundColor: getCandidateColor(lider2026)
                    }}
                  />
                  <span
                    aria-hidden="true"
                    title="Marca de 50% dos votos válidos"
                    className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2026 (Dinâmico) */}
            {segundo2026 && (
              <div className="group pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: getCandidateColor(segundo2026) }}
                      />
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[var(--fg)] truncate">
                      {formatCandidateName(segundo2026.nome)}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-3xl sm:text-[2.6rem] font-light tracking-[-0.04em] leading-none text-[var(--fg)]">
                      {segundo2026.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs font-mono tabular-nums text-[var(--fg-muted)]">
                  <span className="whitespace-nowrap">{segundo2026.votos.toLocaleString('pt-BR')} votos</span>
                  {refSegundo2026 && (
                    hasVotes2026 && hasVotes2022 ? (
                      <span
                        className={`whitespace-nowrap ${
                          refSegundo2026.delta >= 0
                            ? 'text-[var(--color-positive)] font-medium'
                            : 'text-[var(--color-negative)] font-medium'
                        }`}
                      >
                        {refSegundo2026.delta >= 0 ? `+${refSegundo2026.delta.toFixed(2)}%` : `${refSegundo2026.delta.toFixed(2)}%`} {refSegundo2026.label} ({refSegundo2026.percentual.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-[var(--fg-subtle)]">
                        {hasVotes2022 ? `ref. 2022: ${refSegundo2026.percentual.toFixed(2)}%` : 'aguardando 1ª urna'}
                      </span>
                    )
                  )}
                </div>

                {/* Linha fina 2px com marcação central de maioria (50%) */}
                <div className="mt-3 relative w-full h-[2px] bg-[var(--track)] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, segundo2026.percentual))}%`,
                      backgroundColor: getCandidateColor(segundo2026)
                    }}
                  />
                  <span
                    aria-hidden="true"
                    title="Marca de 50% dos votos válidos"
                    className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUNA 2022 (HISTÓRICO) ================= */}
        <div className="border-t border-[var(--border)] pt-8 md:border-t-0 md:pt-0 md:border-l md:pl-12">
          <div className="flex items-baseline justify-between gap-2 pb-3.5 mb-7 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-semibold text-xl sm:text-2xl tracking-[-0.03em] text-[var(--fg-muted)]">
                2022
              </h2>
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                {modo === 'urnas' ? `atingido às ${estado2022?.timestamp}` : `às ${estado2022?.timestamp}`}
              </span>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">
              {hasVotes2022 && lider2022 ? (
                margem2022 > 0 ? (
                  <span className="text-[var(--fg-muted)]">
                    <span className="font-medium text-[var(--fg-muted)]">{formatCandidateName(lider2022.nome)}</span>{' '}
                    <span className="text-[var(--fg-subtle)]">liderava</span>{' '}
                    <span className="font-medium text-[var(--fg-muted)]">+{margem2022.toFixed(2)}%</span>
                  </span>
                ) : (
                  <span className="text-[var(--fg-subtle)]">Virada histórica (50,00%)</span>
                )
              ) : (
                <span className="text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
                  {pct2022.toFixed(2)}% apurado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-9">
            {/* 1º Lugar 2022 (Dinâmico - reflete a virada histórica) */}
            {lider2022 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 opacity-65"
                        style={{ backgroundColor: getCandidateColor(lider2022) }}
                      />
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[var(--fg-muted)] truncate">
                      {formatCandidateName(lider2022.nome)}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-3xl sm:text-[2.6rem] font-light tracking-[-0.04em] leading-none text-[var(--fg-muted)]">
                      {lider2022.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
                  <span className="whitespace-nowrap">{lider2022.votos.toLocaleString('pt-BR')} votos</span>
                  <span className="whitespace-nowrap">{pct2022 > 0 ? 'Liderava neste ponto' : 'Aguardando início da apuração'}</span>
                </div>

                <div className="mt-3 relative w-full h-[2px] bg-[var(--track)] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out opacity-65"
                    style={{
                      width: `${Math.min(100, Math.max(0, lider2022.percentual))}%`,
                      backgroundColor: getCandidateColor(lider2022)
                    }}
                  />
                  <span
                    aria-hidden="true"
                    title="Marca de 50% dos votos válidos"
                    className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2022 (Dinâmico) */}
            {segundo2022 && (
              <div className="group pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 opacity-65"
                        style={{ backgroundColor: getCandidateColor(segundo2022) }}
                      />
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[var(--fg-muted)] truncate">
                      {formatCandidateName(segundo2022.nome)}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-3xl sm:text-[2.6rem] font-light tracking-[-0.04em] leading-none text-[var(--fg-muted)]">
                      {segundo2022.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] sm:text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
                  <span className="whitespace-nowrap">{segundo2022.votos.toLocaleString('pt-BR')} votos</span>
                  <span className="whitespace-nowrap">{pct2022 > 0 ? 'Segundo colocado' : 'Aguardando início da apuração'}</span>
                </div>

                <div className="mt-3 relative w-full h-[2px] bg-[var(--track)] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out opacity-65"
                    style={{
                      width: `${Math.min(100, Math.max(0, segundo2022.percentual))}%`,
                      backgroundColor: getCandidateColor(segundo2022)
                    }}
                  />
                  <span
                    aria-hidden="true"
                    title="Marca de 50% dos votos válidos"
                    className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Síntese Editorial de Vantagem & Comparecimento (exibida assim que houver votos ou estatísticas do TSE) */}
      {hasVotes2026 && lider2026 && segundo2026 && (
        <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] font-mono tabular-nums text-[var(--fg-subtle)]">
          <div>
            <span>Diferença nominal: </span>
            <strong className="text-[var(--fg)] font-medium">
              {votosDiff2026.toLocaleString('pt-BR')} votos
            </strong>
            <span> para {formatCandidateName(lider2026.nome)}</span>
          </div>
          {(estado2026?.votosBrancos !== undefined || estado2026?.votosNulos !== undefined || estado2026?.abstencaoPct !== undefined) && (
            <div className="flex flex-wrap items-center gap-3">
              {estado2026?.votosBrancosPct !== undefined && (
                <span>Brancos {estado2026.votosBrancosPct.toFixed(2)}%</span>
              )}
              {estado2026?.votosNulosPct !== undefined && (
                <>
                  <span>·</span>
                  <span>Nulos {estado2026.votosNulosPct.toFixed(2)}%</span>
                </>
              )}
              {estado2026?.abstencaoPct !== undefined && (
                <>
                  <span>·</span>
                  <span>Abstenção {estado2026.abstencaoPct.toFixed(2)}%</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seção Editorial Integrada: Probabilidades no Polymarket (mesma linguagem tipográfica e barras de 2px) */}
      {polymarket && (
        <div className="mt-10 pt-7 border-t border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <a
                href={polymarket.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--fg)] hover:text-[var(--fg-muted)] font-semibold transition-colors underline decoration-[var(--border)] underline-offset-4"
              >
                Polymarket ↗
              </a>
            </div>
            <p className="text-xs font-mono text-[var(--fg-subtle)]">
              Probabilidade implícita de vitória em tempo real
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-12 md:w-1/2">
            {(polymarket.bolsonaroPct >= polymarket.lulaPct
              ? [
                  {
                    nome: 'Flávio Bolsonaro',
                    partido: 'PL',
                    pct: polymarket.bolsonaroPct,
                    deltaPct: polymarket.bolsonaroDeltaPct ?? 0,
                    cor: 'var(--color-pl)',
                    isLead: true
                  },
                  {
                    nome: 'Lula',
                    partido: 'PT',
                    pct: polymarket.lulaPct,
                    deltaPct: polymarket.lulaDeltaPct ?? 0,
                    cor: 'var(--color-pt)',
                    isLead: false
                  }
                ]
              : [
                  {
                    nome: 'Lula',
                    partido: 'PT',
                    pct: polymarket.lulaPct,
                    deltaPct: polymarket.lulaDeltaPct ?? 0,
                    cor: 'var(--color-pt)',
                    isLead: true
                  },
                  {
                    nome: 'Flávio Bolsonaro',
                    partido: 'PL',
                    pct: polymarket.bolsonaroPct,
                    deltaPct: polymarket.bolsonaroDeltaPct ?? 0,
                    cor: 'var(--color-pl)',
                    isLead: false
                  }
                ]
            ).map(item => {
              const windowLabel = polymarket.deltaWindow || '1m';
              const isPos = item.deltaPct > 0.04;
              const isNeg = item.deltaPct < -0.04;
              const formattedDelta = `${isPos ? '+' : ''}${item.deltaPct.toFixed(1)}%`;

              return (
                <div key={item.partido}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-xs sm:text-sm font-medium tracking-[-0.01em] truncate ${item.isLead ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                      {item.nome}
                    </span>
                    <span className={`font-mono tabular-nums text-xl sm:text-2xl font-light tracking-[-0.03em] leading-none ${item.isLead ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2.5 w-full h-[2px] bg-[var(--track)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, item.pct))}%`,
                        backgroundColor: item.cor
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono tabular-nums">
                    <span className="text-[var(--fg-subtle)]">
                      Variação ({windowLabel})
                    </span>
                    <span
                      className={`font-medium ${
                        isPos
                          ? 'text-[var(--color-positive)]'
                          : isNeg
                            ? 'text-[var(--color-negative)]'
                            : 'text-[var(--fg-subtle)]'
                      }`}
                    >
                      {formattedDelta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
