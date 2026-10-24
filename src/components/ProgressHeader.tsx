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

  return (
    <section className="py-6 sm:py-8 border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono tabular-nums text-3xl sm:text-4xl font-light tracking-tight text-[var(--fg)]">
            {pct2026.toFixed(2)}%
          </span>
          <span className="text-xs uppercase tracking-widest text-[var(--fg-muted)] font-medium">
            das urnas apuradas
          </span>
        </div>

        {/* Nota comparativa de ritmo */}
        <div className="text-xs font-mono text-[var(--fg-muted)]">
          {modo === 'urnas' ? (
            <span>
              em 2022 este marco ocorreu às{' '}
              <strong className="text-[var(--fg)] font-semibold">{estado2022?.timestamp || '--:--'}</strong>
              {ritmoMinutos !== 0 && (
                <span className="text-[var(--fg-subtle)] ml-1">
                  ({ritmoMinutos > 0 ? `+${ritmoMinutos} min mais rápida` : `${Math.abs(ritmoMinutos)} min mais lenta`})
                </span>
              )}
            </span>
          ) : (
            <span>
              em 2022 no mesmo horário estava em{' '}
              <strong className="text-[var(--fg)] font-semibold">{pct2022.toFixed(2)}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Linha de progresso ultra-fina (2px) com ponto de referência */}
      <div className="w-full h-[2px] bg-[var(--border)] relative overflow-hidden rounded-full">
        <div
          className="h-full bg-[var(--fg)] transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, pct2026))}%` }}
        />
      </div>

      {/* Legenda mínima abaixo da barra */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--fg-subtle)]">
        <div className="flex flex-wrap items-center gap-2">
          <span>{secoesApuradas2026} de {totalSecoes2026} seções apuradas</span>
          {(estado2026?.secoesAdiantadasUF ?? 0) > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              · +{estado2026!.secoesAdiantadasUF!.toLocaleString('pt-BR')} urnas à frente do painel nacional
            </span>
          )}
        </div>
        {pct2026 > 0 && estado2026?.votosBrancosPct !== undefined ? (
          <span>
            Brancos {estado2026.votosBrancosPct.toFixed(2)}% · Nulos {(estado2026.votosNulosPct ?? 0).toFixed(2)}%
            {estado2026.abstencaoPct !== undefined ? ` · Abstenção ${estado2026.abstencaoPct.toFixed(2)}%` : ''}
          </span>
        ) : (
          <span>Motor Multi-UF (27 UFs + Exterior) · 2º Turno</span>
        )}
      </div>
    </section>
  );
}
