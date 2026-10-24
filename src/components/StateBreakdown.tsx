'use client';

import React, { useState, useMemo } from 'react';
import type { UFResult, MacroRegiao } from '@/lib/types';

interface StateBreakdownProps {
  ufs?: UFResult[];
}

type SortMode = 'volume' | 'faltam' | 'apurado';

const REGIOES_ORDER: MacroRegiao[] = [
  'Sudeste',
  'Nordeste',
  'Sul',
  'Norte',
  'Centro-Oeste',
  'Exterior'
];

// Resultado oficial do 2º Turno de 2022 (TSE Pleito 545 - 30/10/2022) por Macro-Região
const REGIAO_2022_BASELINE: Record<MacroRegiao, { lula2022: number; bolso2022: number }> = {
  'Sudeste': { lula2022: 45.74, bolso2022: 54.26 },
  'Nordeste': { lula2022: 69.34, bolso2022: 30.66 },
  'Sul': { lula2022: 38.16, bolso2022: 61.84 },
  'Norte': { lula2022: 49.00, bolso2022: 51.00 },
  'Centro-Oeste': { lula2022: 39.79, bolso2022: 60.21 },
  'Exterior': { lula2022: 51.28, bolso2022: 48.72 }
};

// Resultado oficial do 2º Turno de 2022 (TSE Pleito 545 - 30/10/2022) por UF
const UF_2022_BASELINE: Record<string, { lula2022: number; bolso2022: number }> = {
  SP: { lula2022: 44.76, bolso2022: 55.24 },
  MG: { lula2022: 50.20, bolso2022: 49.80 },
  RJ: { lula2022: 43.47, bolso2022: 56.53 },
  BA: { lula2022: 72.12, bolso2022: 27.88 },
  RS: { lula2022: 43.65, bolso2022: 56.35 },
  PR: { lula2022: 37.60, bolso2022: 62.40 },
  CE: { lula2022: 69.97, bolso2022: 30.03 },
  PE: { lula2022: 66.93, bolso2022: 33.07 },
  PA: { lula2022: 54.75, bolso2022: 45.25 },
  SC: { lula2022: 30.73, bolso2022: 69.27 },
  MA: { lula2022: 71.14, bolso2022: 28.86 },
  GO: { lula2022: 41.29, bolso2022: 58.71 },
  PB: { lula2022: 66.62, bolso2022: 33.38 },
  ES: { lula2022: 41.96, bolso2022: 58.04 },
  PI: { lula2022: 76.86, bolso2022: 23.14 },
  MT: { lula2022: 34.92, bolso2022: 65.08 },
  RN: { lula2022: 65.10, bolso2022: 34.90 },
  AM: { lula2022: 51.10, bolso2022: 48.90 },
  MS: { lula2022: 40.51, bolso2022: 59.49 },
  AL: { lula2022: 58.68, bolso2022: 41.32 },
  DF: { lula2022: 41.19, bolso2022: 58.81 },
  SE: { lula2022: 67.21, bolso2022: 32.79 },
  RO: { lula2022: 29.34, bolso2022: 70.66 },
  TO: { lula2022: 51.36, bolso2022: 48.64 },
  AC: { lula2022: 29.70, bolso2022: 70.30 },
  AP: { lula2022: 48.64, bolso2022: 51.36 },
  RR: { lula2022: 23.92, bolso2022: 76.08 },
  ZZ: { lula2022: 51.28, bolso2022: 48.72 }
};

