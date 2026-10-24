'use client';

import React from 'react';
import type { ElectionState, ComparisonMode } from '@/lib/types';

interface ProgressHeaderProps {
  estado2026: ElectionState | null;
  estado2022: ElectionState | null;
  modo: ComparisonMode;
  ritmoMinutos: number;
}

export function ProgressHeader({
  estado2026,
  estado2022,
  modo,
  ritmoMinutos
}: ProgressHeaderProps) {
  const pct2026 = estado2026?.secoesTotalizadasPct || 0;
  const pct2022 = estado2022?.secoesTotalizadasPct || 0;

  const secoesApuradas2026 = estado2026?.secoesApuradas?.toLocaleString('pt-BR') || '0';
  const totalSecoes2026 = estado2026?.totalSecoes?.toLocaleString('pt-BR') || '0';
  const votosValidos2026 = estado2026?.totalVotosValidos?.toLocaleString('pt-BR') || '0';

  return (
    <section className="py-7 sm:py-9 border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-[-0.04em] text-[var(--fg)] leading-none">
            {pct2026.toFixed(2)}%
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--fg-muted)]">
            das urnas apuradas
          </span>
        </div>

        {/* Nota comparativa de ritmo */}
        <div className="text-xs font-mono text-[var(--fg-muted)] tabular-nums">
          {modo === 'urnas' ? (
            pct2026 > 0 ? (
              <span>
                em 2022 este marco ocorreu às{' '}
                <strong className="text-[var(--fg)] font-semibold">{estado2022?.timestamp || '--:--'}</strong>
                {ritmoMinutos !== 0 && (
                  <span className="text-[var(--fg-subtle)] ml-1.5">
                    ({ritmoMinutos > 0 ? `+${ritmoMinutos} min mais rápida` : `${Math.abs(ritmoMinutos)} min mais lenta`})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-[var(--fg-subtle)]">
                início oficial da totalização às <strong className="text-[var(--fg-muted)] font-medium">17:00</strong>
              </span>
            )
          ) : (
            <span>
              em 2022 no mesmo horário estava em{' '}
              <strong className="text-[var(--fg)] font-semibold">{pct2022.toFixed(2)}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Régua suíça de progresso (2px) com marcações de quartil */}
      <div className="w-full h-[2px] bg-[var(--track)] relative rounded-full">
        <div
          className="h-full bg-[var(--fg)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, pct2026))}%` }}
        />
        {[25, 50, 75].map(tick => (
          <span
            key={tick}
            aria-hidden="true"
            style={{ left: `${tick}%` }}
            className="absolute -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-30 pointer-events-none"
          />
        ))}
      </div>

      {/* Metadados editoriais da totalização */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--fg-subtle)]">
        <div className="flex items-center gap-2">
          <span>{secoesApuradas2026} de {totalSecoes2026} seções</span>
          {(estado2026?.totalVotosValidos ?? 0) > 0 && (
            <>
              <span>·</span>
              <span>{votosValidos2026} votos válidos</span>
            </>
          )}
        </div>
        <span className="uppercase tracking-[0.08em] text-[10px]">Totalização nacional · TSE</span>
      </div>
    </section>
  );
}
