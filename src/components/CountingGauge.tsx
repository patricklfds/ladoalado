'use client';

import React from 'react';
import type { ElectionState, ComparisonMode } from '@/lib/types';

interface CountingGaugeProps {
  estado2026: ElectionState | null;
  estado2022: ElectionState | null;
  modo: ComparisonMode;
  ritmoMinutos: number;
}

export function CountingGauge({
  estado2026,
  estado2022,
  modo,
  ritmoMinutos
}: CountingGaugeProps) {
  const pct2026 = estado2026?.secoesTotalizadasPct || 0;
  const pct2022 = estado2022?.secoesTotalizadasPct || 0;

  const secoesApuradas2026 = estado2026?.secoesApuradas?.toLocaleString('pt-BR') || '0';
  const totalSecoes2026 = estado2026?.totalSecoes?.toLocaleString('pt-BR') || '0';

  const secoesApuradas2022 = estado2022?.secoesApuradas?.toLocaleString('pt-BR') || '0';
  const totalSecoes2022 = estado2022?.totalSecoes?.toLocaleString('pt-BR') || '0';

  return (
    <section className="bg-[var(--card)] border-b border-[var(--border)] py-5 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">
              Progresso Geral da Apuração
            </h2>
            <p className="text-sm font-serif text-[var(--foreground)] mt-0.5">
              Ritmo de totalização das seções eleitorais em todo o Brasil
            </p>
          </div>

          {/* Badge de Ritmo Comparativo */}
          {estado2026 && estado2022 && modo === 'urnas' && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono py-1 px-2.5 rounded bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)]">
              <span className="font-semibold">Ritmo:</span>
              {ritmoMinutos > 0 ? (
                <span className="text-emerald-700 dark:text-emerald-400">
                  2026 está +{ritmoMinutos} min mais adiantada que 2022
                </span>
              ) : ritmoMinutos < 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  2026 está {Math.abs(ritmoMinutos)} min mais lenta que 2022
                </span>
              ) : (
                <span className="text-[var(--muted)]">
                  Mesmo ritmo de apuração de 2022
                </span>
              )}
            </div>
          )}
        </div>

        {/* Comparativo de Barras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Barra 2026 */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--foreground)]">2026</span>
                <span className="text-[var(--muted)] font-mono text-[11px]">(Hoje, às {estado2026?.timestamp || '--:--'})</span>
              </div>
              <div className="font-mono tabular-nums text-sm font-bold text-[var(--foreground)]">
                {pct2026.toFixed(2)}%
              </div>
            </div>
            {/* Barra linear editorial */}
            <div className="w-full h-3 bg-[var(--accent)] border border-[var(--border)] rounded-sm overflow-hidden p-0.5">
              <div
                className="h-full bg-[var(--foreground)] rounded-[1px] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, pct2026)}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-[var(--muted)] flex justify-between">
              <span>{secoesApuradas2026} seções apuradas</span>
              <span>Total: {totalSecoes2026}</span>
            </div>
          </div>

          {/* Barra 2022 */}
          <div className="space-y-1.5 md:border-l md:border-[var(--border)] md:pl-5">
            <div className="flex items-baseline justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--muted)]">2022</span>
                <span className="text-[var(--muted)] font-mono text-[11px]">
                  {modo === 'urnas'
                    ? `(Às ${estado2022?.timestamp || '--:--'} em 02/10/2022)`
                    : `(No relógio às ${estado2022?.timestamp || '--:--'})`}
                </span>
              </div>
              <div className="font-mono tabular-nums text-sm font-bold text-[var(--muted)]">
                {pct2022.toFixed(2)}%
              </div>
            </div>
            {/* Barra linear 2022 (estilo referência) */}
            <div className="w-full h-3 bg-[var(--accent)] border border-[var(--border)] rounded-sm overflow-hidden p-0.5">
              <div
                className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-[1px] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, pct2022)}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-[var(--muted)] flex justify-between">
              <span>{secoesApuradas2022} seções apuradas</span>
              <span>Total: {totalSecoes2022}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
