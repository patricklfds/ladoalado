'use client';

import React from 'react';
import type { ElectionState, ComparisonMode } from '@/lib/types';

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
  deltaLula,
  deltaOposicao,
  margem2026,
  margem2022
}: ComparisonArenaProps) {
  const cands2026 = estado2026?.candidatos || [];
  const cands2022 = estado2022?.candidatos || [];

  const lula2022 = cands2022.find(c => c.nome.includes('LULA'));
  const bolso2022 = cands2022.find(c => c.nome.includes('BOLSONARO'));

  const lider2026 = cands2026[0];
  const segundo2026 = cands2026[1];
  const lider2022 = cands2022[0];
  const segundo2022 = cands2022[1];

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      {/* Resumo da Margem de Liderança */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 text-xs text-[var(--fg-muted)]">
        <div className="font-mono">
          <span className="text-[var(--fg-subtle)] mr-2">comparação direta:</span>
          {modo === 'urnas' ? (
            <span>
              com exatamente <strong className="text-[var(--fg)]">{estado2026?.secoesTotalizadasPct.toFixed(2)}%</strong> das urnas em ambos os anos
            </span>
          ) : (
            <span>
              às <strong className="text-[var(--fg)]">{estado2026?.timestamp.slice(0, 5)}</strong> de Brasília
            </span>
          )}
        </div>

        {margem2026 > 0 && (
          <div className="font-mono text-[11px] text-[var(--fg)]">
            Vantagem do líder: <strong className="font-bold">+{margem2026.toFixed(2)}%</strong>
            {margem2022 > 0 && (
              <span className="text-[var(--fg-muted)] ml-1.5">
                (em 2022: +{margem2022.toFixed(2)}% para {lider2022?.nome})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid Principal Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* ================= COLUNA 2026 (HOJE) ================= */}
        <div>
          <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--fg)]">
                2026
              </h2>
              <span className="text-xs font-mono text-[var(--fg-muted)]">
                ao vivo
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-[var(--fg-muted)]">
              {estado2026?.secoesTotalizadasPct.toFixed(2)}% apurado
            </span>
          </div>

          <div className="space-y-6">
            {/* 1º Lugar 2026 */}
            {lider2026 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg)] uppercase">
                      {lider2026.nome}
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
                  {lula2022 && (
                    <span className={deltaLula >= 0 ? 'text-[var(--color-positive)] font-medium' : 'text-[var(--color-negative)] font-medium'}>
                      {deltaLula >= 0 ? `+${deltaLula.toFixed(2)}%` : `${deltaLula.toFixed(2)}%`} vs Lula 2022 ({lula2022.percentual.toFixed(2)}%)
                    </span>
                  )}
                </div>

                {/* Linha fina proporcional */}
                <div className="mt-3 w-full h-[1.5px] bg-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--color-pt)]"
                    style={{ width: `${Math.min(100, Math.max(0, lider2026.percentual))}%` }}
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2026 */}
            {segundo2026 && (
              <div className="group pt-2">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2026.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg)] uppercase">
                      {segundo2026.nome}
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
                  {bolso2022 && (
                    <span className={deltaOposicao >= 0 ? 'text-[var(--color-positive)] font-medium' : 'text-[var(--color-negative)] font-medium'}>
                      {deltaOposicao >= 0 ? `+${deltaOposicao.toFixed(2)}%` : `${deltaOposicao.toFixed(2)}%`} vs Bolsonaro 2022 ({bolso2022.percentual.toFixed(2)}%)
                    </span>
                  )}
                </div>

                {/* Linha fina proporcional */}
                <div className="mt-3 w-full h-[1.5px] bg-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--color-pl)]"
                    style={{ width: `${Math.min(100, Math.max(0, segundo2026.percentual))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUNA 2022 (HISTÓRICO) ================= */}
        <div className="md:border-l md:border-[var(--border)] md:pl-12">
          <div className="flex items-baseline justify-between pb-3 mb-6 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-2">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--fg-muted)]">
                2022
              </h2>
              <span className="text-xs font-mono text-[var(--fg-subtle)]">
                {modo === 'urnas' ? `atingido às ${estado2022?.timestamp}` : `às ${estado2022?.timestamp}`}
              </span>
            </div>
            <span className="text-xs font-mono tabular-nums text-[var(--fg-subtle)]">
              {estado2022?.secoesTotalizadasPct.toFixed(2)}% apurado
            </span>
          </div>

          <div className="space-y-6">
            {/* 1º Lugar 2022 */}
            {lider2022 && (
              <div className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>01</span>
                      <span>·</span>
                      <span>{lider2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg-muted)] uppercase">
                      {lider2022.nome}
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
                  <span>Liderava neste ponto da apuração</span>
                </div>

                {/* Linha fina proporcional */}
                <div className="mt-3 w-full h-[1.5px] bg-[var(--border-subtle)]">
                  <div
                    className="h-full bg-neutral-400 dark:bg-neutral-600"
                    style={{ width: `${Math.min(100, Math.max(0, lider2022.percentual))}%` }}
                  />
                </div>
              </div>
            )}

            {/* 2º Lugar 2022 */}
            {segundo2022 && (
              <div className="group pt-2">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-subtle)] mb-1">
                      <span>02</span>
                      <span>·</span>
                      <span>{segundo2022.partido}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--fg-muted)] uppercase">
                      {segundo2022.nome}
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
                  <span>Segundo colocado</span>
                </div>

                {/* Linha fina proporcional */}
                <div className="mt-3 w-full h-[1.5px] bg-[var(--border-subtle)]">
                  <div
                    className="h-full bg-neutral-400 dark:bg-neutral-600"
                    style={{ width: `${Math.min(100, Math.max(0, segundo2022.percentual))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
