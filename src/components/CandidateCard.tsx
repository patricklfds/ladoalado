'use client';

import React from 'react';
import type { CandidateResult } from '@/lib/types';

interface CandidateCardProps {
  candidato: CandidateResult;
  destaque?: boolean;
}

export function CandidateCard({ candidato, destaque = false }: CandidateCardProps) {
  const votosFormatados = candidato.votos.toLocaleString('pt-BR');
  const pctFormatado = candidato.percentual.toFixed(2);

  return (
    <div
      className={`p-4 rounded border transition-colors ${
        destaque
          ? 'bg-[var(--card)] border-[var(--foreground)] border-opacity-30 dark:border-opacity-40 shadow-xs'
          : 'bg-[var(--card)] border-[var(--border)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Posição, Nome e Partido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center justify-center text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                candidato.posicao === 1
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'bg-[var(--accent)] text-[var(--muted)] border border-[var(--border)]'
              }`}
            >
              {candidato.posicao}º
            </span>
            <span className="text-xs font-mono text-[var(--muted)] font-medium">
              #{candidato.numero}
            </span>
            <span className="text-xs font-medium text-[var(--muted)] truncate">
              {candidato.partido}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] uppercase truncate">
            {candidato.nome}
          </h3>

          <div className="mt-1 text-xs font-mono text-[var(--muted)]">
            {votosFormatados} votos válidos
          </div>
        </div>

        {/* Porcentagem em Números Tabulares Grandes */}
        <div className="text-right flex-shrink-0">
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            {pctFormatado}%
          </div>
        </div>
      </div>

      {/* Barra de Proporção Eleitoral */}
      <div className="mt-3 w-full h-2 bg-[var(--accent)] border border-[var(--border)] rounded-sm overflow-hidden p-0.5">
        <div
          className="h-full rounded-[1px] transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, candidato.percentual))}%`,
            backgroundColor: candidato.cor || 'var(--foreground)'
          }}
        />
      </div>
    </div>
  );
}
