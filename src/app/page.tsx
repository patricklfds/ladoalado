'use client';

import React from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { Masthead } from '@/components/Masthead';
import { LiveCycleBar } from '@/components/LiveCycleBar';
import { CountingGauge } from '@/components/CountingGauge';
import { ArenaLadoALado } from '@/components/ArenaLadoALado';
import { SecondaryTable } from '@/components/SecondaryTable';
import { SparklineChart } from '@/components/SparklineChart';
import { EditorialFooter } from '@/components/EditorialFooter';

export default function HomePage() {
  const {
    modo,
    setModo,
    estado2026,
    estado2022,
    deltaLider,
    deltaSegundo,
    ritmoMinutos,
    tempoRestante,
    isAtualizando,
    erro,
    timeline2022,
    pontosSessao2026,
    recarregarAgora
  } = useElectionData();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Masthead Editorial */}
      <Masthead
        modo={modo}
        setModo={setModo}
        statusOrigem={estado2026?.origem}
      />

      {/* 2. Barra de Ciclo de 60s com Countdown */}
      <LiveCycleBar
        tempoRestante={tempoRestante}
        totalSegundos={60}
        isAtualizando={isAtualizando}
        horarioUltimaAtualizacao={estado2026?.timestamp}
        recarregarAgora={recarregarAgora}
        erro={erro}
      />

      {/* 3. Termômetro Geral da Totalização de Urnas */}
      <CountingGauge
        estado2026={estado2026}
        estado2022={estado2022}
        modo={modo}
        ritmoMinutos={ritmoMinutos}
      />

      {/* 4. Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">
        {/* Arena Lado a Lado dos Líderes */}
        <ArenaLadoALado
          estado2026={estado2026}
          estado2022={estado2022}
          modo={modo}
          deltaLider={deltaLider}
          deltaSegundo={deltaSegundo}
        />

        {/* Gráfico Sparkline de Trajetória */}
        <SparklineChart
          timeline2022={timeline2022}
          pontosSessao2026={pontosSessao2026}
          currentPct2026={estado2026?.secoesTotalizadasPct || 0}
        />

        {/* Tabela dos Demais Candidatos */}
        <SecondaryTable
          candidatos2026={estado2026?.candidatos || []}
          candidatos2022={estado2022?.candidatos || []}
        />
      </main>

      {/* 5. Rodapé Editorial de Transparência */}
      <EditorialFooter
        origemDados={estado2026?.origem}
        dataHoraISO={estado2026?.dataHoraISO}
      />
    </div>
  );
}
