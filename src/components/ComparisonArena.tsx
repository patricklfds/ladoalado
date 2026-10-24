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

  const lider2026 = cands2026[0];
  const segundo2026 = cands2026[1];
  const lider2022 = cands2022[0];
  const segundo2022 = cands2022[1];

  const refLider2026 = getHistoricalReference(lider2026, cands2022);
  const refSegundo2026 = getHistoricalReference(segundo2026, cands2022);
  const polymarket = estado2026?.polymarket;

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      {/* Grid Principal Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* ================= COLUNA 2026 (HOJE) ================= */}
        <div>
          <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-semibold text-xl tracking-tight text-[var(--fg)]">
                2026
              </h2>
              <span className="text-xs font-mono text-[var(--fg-muted)]">
                ao vivo
              </span>
            </div>
            <div className="text-right font-mono text-xs">
              {lider2026 && margem2026 > 0 ? (
                <span>
                  <span className="font-semibold text-[var(--fg)]">{formatCandidateName(lider2026.nome)}</span>{' '}
                  <span className="text-[var(--fg-muted)]">lidera</span>{' '}
                  <span className="font-semibold tabular-nums text-[var(--fg)]">+{margem2026.toFixed(2)}%</span>
                </span>
              ) : (
                <span className="text-xs font-mono tabular-nums text-[var(--fg-muted)]">
                  {estado2026?.secoesTotalizadasPct.toFixed(2)}% apurado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-7">
            {/* 1º Lugar 2026 (Dinâmico) */}
            {lider2026 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg)]">
                      {formatCandidateName(lider2026.nome)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)]">
                      {lider2026.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-[var(--fg-muted)]">
                  <span>{lider2026.votos.toLocaleString('pt-BR')} votos</span>
                  {refLider2026 && (
                    <span
                      className={
                        pct2026 === 0 && refLider2026.delta === 0
                          ? 'text-[var(--fg-subtle)]'
                          : refLider2026.delta >= 0
                          ? 'text-[var(--color-positive)] font-medium'
                          : 'text-[var(--color-negative)] font-medium'
                      }
                    >
                      {refLider2026.delta >= 0 ? `+${refLider2026.delta.toFixed(2)}%` : `${refLider2026.delta.toFixed(2)}%`} {refLider2026.label} ({refLider2026.percentual.toFixed(2)}%)
                    </span>
                  )}
                </div>

                {/* Linha fina com track sutil visível e cor dinâmica do candidato */}
                <div className="mt-3 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, lider2026.percentual))}%`,
                      backgroundColor: getCandidateColor(lider2026)
                    }}
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2026 (Dinâmico) */}
            {segundo2026 && (
              <div className="group pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg)]">
                      {formatCandidateName(segundo2026.nome)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)]">
                      {segundo2026.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-[var(--fg-muted)]">
                  <span>{segundo2026.votos.toLocaleString('pt-BR')} votos</span>
                  {refSegundo2026 && (
                    <span
                      className={
                        pct2026 === 0 && refSegundo2026.delta === 0
                          ? 'text-[var(--fg-subtle)]'
                          : refSegundo2026.delta >= 0
                          ? 'text-[var(--color-positive)] font-medium'
                          : 'text-[var(--color-negative)] font-medium'
                      }
                    >
                      {refSegundo2026.delta >= 0 ? `+${refSegundo2026.delta.toFixed(2)}%` : `${refSegundo2026.delta.toFixed(2)}%`} {refSegundo2026.label} ({refSegundo2026.percentual.toFixed(2)}%)
                    </span>
                  )}
                </div>

                {/* Linha fina com track sutil visível e cor dinâmica do candidato */}
                <div className="mt-3 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, segundo2026.percentual))}%`,
                      backgroundColor: getCandidateColor(segundo2026)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUNA 2022 (HISTÓRICO) ================= */}
        <div className="md:border-l md:border-[var(--border)] md:pl-12">
          <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-semibold text-xl tracking-tight text-[var(--fg-muted)]">
                2022
              </h2>
              <span className="text-xs font-mono text-[var(--fg-subtle)]">
                {modo === 'urnas' ? `atingido às ${estado2022?.timestamp}` : `às ${estado2022?.timestamp}`}
              </span>
            </div>
            <div className="text-right font-mono text-xs">
              {lider2022 && margem2022 > 0 ? (
                <span className="text-[var(--fg-muted)]">
                  <span className="font-medium text-[var(--fg-muted)]">{formatCandidateName(lider2022.nome)}</span>{' '}
                  <span className="text-[var(--fg-subtle)]">liderava</span>{' '}
                  <span className="font-medium tabular-nums text-[var(--fg-muted)]">+{margem2022.toFixed(2)}%</span>
                </span>
              ) : (
                <span className="text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
                  {estado2022?.secoesTotalizadasPct.toFixed(2)}% apurado
                </span>
              )}
            </div>
          </div>

          <div className="space-y-7">
            {/* 1º Lugar 2022 (Dinâmico - reflete a virada histórica) */}
            {lider2022 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg-muted)]">
                      {formatCandidateName(lider2022.nome)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg-muted)]">
                      {lider2022.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-[var(--fg-subtle)]">
                  <span>{lider2022.votos.toLocaleString('pt-BR')} votos</span>
                  <span>{pct2022 > 0 ? 'Liderava neste ponto da apuração' : 'Aguardando início da apuração'}</span>
                </div>

                <div className="mt-3 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, lider2022.percentual))}%`,
                      backgroundColor: getCandidateColor(lider2022)
                    }}
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2022 (Dinâmico) */}
            {segundo2022 && (
              <div className="group pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg-muted)]">
                      {formatCandidateName(segundo2022.nome)}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg-muted)]">
                      {segundo2022.percentual.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-[var(--fg-subtle)]">
                  <span>{segundo2022.votos.toLocaleString('pt-BR')} votos</span>
                  <span>{pct2022 > 0 ? 'Segundo colocado' : 'Aguardando início da apuração'}</span>
                </div>

                <div className="mt-3 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, segundo2022.percentual))}%`,
                      backgroundColor: getCandidateColor(segundo2022)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção Editorial Integrada: Probabilidades no Polymarket (mesma linguagem tipográfica e barras de 2px) */}
      {polymarket && (
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <a
                href={polymarket.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg)] font-medium transition-colors underline decoration-[var(--border)] underline-offset-4"
              >
                Polymarket ↗
              </a>
            </div>
            <p className="text-xs font-mono text-[var(--fg-subtle)]">
              Probabilidade implícita de vitória em tempo real
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12 md:w-1/2">
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
              const windowLabel = polymarket.deltaWindow || '1h';
              const isPos = item.deltaPct > 0.04;
              const isNeg = item.deltaPct < -0.04;
              const formattedDelta = `${isPos ? '+' : ''}${item.deltaPct.toFixed(1)}%`;

              return (
                <div key={item.partido}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-xs sm:text-sm font-medium truncate ${item.isLead ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                      {item.nome}
                    </span>
                    <span className={`font-mono tabular-nums text-lg sm:text-xl font-light tracking-tight ${item.isLead ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, item.pct))}%`,
                        backgroundColor: item.cor
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums">
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