export function StateBreakdown({ ufs }: StateBreakdownProps) {
  const [sortMode, setSortMode] = useState<SortMode>('volume');
  const [showAllUFs, setShowAllUFs] = useState<boolean>(false);

  const regioesSummary = useMemo(() => {
    if (!ufs || ufs.length === 0) return [];

    return REGIOES_ORDER.map(regiao => {
      const states = ufs.filter(u => u.regiao === regiao);
      const totalSecoes = states.reduce((acc, s) => acc + s.totalSecoes, 0);
      const secoesApuradas = states.reduce((acc, s) => acc + s.secoesApuradas, 0);
      const secoesRestantes = Math.max(0, totalSecoes - secoesApuradas);
      const secoesPct = totalSecoes > 0 ? Number(((secoesApuradas / totalSecoes) * 100).toFixed(2)) : 0;

      const totalVotosValidos = states.reduce((acc, s) => acc + s.totalVotosValidos, 0);
      const lulaVotos = states.reduce((acc, s) => acc + s.lulaVotos, 0);
      const bolsonaroVotos = states.reduce((acc, s) => acc + s.bolsonaroVotos, 0);

      const lulaPct = totalVotosValidos > 0 ? Number(((lulaVotos / totalVotosValidos) * 100).toFixed(2)) : 0;
      const bolsonaroPct =
        totalVotosValidos > 0 ? Number(Math.max(0, 100 - lulaPct).toFixed(2)) : 0;

      const base2022 = REGIAO_2022_BASELINE[regiao];
      const deltaLula = Number((lulaPct - base2022.lula2022).toFixed(1));

      return {
        regiao,
        totalSecoes,
        secoesApuradas,
        secoesRestantes,
        secoesPct,
        totalVotosValidos,
        lulaPct,
        lulaVotos,
        bolsonaroPct,
        bolsonaroVotos,
        lula2022: base2022.lula2022,
        bolso2022: base2022.bolso2022,
        deltaLula
      };
    });
  }, [ufs]);

  const sortedUFs = useMemo(() => {
    if (!ufs || ufs.length === 0) return [];
    const copy = [...ufs];
    if (sortMode === 'faltam') {
      copy.sort((a, b) => (b.totalSecoes - b.secoesApuradas) - (a.totalSecoes - a.secoesApuradas));
    } else if (sortMode === 'apurado') {
      copy.sort((a, b) => (b.secoesTotalizadasPct - a.secoesTotalizadasPct) || (b.totalSecoes - a.totalSecoes));
    } else {
      copy.sort((a, b) => b.totalSecoes - a.totalSecoes);
    }
    return copy;
  }, [ufs, sortMode]);

  if (!ufs || ufs.length === 0) return null;

  const visibleUFs = showAllUFs ? sortedUFs : sortedUFs.slice(0, 12);

  return (
    <section className="py-8 sm:py-10 border-b border-[var(--border)]">
      {/* Cabeçalho Editorial da Seção Regional */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h3 className="font-semibold text-lg tracking-tight text-[var(--fg)]">
            Apuração por Região e Estado
          </h3>
          <p className="text-xs text-[var(--fg-muted)]">
            Desempenho regional em 2026 comparado ao resultado oficial do 2º turno de 2022
          </p>
        </div>

        {/* Seletor de Ordenação das UFs */}
        <div
          role="group"
          aria-label="Ordenar estados por"
          className="flex items-center gap-1 text-xs font-mono text-[var(--fg-muted)]"
        >
          <span className="text-[11px] text-[var(--fg-subtle)] mr-1">ordenar:</span>
          <button
            type="button"
            onClick={() => setSortMode('volume')}
            className={`px-2 py-1 rounded transition-colors text-[11px] cursor-pointer ${
              sortMode === 'volume'
                ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                : 'hover:text-[var(--fg)]'
            }`}
          >
            eleitorado
          </button>
          <span className="text-[var(--border)]">/</span>
          <button
            type="button"
            onClick={() => setSortMode('faltam')}
            className={`px-2 py-1 rounded transition-colors text-[11px] cursor-pointer ${
              sortMode === 'faltam'
                ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                : 'hover:text-[var(--fg)]'
            }`}
          >
            urnas restantes
          </button>
          <span className="text-[var(--border)]">/</span>
          <button
            type="button"
            onClick={() => setSortMode('apurado')}
            className={`px-2 py-1 rounded transition-colors text-[11px] cursor-pointer ${
              sortMode === 'apurado'
                ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                : 'hover:text-[var(--fg)]'
            }`}
          >
            % apurado
          </button>
        </div>
      </div>

      {/* 1. Cards das 6 Macro-Regiões (Layout Cabo de Guerra sem quebra de linha + Comparação 2022) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {regioesSummary.map(r => {
          const hasVotes = r.totalVotosValidos > 0;
          const displayLulaPct = hasVotes ? r.lulaPct : r.lula2022;

          return (
            <div
              key={r.regiao}
              className="p-4 rounded border border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between gap-2.5"
            >
              {/* Linha 1: Nome da Região + % Apurado */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-sm text-[var(--fg)]">{r.regiao}</span>
                <span className="font-mono text-xs tabular-nums text-[var(--fg-muted)] whitespace-nowrap">
                  <strong className="text-[var(--fg)] font-medium">{r.secoesPct.toFixed(2)}%</strong> apurado
                </span>
              </div>

              {/* Linha 2: Placar 2026 em Linha Dedicada (Zero Transbordamento) */}
              <div className="flex items-baseline justify-between gap-2 font-mono text-xs tabular-nums">
                {hasVotes ? (
                  <>
                    <span className="whitespace-nowrap">
                      <span className="font-sans text-[var(--fg-muted)]">Lula</span>{' '}
                      <strong className="font-semibold" style={{ color: 'var(--color-pt)' }}>
                        {r.lulaPct.toFixed(1)}%
                      </strong>
                    </span>
                    <span className="whitespace-nowrap">
                      <strong className="font-semibold" style={{ color: 'var(--color-pl)' }}>
                        {r.bolsonaroPct.toFixed(1)}%
                      </strong>{' '}
                      <span className="font-sans text-[var(--fg-muted)]">Flávio</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap text-[var(--fg-subtle)]">Lula 0.0%</span>
                    <span className="whitespace-nowrap text-[var(--fg-subtle)]">0.0% Flávio</span>
                  </>
                )}
              </div>

              {/* Linha 3: Barra Cabo de Guerra Proporcional */}
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-[2px]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${displayLulaPct}%`,
                    backgroundColor: 'var(--color-pt)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
                <div
                  className="h-full transition-all duration-500 flex-1"
                  style={{
                    backgroundColor: 'var(--color-pl)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
              </div>

              {/* Linha 4: Comparativo 2022 + Variação / Seções */}
              <div className="pt-0.5 flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--fg-subtle)]">
                <span className="whitespace-nowrap">
                  2022: L {r.lula2022.toFixed(1)}% · B {r.bolso2022.toFixed(1)}%
                </span>
                {hasVotes ? (
                  <span
                    className="whitespace-nowrap font-medium"
                    style={{
                      color:
                        Math.abs(r.deltaLula) < 0.05
                          ? 'var(--fg-subtle)'
                          : r.deltaLula > 0
                          ? 'var(--color-pt)'
                          : 'var(--color-pl)'
                    }}
                  >
                    {Math.abs(r.deltaLula) < 0.05
                      ? '= 2022'
                      : r.deltaLula > 0
                      ? `+${r.deltaLula.toFixed(1)}% Lula vs 22`
                      : `+${Math.abs(r.deltaLula).toFixed(1)}% Flávio vs 22`}
                  </span>
                ) : (
                  <span className="whitespace-nowrap">
                    {r.totalSecoes.toLocaleString('pt-BR')} seções
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Grid Espaçado das 28 UFs (3 colunas no desktop para leitura limpa + Comparativo 2022) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5 font-mono text-xs">
        {visibleUFs.map(u => {
          const hasVotes = u.totalVotosValidos > 0;
          const base22 = UF_2022_BASELINE[u.uf] || { lula2022: 50, bolso2022: 50 };
          const deltaLula = Number((u.lulaPct - base22.lula2022).toFixed(1));
          const barLula = hasVotes ? u.lulaPct : base22.lula2022;

          return (
            <div
              key={u.uf}
              className="py-2.5 border-b border-[var(--border)] flex flex-col justify-between gap-1.5"
            >
              {/* Topo: Sigla + Nome do Estado | % Apurado */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-semibold text-[var(--fg)]">{u.uf}</span>
                  <span className="text-xs font-sans text-[var(--fg-muted)] truncate">{u.nome}</span>
                </div>
                <span className="tabular-nums text-[11px] text-[var(--fg-muted)] whitespace-nowrap shrink-0">
                  <strong className="text-[var(--fg)] font-medium">{u.secoesTotalizadasPct.toFixed(2)}%</strong> apurado
                </span>
              </div>

              {/* Barra fina 2px do Estado */}
              <div className="w-full h-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-[1px]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${barLula}%`,
                    backgroundColor: 'var(--color-pt)',
                    opacity: hasVotes ? 1 : 0.25
                  }}
                />
                <div
                  className="h-full transition-all duration-500 flex-1"
                  style={{
                    backgroundColor: 'var(--color-pl)',
                    opacity: hasVotes ? 1 : 0.25
                  }}
                />
              </div>

              {/* Base: Placar 2026 | Referência 2022 */}
              <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
                {hasVotes ? (
                  <span className="whitespace-nowrap">
                    <span style={{ color: 'var(--color-pt)' }} className="font-medium">
                      Lula {u.lulaPct.toFixed(1)}%
                    </span>
                    <span className="text-[var(--fg-subtle)]">{' · '}</span>
                    <span style={{ color: 'var(--color-pl)' }} className="font-medium">
                      Flávio {u.bolsonaroPct.toFixed(1)}%
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--fg-subtle)] whitespace-nowrap">Aguardando boletins</span>
                )}

                <span className="text-[var(--fg-subtle)] whitespace-nowrap">
                  {hasVotes ? (
                    <>
                      <span>22: {base22.lula2022.toFixed(1)}%</span>
                      {' ('}
                      <span
                        style={{
                          color:
                            Math.abs(deltaLula) < 0.05
                              ? 'var(--fg-subtle)'
                              : deltaLula > 0
                              ? 'var(--color-pt)'
                              : 'var(--color-pl)'
                        }}
                      >
                        {deltaLula >= 0 ? `+${deltaLula.toFixed(1)}% L` : `+${Math.abs(deltaLula).toFixed(1)}% B`}
                      </span>
                      {')'}
                    </>
                  ) : (
                    <span>
                      2022: L {base22.lula2022.toFixed(1)}% · B {base22.bolso2022.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para expandir/recolher todas as 28 UFs */}
      {sortedUFs.length > 12 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAllUFs(prev => !prev)}
            className="text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] underline hover:no-underline cursor-pointer py-1 px-3"
          >
            {showAllUFs
              ? 'Recolher lista de estados (mostrar top 12)'
              : `Ver todas as 28 UFs (${sortedUFs.length - 12} estados adicionais)`}
          </button>
        </div>
      )}
    </section>
  );
}
