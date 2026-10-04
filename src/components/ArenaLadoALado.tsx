'use client';

import React, { useState } from 'react';
import type { ElectionState, ComparisonMode } from '@/lib/types';
import { CandidateCard } from './CandidateCard';

interface ArenaLadoALadoProps {
  estado2026: ElectionState | null;
  estado2022: ElectionState | null;
  modo: ComparisonMode;
  deltaLider: number;
  deltaSegundo: number;
  deltaLula?: number;
  deltaOposicao?: number;
  margem2026?: number;
  margem2022?: number;
}

export function ArenaLadoALado({
  estado2026,
  estado2022,
  modo,
  deltaLider,
  deltaSegundo,
  deltaLula = 0,
  deltaOposicao = 0,
  margem2026 = 0,
  margem2022 = 0
}: ArenaLadoALadoProps) {
  const [mobileTab, setMobileTab] = useState<'comparativo' | '2026' | '2022'>('comparativo');

  const cands2026 = estado2026?.candidatos || [];
  const cands2022 = estado2022?.candidatos || [];

  const lider2026 = cands2026[0];
  const segundo2026 = cands2026[1];

  const lider2022 = cands2022[0];
  const segundo2022 = cands2022[1];

  // Identificar candidatos de 2022 para comparação direta
  const lula2022 = cands2022.find(c => c.nome.includes('LULA'));
  const bolso2022 = cands2022.find(c => c.nome.includes('BOLSONARO'));

  // Badges comparativos para os candidatos de 2026
  const badgeLider2026 = lider2026?.nome.includes('LULA') && lula2022
    ? { label: 'vs Lula 2022', delta: deltaLula, percentualRef: lula2022.percentual }
    : undefined;

  const badgeSegundo2026 = segundo2026 && bolso2022
    ? { label: 'vs Bolsonaro 2022', delta: deltaOposicao, percentualRef: bolso2022.percentual }
    : undefined;

  return (
    <section className="py-6">
      {/* Contextualizador Editorial de Sincronia */}
      <div className="mb-4 pb-3 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <div>
          {modo === 'urnas' ? (
            <span>
              Mostrando o cenário eleitoral quando <strong>exatamente {estado2026?.secoesTotalizadasPct.toFixed(2)}%</strong> das seções foram apuradas em ambos os anos.
            </span>
          ) : (
            <span>
              Sincronizado no minuto <strong>{estado2026?.timestamp.slice(0, 5)}</strong> do relógio oficial de Brasília.
            </span>
          )}
        </div>
        {margem2026 > 0 && (
          <div className="font-mono text-[11px] text-[var(--foreground)] bg-[var(--accent)] px-2.5 py-1 rounded border border-[var(--border)]">
            Margem atual do líder: <strong>+{margem2026.toFixed(2)}%</strong>
            {margem2022 > 0 && (
              <span className="text-[var(--muted)] ml-1">
                (em 2022 era +{margem2022.toFixed(2)}% para {lider2022?.nome})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Seletor Mobile (aparece apenas em telas pequenas) */}
      <div className="md:hidden mb-4 flex justify-center">
        <div className="inline-flex p-0.5 border border-[var(--border)] rounded bg-[var(--accent)] text-xs">
          <button
            onClick={() => setMobileTab('comparativo')}
            className={`px-3 py-1.5 rounded font-medium ${
              mobileTab === 'comparativo'
                ? 'bg-[var(--card)] text-[var(--foreground)] font-bold shadow-xs'
                : 'text-[var(--muted)]'
            }`}
          >
            Lado a Lado
          </button>
          <button
            onClick={() => setMobileTab('2026')}
            className={`px-3 py-1.5 rounded font-medium ${
              mobileTab === '2026'
                ? 'bg-[var(--card)] text-[var(--foreground)] font-bold shadow-xs'
                : 'text-[var(--muted)]'
            }`}
          >
            2026 (Ao Vivo)
          </button>
          <button
            onClick={() => setMobileTab('2022')}
            className={`px-3 py-1.5 rounded font-medium ${
              mobileTab === '2022'
                ? 'bg-[var(--card)] text-[var(--foreground)] font-bold shadow-xs'
                : 'text-[var(--muted)]'
            }`}
          >
            2022 (Histórico)
          </button>
        </div>
      </div>

      {/* Grid Comparativo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
        {/* Coluna 2026 */}
        <div className={`${mobileTab === '2022' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                2026
              </span>
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Ao Vivo
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--foreground)]">
              {estado2026?.secoesTotalizadasPct.toFixed(2)}% das urnas
            </span>
          </div>

          <div className="space-y-4">
            {lider2026 ? (
              <CandidateCard
                candidato={lider2026}
                destaque={true}
                badgeComparativo={badgeLider2026}
              />
            ) : (
              <div className="h-28 bg-[var(--accent)] animate-pulse rounded border border-[var(--border)]" />
            )}

            {segundo2026 ? (
              <CandidateCard
                candidato={segundo2026}
                badgeComparativo={badgeSegundo2026}
              />
            ) : (
              <div className="h-28 bg-[var(--accent)] animate-pulse rounded border border-[var(--border)]" />
            )}
          </div>
        </div>

        {/* Badges de Delta Comparativo (Visíveis no desktop centralizados entre as duas colunas) */}
        <div className="hidden lg:flex flex-col justify-around absolute left-1/2 top-16 bottom-8 -translate-x-1/2 pointer-events-none z-10 w-32 text-center">
          {/* Delta do 1º Lugar */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded py-1 px-2 shadow-xs pointer-events-auto">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block font-semibold">
              Delta 1º Lugar
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                deltaLider > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : deltaLider < 0
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-[var(--muted)]'
              }`}
            >
              {deltaLider > 0 ? `+${deltaLider}%` : `${deltaLider}%`}
            </span>
          </div>

          {/* Delta do 2º Lugar */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded py-1 px-2 shadow-xs pointer-events-auto">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block font-semibold">
              Delta 2º Lugar
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                deltaSegundo > 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : deltaSegundo < 0
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-[var(--muted)]'
              }`}
            >
              {deltaSegundo > 0 ? `+${deltaSegundo}%` : `${deltaSegundo}%`}
            </span>
          </div>
        </div>

        {/* Coluna 2022 */}
        <div className={`${mobileTab === '2026' ? 'hidden md:block' : 'block'} md:border-l md:border-[var(--border)] md:pl-8`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--muted)]">
                2022
              </span>
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--muted)] border border-[var(--border)]">
                {modo === 'urnas' ? 'Mesmo % de Urnas' : 'Mesmo Horário'}
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--muted)]">
              {estado2022?.secoesTotalizadasPct.toFixed(2)}% das urnas
            </span>
          </div>

          <div className="space-y-4">
            {lider2022 ? (
              <CandidateCard candidato={lider2022} destaque={true} />
            ) : (
              <div className="h-28 bg-[var(--accent)] animate-pulse rounded border border-[var(--border)]" />
            )}

            {segundo2022 ? (
              <CandidateCard candidato={segundo2022} />
            ) : (
              <div className="h-28 bg-[var(--accent)] animate-pulse rounded border border-[var(--border)]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
