'use client';

import React, { useState, useMemo } from 'react';
import type { UFResult, MacroRegiao } from '@/lib/types';
import { get2022UFBaseline, get2022RegiaoBaseline } from '@/lib/historicalUFs2022';

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

export function StateBreakdown({ ufs }: StateBreakdownProps) {
  const [sortMode, setSortMode] = useState<SortMode>('volume');
  const [showAllUFs, setShowAllUFs] = useState<boolean>(false);
  const [selectedRegiao, setSelectedRegiao] = useState<MacroRegiao | null>(null);

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

      const base2022 = get2022RegiaoBaseline(regiao, secoesPct);
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
    const filtered = selectedRegiao ? ufs.filter(u => u.regiao === selectedRegiao) : [...ufs];
    if (sortMode === 'faltam') {
      filtered.sort((a, b) => (b.totalSecoes - b.secoesApuradas) - (a.totalSecoes - a.secoesApuradas));
    } else if (sortMode === 'apurado') {
      filtered.sort((a, b) => (b.secoesTotalizadasPct - a.secoesTotalizadasPct) || (b.totalSecoes - a.totalSecoes));
    } else {
      filtered.sort((a, b) => b.totalSecoes - a.totalSecoes);
    }
    return filtered;
  }, [ufs, sortMode, selectedRegiao]);

  if (!ufs || ufs.length === 0) return null;

  const visibleUFs = selectedRegiao || showAllUFs ? sortedUFs : sortedUFs.slice(0, 12);

  return (
    <section className="py-8 sm:py-11 border-b border-[var(--border)]">
      {/* Cabeçalho Editorial da Seção Regional */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-7">
        <div>
          <h3 className="font-semibold text-lg sm:text-xl tracking-[-0.025em] text-[var(--fg)]">
            Apuração por Região e Estado
          </h3>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Placar regional de 2026 e variação na mesma % de apuração do 2º turno de 2022
          </p>
        </div>

        {/* Seletor de Ordenação das UFs */}
        <div
          role="group"
          aria-label="Ordenar estados por"
          className="flex flex-wrap items-center gap-1 text-xs font-mono text-[var(--fg-muted)]"
        >
          {selectedRegiao && (
            <>
              <button
                type="button"
                onClick={() => setSelectedRegiao(null)}
                className="px-2 py-1 rounded bg-[var(--accent)] text-[var(--fg)] font-semibold text-[11px] cursor-pointer mr-1"
              >
                {selectedRegiao} ×
              </button>
              <span className="text-[var(--border)] mr-1">|</span>
            </>
          )}
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mr-1">ordenar</span>
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

      {/* 1. Cards das 6 Macro-Regiões (Tipografia Editorial Limpa + Vantagem Relativa vs 2022) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-7 mb-10 pb-8 border-b border-[var(--border)]">
        {regioesSummary.map(r => {
          const hasVotes = r.totalVotosValidos > 0;
          const displayLulaPct = hasVotes ? r.lulaPct : r.lula2022;
          const lulaLeads = r.lulaPct >= r.bolsonaroPct;
          const isSelected = selectedRegiao === r.regiao;
          const isDimmed = selectedRegiao !== null && !isSelected;

          return (
            <button
              key={r.regiao}
              type="button"
              onClick={() => setSelectedRegiao(prev => (prev === r.regiao ? null : r.regiao))}
              className={`text-left flex flex-col justify-between space-y-2.5 transition-opacity cursor-pointer group ${
                isDimmed ? 'opacity-45 hover:opacity-80' : 'opacity-100'
              }`}
            >
              {/* Linha 1: Nome da Região + % Apurado */}
              <div className="flex items-baseline justify-between gap-2 w-full">
                <span className="font-semibold text-base tracking-[-0.02em] text-[var(--fg)] group-hover:underline decoration-[var(--border)] underline-offset-4">
                  {r.regiao}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--fg-subtle)] whitespace-nowrap">
                  {r.secoesPct.toFixed(2)}% apurado
                </span>
              </div>

              {/* Linha 2: Placar 2026 em Tipografia Neutra Editorial */}
              <div className="flex items-baseline justify-between gap-2 font-mono text-xs tabular-nums w-full">
                {hasVotes ? (
                  <>
                    <span className={`whitespace-nowrap ${lulaLeads ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)]'}`}>
                      <span className="font-sans">Lula</span> {r.lulaPct.toFixed(1)}%
                    </span>
                    <span className={`whitespace-nowrap ${!lulaLeads ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)]'}`}>
                      {r.bolsonaroPct.toFixed(1)}% <span className="font-sans">Flávio</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap text-[var(--fg-subtle)]">Lula 0.0%</span>
                    <span className="whitespace-nowrap text-[var(--fg-subtle)]">0.0% Flávio</span>
                  </>
                )}
              </div>

              {/* Linha 3: Barra Fina Editorial 2px com marcação central de 50% */}
              <div className="relative w-full h-[2px] bg-[var(--track)] rounded-full flex gap-[2px]">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${displayLulaPct}%`,
                    backgroundColor: 'var(--color-pt)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500 flex-1"
                  style={{
                    backgroundColor: 'var(--color-pl)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                />
              </div>

              {/* Linha 4: Apenas a Vantagem Relativa vs 2022 */}
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--fg-subtle)] w-full">
                <span>vs. 2º turno 2022</span>
                {hasVotes ? (
                  <span
                    title={`Em 2022 (${r.secoesPct.toFixed(1)}% apurado): Lula ${r.lula2022.toFixed(1)}% · Bolsonaro ${r.bolso2022.toFixed(1)}%`}
                    className="inline-flex items-center gap-1.5 text-[var(--fg-muted)] whitespace-nowrap cursor-help"
                  >
                    {Math.abs(r.deltaLula) >= 0.05 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: r.deltaLula > 0 ? 'var(--color-pt)' : 'var(--color-pl)'
                        }}
                      />
                    )}
                    <span>
                      {Math.abs(r.deltaLula) < 0.05
                        ? 'estável (0.0%)'
                        : r.deltaLula > 0
                        ? `+${r.deltaLula.toFixed(1)}% Lula`
                        : `+${Math.abs(r.deltaLula).toFixed(1)}% Flávio`}
                    </span>
                  </span>
                ) : (
                  <span>22: {r.lula2022.toFixed(1)}% · {r.bolso2022.toFixed(1)}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Grid Espaçado das 28 UFs (3 colunas limpas + Apenas Vantagem Relativa vs 2022) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-4 font-mono text-xs">
        {visibleUFs.map(u => {
          const hasVotes = u.totalVotosValidos > 0;
          const base22 = get2022UFBaseline(u.uf, u.secoesTotalizadasPct);
          const deltaLula = Number((u.lulaPct - base22.lula2022).toFixed(1));
          const barLula = hasVotes ? u.lulaPct : base22.lula2022;
          const lulaLeads = u.lulaPct >= u.bolsonaroPct;

          return (
            <div
              key={u.uf}
              className="pb-3.5 border-b border-[var(--border)] flex flex-col justify-between space-y-2"
            >
              {/* Topo: Sigla + Nome do Estado | % Apurado */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-semibold text-[var(--fg)]">{u.uf}</span>
                  <span className="text-xs font-sans text-[var(--fg-muted)] truncate">{u.nome}</span>
                </div>
                <span className="tabular-nums text-[11px] text-[var(--fg-subtle)] whitespace-nowrap shrink-0">
                  {u.secoesTotalizadasPct.toFixed(2)}%
                </span>
              </div>

              {/* Barra fina 2px do Estado com marcação central de 50% */}
              <div className="relative w-full h-[2px] bg-[var(--track)] rounded-full flex gap-[1px]">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${barLula}%`,
                    backgroundColor: 'var(--color-pt)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500 flex-1"
                  style={{
                    backgroundColor: 'var(--color-pl)',
                    opacity: hasVotes ? 1 : 0.3
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 -top-[2px] h-[6px] w-[1px] bg-[var(--fg-subtle)] opacity-40 pointer-events-none"
                />
              </div>

              {/* Base: Placar 2026 em tipografia neutra | Apenas Vantagem Relativa vs 2022 */}
              <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
                {hasVotes ? (
                  <span className="whitespace-nowrap text-[var(--fg-muted)]">
                    <span className={lulaLeads ? 'text-[var(--fg)] font-medium' : ''}>
                      Lula {u.lulaPct.toFixed(1)}%
                    </span>
                    <span className="text-[var(--fg-subtle)]">{' · '}</span>
                    <span className={!lulaLeads ? 'text-[var(--fg)] font-medium' : ''}>
                      Flávio {u.bolsonaroPct.toFixed(1)}%
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--fg-subtle)] whitespace-nowrap">0.0% · 0.0%</span>
                )}

                {hasVotes ? (
                  <span
                    title={`Em 2022 (${u.secoesTotalizadasPct.toFixed(1)}% apurado): Lula ${base22.lula2022.toFixed(1)}% · Bolsonaro ${base22.bolso2022.toFixed(1)}%`}
                    className="inline-flex items-center gap-1 text-[var(--fg-subtle)] whitespace-nowrap cursor-help"
                  >
                    {Math.abs(deltaLula) >= 0.05 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: deltaLula > 0 ? 'var(--color-pt)' : 'var(--color-pl)'
                        }}
                      />
                    )}
                    <span>
                      {Math.abs(deltaLula) < 0.05
                        ? '0.0% vs 22'
                        : deltaLula > 0
                        ? `+${deltaLula.toFixed(1)}% Lula`
                        : `+${Math.abs(deltaLula).toFixed(1)}% Flávio`}
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--fg-subtle)] whitespace-nowrap">
                    22: {base22.lula2022.toFixed(1)}% · {base22.bolso2022.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para expandir/recolher todas as 28 UFs */}
      {!selectedRegiao && sortedUFs.length > 12 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAllUFs(prev => !prev)}
            className="text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] underline hover:no-underline cursor-pointer py-1.5 px-3"
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
