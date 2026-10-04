'use client';

import React from 'react';

interface LiveCycleBarProps {
  tempoRestante: number;
  totalSegundos?: number;
  isAtualizando: boolean;
  horarioUltimaAtualizacao?: string;
  recarregarAgora: () => void;
  erro?: string | null;
}

export function LiveCycleBar({
  tempoRestante,
  totalSegundos = 60,
  isAtualizando,
  horarioUltimaAtualizacao,
  recarregarAgora,
  erro
}: LiveCycleBarProps) {
  // Percentual do ciclo decorrido (100% no início até 0% no fim)
  const progressoPct = Math.max(0, Math.min(100, (tempoRestante / totalSegundos) * 100));

  return (
    <div className="w-full bg-[var(--accent)] border-b border-[var(--border)]">
      {/* Barra linear fina de 1.5px indicando o ciclo de 60 segundos */}
      <div className="w-full h-[2px] bg-[var(--border)] overflow-hidden">
        <div
          className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressoPct}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Indicador ao vivo */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider text-[var(--foreground)] uppercase text-[11px]">
            Ao Vivo
          </span>
          <span className="text-[var(--muted)]">•</span>
          <span className="text-[var(--muted)]">
            {horarioUltimaAtualizacao
              ? `Dados apurados às ${horarioUltimaAtualizacao}`
              : 'Conectando ao TSE...'}
          </span>
        </div>

        {/* Ticker do ciclo de 60 segundos e ação de refresh */}
        <div className="flex items-center gap-3">
          {erro && (
            <span className="text-amber-700 dark:text-amber-400 text-[11px] font-mono">
              {erro}
            </span>
          )}
          <span className="text-[var(--muted)] font-mono tabular-nums">
            Próxima leitura em <strong className="text-[var(--foreground)] font-semibold">{tempoRestante}s</strong>
          </span>
          <button
            onClick={recarregarAgora}
            disabled={isAtualizando}
            aria-label="Atualizar dados agora"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-[var(--border)] rounded bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors disabled:opacity-50"
          >
            <span className={isAtualizando ? 'inline-block animate-spin' : ''}>↻</span>
            <span>{isAtualizando ? 'Buscando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
