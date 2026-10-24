'use client';

import React, { useState, useMemo } from 'react';
import type { UFResult, MacroRegiao } from '@/lib/types';

interface StateBreakdownProps {
  ufs?: UFResult[];
  secoesAdiantadasUF?: number;
  votosAdiantadosUF?: number;
  origem?: string;
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

export function StateBreakdown({
  ufs,
  secoesAdiantadasUF = 0,
  votosAdiantadosUF = 0,
  origem
}: StateBreakdownProps) {
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
        bolsonaroVotos
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
      {/* Cabeçalho Editorial da Seção Multi-UF */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-lg tracking-tight text-[var(--fg)]">
              Apuração Direta por Região e Estado
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--fg-muted)]">
              27 UFs + Exterior
            </span>
            {secoesAdiantadasUF > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                +{secoesAdiantadasUF.toLocaleString('pt-BR')} urnas à frente do consolidado nacional
                {votosAdiantadosUF > 0 ? ` (+${votosAdiantadosUF.toLocaleString('pt-BR')} votos)` : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Leitura direta dos arquivos regionais de cada TRE no CDN do TSE ({origem === 'tse-uf-turbo' ? 'soma direta Multi-UF ativa' : 'sincronizado'})
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

      {/* 1. Resumo das Macro-Regiões (Onde estão e onde faltam os votos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {regioesSummary.map(r => (
          <div
            key={r.regiao}
            className="p-3.5 rounded border border-[var(--border)] bg-[var(--surface)] space-y-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-sm text-[var(--fg)]">{r.regiao}</span>
              <span className="font-mono text-xs tabular-nums text-[var(--fg)] font-medium">
                {r.secoesPct.toFixed(2)}% <span className="text-[var(--fg-subtle)] font-normal">apurado</span>
              </span>
            </div>

            {/* Barra de divisão regional Lula vs Bolsonaro */}
            <div className="w-full h-[3px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
              {r.totalVotosValidos > 0 ? (
                <>
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${r.lulaPct}%`, backgroundColor: 'var(--color-pt)' }}
                  />
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${r.bolsonaroPct}%`, backgroundColor: 'var(--color-pl)' }}
                  />
                </>
              ) : (
                <div
                  className="h-full bg-[var(--fg-subtle)] opacity-30"
                  style={{ width: `${r.secoesPct}%` }}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
              {r.totalVotosValidos > 0 ? (
                <span className="text-[var(--fg-muted)]">
                  <strong style={{ color: 'var(--color-pt)' }}>Lula {r.lulaPct.toFixed(1)}%</strong>
                  {' · '}
                  <strong style={{ color: 'var(--color-pl)' }}>Flávio {r.bolsonaroPct.toFixed(1)}%</strong>
                </span>
              ) : (
                <span className="text-[var(--fg-subtle)]">Aguardando boletins</span>
              )}
              <span className="text-[var(--fg-subtle)]">
                {r.secoesRestantes > 0
                  ? `faltam ${r.secoesRestantes.toLocaleString('pt-BR')} seções`
                  : '100% totalizado'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Grid Compacto das 28 UFs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 font-mono text-xs">
        {visibleUFs.map(u => {
          const restantes = Math.max(0, u.totalSecoes - u.secoesApuradas);
          const hasVotes = u.totalVotosValidos > 0;
          return (
            <div
              key={u.uf}
              className="py-2 border-b border-[var(--border)] flex flex-col justify-between gap-1"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-semibold text-[var(--fg)]">{u.uf}</span>
                  <span className="text-[11px] font-sans text-[var(--fg-muted)] truncate">{u.nome}</span>
                </div>
                <span className="tabular-nums text-[11px] text-[var(--fg)] font-medium shrink-0">
                  {u.secoesTotalizadasPct.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] tabular-nums text-[var(--fg-subtle)]">
                {hasVotes ? (
                  <span>
                    <span style={{ color: 'var(--color-pt)' }} className="font-medium">
                      L {u.lulaPct.toFixed(1)}%
                    </span>
                    {' · '}
                    <span style={{ color: 'var(--color-pl)' }} className="font-medium">
                      B {u.bolsonaroPct.toFixed(1)}%
                    </span>
                  </span>
                ) : (
                  <span>0,0% vs 0,0%</span>
                )}
                <span>
                  {restantes > 0 ? `-${restantes.toLocaleString('pt-BR')} urnas` : `100% · ${u.timestamp.slice(0, 5)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão para expandir/recolher todas as 28 UFs */}
      {sortedUFs.length > 12 && (
        <div className="mt-4 text-center">
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
