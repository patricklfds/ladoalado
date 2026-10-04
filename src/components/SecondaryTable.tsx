'use client';

import React from 'react';
import type { CandidateResult } from '@/lib/types';

interface SecondaryTableProps {
  candidatos2026: CandidateResult[];
  candidatos2022: CandidateResult[];
}

export function SecondaryTable({ candidatos2026, candidatos2022 }: SecondaryTableProps) {
  // Pega do 3º colocado em diante
  const secundario2026 = candidatos2026.slice(2);
  const secundario2022 = candidatos2022.slice(2);

  const maxRows = Math.max(secundario2026.length, secundario2022.length);
  if (maxRows === 0) return null;

  return (
    <div className="mt-8 border border-[var(--border)] rounded bg-[var(--card)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--accent)] flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
          Demais Candidatos & Terceira Via
        </h3>
        <span className="text-[11px] text-[var(--muted)] font-mono">
          Classificação a partir do 3º colocado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        {/* Coluna 2026 */}
        <div className="p-3">
          <div className="text-[11px] font-bold uppercase text-[var(--muted)] px-2 pb-2 mb-1 border-b border-[var(--border)] flex justify-between">
            <span>Candidato 2026</span>
            <span className="font-mono">Votos (% / Totais)</span>
          </div>
          <div className="space-y-1">
            {secundario2026.map((cand) => (
              <div
                key={cand.id}
                className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    {cand.posicao}º
                  </span>
                  <span className="font-medium text-[var(--foreground)] truncate">
                    {cand.nome}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    ({cand.partido})
                  </span>
                </div>
                <div className="text-right flex-shrink-0 font-mono tabular-nums">
                  <span className="font-bold text-[var(--foreground)]">
                    {cand.percentual.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[var(--muted)] ml-2 hidden sm:inline">
                    {cand.votos.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2022 */}
        <div className="p-3">
          <div className="text-[11px] font-bold uppercase text-[var(--muted)] px-2 pb-2 mb-1 border-b border-[var(--border)] flex justify-between">
            <span>Candidato 2022 (Mesmo Ponto)</span>
            <span className="font-mono">Votos (% / Totais)</span>
          </div>
          <div className="space-y-1">
            {secundario2022.map((cand) => (
              <div
                key={cand.id}
                className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    {cand.posicao}º
                  </span>
                  <span className="font-medium text-[var(--foreground)] truncate">
                    {cand.nome}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    ({cand.partido})
                  </span>
                </div>
                <div className="text-right flex-shrink-0 font-mono tabular-nums">
                  <span className="font-bold text-[var(--muted)]">
                    {cand.percentual.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[var(--muted)] ml-2 hidden sm:inline">
                    {cand.votos.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
