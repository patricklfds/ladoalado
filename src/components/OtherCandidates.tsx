'use client';

import React from 'react';
import type { CandidateResult } from '@/lib/types';
import { formatCandidateName } from '@/lib/candidateUtils';

interface OtherCandidatesProps {
  candidatos2026: CandidateResult[];
  candidatos2022: CandidateResult[];
}

export function OtherCandidates({
  candidatos2026,
  candidatos2022
}: OtherCandidatesProps) {
  // Ordenar dinamicamente e pegar a partir do 3º colocado
  const ordenados2026 = [...candidatos2026].sort((a, b) => b.percentual - a.percentual);
  const ordenados2022 = [...candidatos2022].sort((a, b) => b.percentual - a.percentual);

  const secundario2026 = ordenados2026.slice(2);
  const secundario2022 = ordenados2022.slice(2);

  if (secundario2026.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      <div className="mb-4">
        <h3 className="font-semibold text-lg tracking-tight text-[var(--fg)]">
          Demais Candidatos
        </h3>
        <p className="text-xs text-[var(--fg-muted)]">
          Votação a partir da 3ª colocação comparada ao mesmo estágio de 2022
        </p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
        {secundario2026.map((cand, idx) => {
          const ref2022 = secundario2022[idx];
          const delta = ref2022 ? Number((cand.percentual - ref2022.percentual).toFixed(2)) : 0;
          const pos = (idx + 3).toString().padStart(2, '0');

          return (
            <div
              key={cand.id || cand.nome}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--surface-hover)] px-1 rounded transition-colors"
            >
              {/* Posição dinâmica, Nome & Partido 2026 */}
              <div className="flex items-center gap-3">
                <span className="text-[var(--fg-subtle)] w-5">
                  {pos}
                </span>
                <span className="font-medium text-[var(--fg)]">
                  {formatCandidateName(cand.nome)}
                </span>
                <span className="text-[var(--fg-subtle)]">
                  ({cand.partido})
                </span>
              </div>

              {/* Votação 2026 vs 2022 em Colunas Perfeitamente Alinhadas */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-[11px] tabular-nums shrink-0 pl-8 sm:pl-0">
                {/* Votos 2026 */}
                <span className="w-24 sm:w-28 text-right text-[var(--fg-muted)] shrink-0">
                  {cand.votos.toLocaleString('pt-BR')} votos
                </span>

                {/* Percentual 2026 */}
                <span className="w-14 sm:w-16 text-right font-bold text-[var(--fg)] text-sm shrink-0">
                  {cand.percentual.toFixed(2)}%
                </span>

                {/* Referência Histórica 2022 */}
                <span className="hidden md:inline-block w-64 text-right text-[var(--fg-subtle)] shrink-0 truncate">
                  {ref2022 ? (
                    `2022: ${ref2022.percentual.toFixed(2)}% (${formatCandidateName(ref2022.nome)})`
                  ) : (
                    <span className="text-[var(--border)]">—</span>
                  )}
                </span>

                {/* Delta 2026 vs 2022 */}
                <span className="hidden md:inline-block w-16 text-right font-semibold shrink-0">
                  {ref2022 ? (
                    <span className={delta >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
                      {delta >= 0 ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`}
                    </span>
                  ) : (
                    <span className="text-[var(--border)] font-normal">—</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
