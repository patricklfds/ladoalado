'use client';

import React from 'react';
import type { CandidateResult } from '@/lib/types';

interface OtherCandidatesProps {
  candidatos2026: CandidateResult[];
  candidatos2022: CandidateResult[];
}

export function OtherCandidates({
  candidatos2026,
  candidatos2022
}: OtherCandidatesProps) {
  const secundario2026 = candidatos2026.slice(2);
  const secundario2022 = candidatos2022.slice(2);

  if (secundario2026.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold tracking-tight text-[var(--fg)]">
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

          return (
            <div
              key={cand.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--surface-hover)] px-1 rounded transition-colors"
            >
              {/* Nome & Partido 2026 */}
              <div className="flex items-center gap-3">
                <span className="text-[var(--fg-subtle)] w-5">
                  0{cand.posicao}
                </span>
                <span className="font-semibold text-[var(--fg)] uppercase tracking-wide">
                  {cand.nome}
                </span>
                <span className="text-[var(--fg-subtle)]">
                  ({cand.partido})
                </span>
              </div>

              {/* Votação 2026 vs 2022 */}
              <div className="flex items-center justify-between sm:justify-end gap-6 text-[11px] tabular-nums pl-8 sm:pl-0">
                <span className="text-[var(--fg-muted)]">
                  {cand.votos.toLocaleString('pt-BR')} votos
                </span>
                <span className="font-bold text-[var(--fg)] text-sm">
                  {cand.percentual.toFixed(2)}%
                </span>
                {ref2022 && (
                  <span className="text-[var(--fg-subtle)] hidden md:inline">
                    2022: {ref2022.percentual.toFixed(2)}% ({ref2022.nome.split(' ')[0]})
                  </span>
                )}
                {ref2022 && (
                  <span
                    className={`w-14 text-right font-semibold ${
                      delta >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                    }`}
                  >
                    {delta >= 0 ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
