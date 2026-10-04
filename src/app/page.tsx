'use client';

import React from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { Header } from '@/components/Header';
import { ProgressHeader } from '@/components/ProgressHeader';
import { ComparisonArena } from '@/components/ComparisonArena';
import { TrajectoryChart } from '@/components/TrajectoryChart';
import { OtherCandidates } from '@/components/OtherCandidates';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const {
    modo,
    setModo,
    estado2026,
    estado2022,
    deltaLider,
    deltaSegundo,
    deltaLula,
    deltaOposicao,
    margem2026,
    margem2022,
    ritmoMinutos,
    tempoRestante,
    isCarregando,
    isAtualizando,
    erro,
    timeline2022,
    timeline2026,
    recarregarAgora
  } = useElectionData();

  const isDemo = estado2026?.origem.includes('demo');
  const cands2026 = [...(estado2026?.candidatos || [])].sort((a, b) => b.percentual - a.percentual);
  const secoesPct = estado2026?.secoesTotalizadasPct ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] selection:bg-[var(--fg)] selection:text-[var(--bg)]">
      {/* 1. Header Minimalista */}
      <Header
        modo={modo}
        setModo={setModo}
        timestamp2026={estado2026?.timestamp.slice(0, 5)}
        tempoRestante={tempoRestante}
        isAtualizando={isAtualizando}
        recarregarAgora={recarregarAgora}
        isDemo={isDemo}
      />

      {/* 2. Conteúdo Centralizado com Amplo Respiro Editorial */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6">
        {/* Banner Sutil de Falha Temporária ou Conexão com TSE */}
        {erro && (
          <div
            role="alert"
            className="my-4 px-3.5 py-2.5 rounded border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-900 dark:text-amber-200"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{erro} Exibindo últimos dados registrados.</span>
            </div>
            <button
              type="button"
              onClick={() => recarregarAgora()}
              className="underline hover:no-underline font-semibold text-left sm:text-right cursor-pointer"
            >
              Tentar reconectar
            </button>
          </div>
        )}

        {/* Aviso Prévio às 17h quando a apuração ainda não começou */}
        {!isCarregando && estado2026 && secoesPct === 0 && (
          <div className="my-4 px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--fg-muted)] flex items-center justify-between gap-2">
            <span>
              ℹ️ Urnas fechadas às 17h00. Aguardando transmissão dos primeiros boletins oficiais pelo TSE.
            </span>
          </div>
        )}

        {/* Skeleton de Carregamento Inicial Limpo */}
        {isCarregando && !estado2026 ? (
          <div className="py-20 text-center space-y-4 font-mono text-xs text-[var(--fg-muted)]">
            <div className="inline-block w-6 h-6 border-2 border-[var(--border)] border-t-[var(--fg)] rounded-full animate-spin" />
            <p>Conectando à base de dados eleitorais...</p>
          </div>
        ) : (
          <>
            {/* Termômetro Geral Linear */}
            <ProgressHeader
              estado2026={estado2026}
              estado2022={estado2022}
              modo={modo}
              ritmoMinutos={ritmoMinutos}
            />

            {/* Arena Principal Lado a Lado */}
            <ComparisonArena
              estado2026={estado2026}
              estado2022={estado2022}
              modo={modo}
              deltaLider={deltaLider}
              deltaSegundo={deltaSegundo}
              deltaLula={deltaLula}
              deltaOposicao={deltaOposicao}
              margem2026={margem2026}
              margem2022={margem2022}
            />

            {/* Gráfico de Trajetória SVG 100% Dinâmico */}
            <TrajectoryChart
              timeline2022={timeline2022}
              timeline2026={timeline2026}
              currentPct2026={secoesPct}
              cand1={cands2026[0]}
              cand2={cands2026[1]}
            />

            {/* Demais Candidatos em Lista Tabular Limpa */}
            <OtherCandidates
              candidatos2026={estado2026?.candidatos || []}
              candidatos2022={estado2022?.candidatos || []}
            />
          </>
        )}

        {/* Rodapé Silencioso */}
        <Footer
          timestampISO={estado2026?.dataHoraISO}
          origem={estado2026?.origem}
        />
      </main>
    </div>
  );
}
