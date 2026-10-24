'use client';

import React from 'react';
import type { ElectionState, ComparisonMode, CandidateResult } from '@/lib/types';
import { formatCandidateName, getCandidateColor, getHistoricalReference } from '@/lib/candidateUtils';

interface RunoffMathResult {
  isWaiting: boolean;
  diffVotos: number;
  votosRestantes: number;
  pctNecessario: number;
  isDefined: boolean;
}

function computeRunoffMath(
  pct: number,
  totalValidos: number,
  lider?: CandidateResult,
  segundo?: CandidateResult
): RunoffMathResult {
  if (!lider || !segundo || pct <= 0) {
    return {
      isWaiting: true,
      diffVotos: 0,
      votosRestantes: 0,
      pctNecessario: 50,
      isDefined: false
    };
  }

  const v1 = lider.votos || 0;
  const v2 = segundo.votos || 0;
  const diffVotos = Math.max(0, v1 - v2);
  const valAtuais = Math.max(totalValidos || 0, v1 + v2);

  const projTotal = pct >= 100 ? valAtuais : Math.round(valAtuais / (pct / 100));
  const votosRestantes = Math.max(0, projTotal - valAtuais);

  const pctNecessario =
    votosRestantes > 0
      ? ((votosRestantes + diffVotos) / (2 * votosRestantes)) * 100
      : diffVotos > 0
      ? 100.1
      : 50;

  const isDefined =
    pct >= 100 || (votosRestantes === 0 && diffVotos > 0) || diffVotos > votosRestantes || pctNecessario > 100;

  return {
    isWaiting: false,
    diffVotos,
    votosRestantes,
    pctNecessario,
    isDefined
  };
}

function formatCompactVotes(votos: number): string {
  if (votos >= 1_000_000) {
    return `${(votos / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  }
  if (votos >= 1_000) {
    return `${Math.round(votos / 1_000).toLocaleString('pt-BR')} mil`;
  }
  return votos.toLocaleString('pt-BR');
}

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

  const math2026 = computeRunoffMath(pct2026, estado2026?.totalVotosValidos ?? 0, lider2026, segundo2026);
  const math2022 = computeRunoffMath(pct2022, estado2022?.totalVotosValidos ?? 0, lider2022, segundo2022);

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

          {/* Termômetro de Virada & Definição Matemática 2026 */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] font-mono text-xs space-y-1">
            <div className="flex items-center justify-between gap-2 text-[var(--fg-muted)]">
              <span>
                Diferença:{' '}
                <strong className="font-medium tabular-nums text-[var(--fg)]">
                  {math2026.diffVotos.toLocaleString('pt-BR')} votos
                </strong>
              </span>
              {math2026.isWaiting ? (
                <span className="text-[11px] text-[var(--fg-subtle)]">Urnas em 0,00%</span>
              ) : math2026.isDefined ? (
                <span className="text-[11px] font-semibold text-[var(--color-positive)]">
                  Matematicamente definido
                </span>
              ) : (
                <span className="text-[11px] text-[var(--fg-subtle)] tabular-nums">
                  Restam ~{formatCompactVotes(math2026.votosRestantes)} votos válidos
                </span>
              )}
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">
              {math2026.isWaiting ? (
                <span>Projeção matemática de virada ativa a partir do 1º boletim</span>
              ) : math2026.isDefined && lider2026 ? (
                <span>
                  Vantagem de <strong className="text-[var(--fg)] font-medium">{formatCandidateName(lider2026.nome)}</strong> supera os votos válidos restantes
                </span>
              ) : segundo2026 ? (
                <span>
                  Para virar, <strong className="text-[var(--fg-muted)] font-medium">{formatCandidateName(segundo2026.nome)}</strong> precisa de{' '}
                  <strong className="text-[var(--fg)] font-medium tabular-nums">
                    {math2026.pctNecessario.toFixed(2)}%
                  </strong>{' '}
                  dos votos restantes
                </span>
              ) : null}
            </div>
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

          {/* Termômetro Histórico de Virada & Definição Matemática 2022 */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] font-mono text-xs space-y-1">
            <div className="flex items-center justify-between gap-2 text-[var(--fg-subtle)]">
              <span>
                Diferença em 2022:{' '}
                <strong className="font-medium tabular-nums text-[var(--fg-muted)]">
                  {math2022.diffVotos.toLocaleString('pt-BR')} votos
                </strong>
              </span>
              {math2022.isWaiting ? (
                <span className="text-[11px]">Urnas em 0,00%</span>
              ) : math2022.isDefined ? (
                <span className="text-[11px] font-medium text-[var(--fg-muted)]">
                  Matematicamente definido
                </span>
              ) : (
                <span className="text-[11px] tabular-nums">
                  Restavam ~{formatCompactVotes(math2022.votosRestantes)} votos válidos
                </span>
              )}
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">
              {math2022.isWaiting ? (
                <span>Virada histórica em 67,76% (18h44) · Definido em 98,81% (19h57)</span>
              ) : math2022.isDefined && lider2022 ? (
                <span>
                  Vantagem de <strong className="text-[var(--fg-muted)] font-medium">{formatCandidateName(lider2022.nome)}</strong> superou os votos restantes (às 19h57)
                </span>
              ) : segundo2022 ? (
                <span>
                  Para virar, <strong className="text-[var(--fg-muted)] font-medium">{formatCandidateName(segundo2022.nome)}</strong> precisava de{' '}
                  <strong className="text-[var(--fg-muted)] font-medium tabular-nums">
                    {math2022.pctNecessario.toFixed(2)}%
                  </strong>{' '}
                  dos votos restantes
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
