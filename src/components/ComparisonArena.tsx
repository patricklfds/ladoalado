'use client';

import React from 'react';
import type { CandidateResult, ElectionState, ComparisonMode } from '@/lib/types';
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
  // Ordenação garantidamente dinâmica
  const cands2026 = [...(estado2026?.candidatos || [])].sort((a, b) => b.percentual - a.percentual);
  const cands2022 = [...(estado2022?.candidatos || [])].sort((a, b) => b.percentual - a.percentual);

  const lider2026 = cands2026[0];
  const segundo2026 = cands2026[1];
  const lider2022 = cands2022[0];
  const segundo2022 = cands2022[1];

  const refLider2026 = getHistoricalReference(lider2026, cands2022);
  const refSegundo2026 = getHistoricalReference(segundo2026, cands2022);

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      {/* Resumo da Margem de Liderança (100% Dinâmico) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 text-xs text-[var(--fg-muted)]">
        <div className="font-mono">
          <span className="text-[var(--fg-subtle)] mr-2">comparação direta:</span>
          {modo === 'urnas' ? (
            <span>
              com exatamente <strong className="text-[var(--fg)]">{estado2026?.secoesTotalizadasPct.toFixed(2)}%</strong> das urnas em ambos os anos
            </span>
          ) : (
            <span>
              às <strong className="text-[var(--fg)]">{estado2026?.timestamp.slice(0, 5)}</strong> de Brasília
            </span>
          )}
        </div>

        {margem2026 > 0 && lider2026 && (
          <div className="font-mono text-[11px] text-[var(--fg)]">
            Vantagem de {formatCandidateName(lider2026.nome)}: <strong className="font-semibold">+{margem2026.toFixed(2)}%</strong>
            {margem2022 > 0 && lider2022 && (
              <span className="text-[var(--fg-muted)] ml-1.5">
                (em 2022: +{margem2022.toFixed(2)}% para {formatCandidateName(lider2022.nome)})
              </span>
            )}
          </div>
        )}
      </div>

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
            <span className="text-xs font-mono tabular-nums text-[var(--fg-muted)]">
              {estado2026?.secoesTotalizadasPct.toFixed(2)}% apurado
            </span>
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
                    <span className={refLider2026.delta >= 0 ? 'text-[var(--color-positive)] font-medium' : 'text-[var(--color-negative)] font-medium'}>
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
                    <span className={refSegundo2026.delta >= 0 ? 'text-[var(--color-positive)] font-medium' : 'text-[var(--color-negative)] font-medium'}>
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
            <span className="text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
              {estado2022?.secoesTotalizadasPct.toFixed(2)}% apurado
            </span>
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
                  <span>Liderava neste ponto da apuração</span>
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
                  <span>Segundo colocado</span>
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
    </section>
  );
}
