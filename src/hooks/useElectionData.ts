'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ElectionState,
  TimelinePoint2022,
  ComparisonMode,
  ComparisonData
} from '@/lib/types';
import {
  point2022ToElectionState,
  interpolateByUrnas,
  findByTime,
  calculatePaceDifferenceMinutes
} from '@/lib/comparator';

const POLLING_INTERVAL_SECONDS = 60;

export function useElectionData() {
  const [modo, setModo] = useState<ComparisonMode>('urnas');
  const [timeline2022, setTimeline2022] = useState<TimelinePoint2022[]>([]);
  const [estado2026, setEstado2026] = useState<ElectionState | null>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(POLLING_INTERVAL_SECONDS);
  const [isCarregando, setIsCarregando] = useState<boolean>(true);
  const [isAtualizando, setIsAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pontosSessao2026, setPontosSessao2026] = useState<Array<{ tempo: string; pct: number; lulaPct: number; oposicaoPct: number }>>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  // 1. Carregar o arquivo estático de 2022 na inicialização
  useEffect(() => {
    async function load2022() {
      try {
        const res = await fetch('/data/2022-timeline.json');
        if (!res.ok) throw new Error('Falha ao carregar timeline 2022');
        const data: TimelinePoint2022[] = await res.json();
        setTimeline2022(data);
      } catch (e) {
        console.error('Erro ao carregar dados de 2022:', e);
      }
    }
    load2022();
  }, []);

  // 2. Função de busca de dados do TSE (2026) - Estável, sem dependência de estado2026
  const fetch2026Data = useCallback(async (isManual: boolean = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAtualizando(true);
    if (!hasLoadedRef.current) {
      setIsCarregando(true);
    }

    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 400));

    try {
      // Verificar se a URL possui flag ?demo=true
      const isDemoUrl = typeof window !== 'undefined' && window.location.search.includes('demo=true');
      const url = isDemoUrl ? '/api/tse?demo=true' : '/api/tse';

      const [res] = await Promise.all([
        fetch(url, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        }),
        minDelayPromise
      ]);

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data: ElectionState = await res.json();
      setEstado2026(data);
      hasLoadedRef.current = true;
      setErro(null);

      // Registrar ponto de sessão para o gráfico Sparkline
      const cand1Pct = data.candidatos[0]?.percentual || 0;
      const cand2Pct = data.candidatos[1]?.percentual || 0;
      setPontosSessao2026(prev => {
        const novoPonto = {
          tempo: data.timestamp.slice(0, 5),
          pct: data.secoesTotalizadasPct,
          lulaPct: cand1Pct,
          oposicaoPct: cand2Pct
        };
        if (prev.length > 0 && prev[prev.length - 1].tempo === novoPonto.tempo) {
          const updated = [...prev];
          updated[updated.length - 1] = novoPonto;
          return updated;
        }
        return [...prev, novoPonto];
      });

      // Reiniciar o contador de 60s
      setTempoRestante(POLLING_INTERVAL_SECONDS);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Erro ao sincronizar dados de 2026:', err);
        setErro('Falha temporária ao comunicar com o servidor do TSE.');
      }
    } finally {
      setIsAtualizando(false);
      setIsCarregando(false);
    }
  }, []);

  const fetch2026DataRef = useRef(fetch2026Data);
  fetch2026DataRef.current = fetch2026Data;

  // 3. Inicializar polling e contador decrescente segundo a segundo (executa apenas uma vez no mount)
  useEffect(() => {
    fetch2026DataRef.current(false);

    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          fetch2026DataRef.current(false);
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // 4. Calcular o estado comparativo de 2022 sincronizado
  let matching2022State: ElectionState | null = null;
  let deltaLider = 0;
  let deltaSegundo = 0;
  let deltaLula = 0;
  let deltaOposicao = 0;
  let margem2026 = 0;
  let margem2022 = 0;
  let ritmoMinutos = 0;

  if (estado2026 && timeline2022.length > 0) {
    let point2022: TimelinePoint2022;

    if (modo === 'urnas') {
      // Interpolação matemática exata: 2022 terá exatamente o mesmo % de urnas de 2026!
      point2022 = interpolateByUrnas(timeline2022, estado2026.secoesTotalizadasPct);
    } else {
      point2022 = findByTime(timeline2022, estado2026.timestamp.slice(0, 5));
    }

    matching2022State = point2022ToElectionState(point2022);
    ritmoMinutos = calculatePaceDifferenceMinutes(estado2026.timestamp, point2022);

    // Candidatos 1º e 2º colocados de cada ano
    const c1_2026 = estado2026.candidatos[0]?.percentual || 0;
    const c2_2026 = estado2026.candidatos[1]?.percentual || 0;
    const c1_2022 = matching2022State.candidatos[0]?.percentual || 0;
    const c2_2022 = matching2022State.candidatos[1]?.percentual || 0;

    deltaLider = Number((c1_2026 - c1_2022).toFixed(2));
    deltaSegundo = Number((c2_2026 - c2_2022).toFixed(2));

    margem2026 = Number((c1_2026 - c2_2026).toFixed(2));
    margem2022 = Number((c1_2022 - c2_2022).toFixed(2));

    // Comparação nominal direta: Lula 2026 vs Lula 2022 e Oposição 2026 vs Bolsonaro 2022
    const lula2026 = estado2026.candidatos.find(c => c.nome.includes('LULA'))?.percentual || c1_2026;
    const lula2022 = matching2022State.candidatos.find(c => c.nome.includes('LULA'))?.percentual || point2022.lulaPct;
    deltaLula = Number((lula2026 - lula2022).toFixed(2));

    const opo2026 = estado2026.candidatos.find(c => !c.nome.includes('LULA') && c.posicao <= 2)?.percentual || c2_2026;
    const bolso2022 = matching2022State.candidatos.find(c => c.nome.includes('BOLSONARO'))?.percentual || point2022.bolsonaroPct;
    deltaOposicao = Number((opo2026 - bolso2022).toFixed(2));
  }

  return {
    modo,
    setModo,
    estado2026,
    estado2022: matching2022State,
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
    pontosSessao2026,
    recarregarAgora: () => fetch2026Data(true)
  };
}
