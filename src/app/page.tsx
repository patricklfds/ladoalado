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
    isAtualizando,
    timeline2022,
    recarregarAgora
  } = useElectionData();

  const isDemo = estado2026?.origem.includes('demo');

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

        {/* Gráfico de Trajetória SVG Minimalista */}
        <TrajectoryChart
          timeline2022={timeline2022}
          currentPct2026={estado2026?.secoesTotalizadasPct || 0}
          cand1Pct2026={estado2026?.candidatos.find(c => c.nome.includes('LULA'))?.percentual || estado2026?.candidatos[0]?.percentual}
          cand2Pct2026={estado2026?.candidatos.find(c => c.nome.includes('BOLSONARO'))?.percentual || estado2026?.candidatos[1]?.percentual}
          cand1Pct2022={estado2022?.candidatos.find(c => c.nome.includes('LULA'))?.percentual}
          cand2Pct2022={estado2022?.candidatos.find(c => c.nome.includes('BOLSONARO'))?.percentual}
        />

        {/* Demais Candidatos em Lista Tabular Limpa */}
        <OtherCandidates
          candidatos2026={estado2026?.candidatos || []}
          candidatos2022={estado2022?.candidatos || []}
        />

        {/* Rodapé Silencioso */}
        <Footer
          timestampISO={estado2026?.dataHoraISO}
          origem={estado2026?.origem}
        />
      </main>
    </div>
  );
}
