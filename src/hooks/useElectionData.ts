'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ElectionState,
  TimelinePoint2022,
  TimelinePoint2026,
  ComparisonMode,
  UFResult
} from '@/lib/types';
import {
  point2022ToElectionState,
  interpolateByUrnas,
  findByTime,
  calculatePaceDifferenceMinutes
} from '@/lib/comparator';

const POLLING_INTERVAL_SECONDS = 5;
const STORAGE_KEY_2026_2T = 'ladoalado_timeline_2026_2t';
const LEGACY_STORAGE_KEY_1T = 'ladoalado_timeline_2026';

function computeClientPrecisePct(secoesApuradas: number, totalSecoes: number, totalVotosValidos: number): number {
  if (totalSecoes <= 0 || (secoesApuradas <= 0 && totalVotosValidos <= 0)) return 0;
  if (secoesApuradas >= totalSecoes) return 100;
  const rounded = Number(((secoesApuradas / totalSecoes) * 100).toFixed(2));
  if (rounded <= 0) return 0.01;
  if (rounded >= 100) return 99.99;
  return rounded;
}

/**
 * Fusão monotônica no cliente (High-Water Mark por UF + Nacional):
 * Garante que mesmo quando requisições consecutivas caem em diferentes instâncias serverless
 * da Vercel ou diferentes nós de borda da Akamai, o navegador do usuário preserve o estado
 * mais avançado de cada uma das 28 UFs e nunca retroceda nenhum voto ou seção.
 */
function mergeMonotonicElectionState(prev: ElectionState | null, incoming: ElectionState): ElectionState {
  if (!prev) return incoming;
  if (prev.origem.includes('demo') || incoming.origem.includes('demo')) {
    return incoming;
  }

  // Se o TSE realizou zerésima (todos os dados voltaram a 0), aceitar o reset limpo
  if (incoming.secoesApuradas === 0 && incoming.totalVotosValidos === 0) {
    const allIncomingUFsZero = !incoming.ufs || incoming.ufs.every(u => u.secoesApuradas === 0);
    if (allIncomingUFsZero) return incoming;
  }

  // 1. Fundir as 28 UFs preservando o snapshot mais avançado de cada estado
  let mergedUFs: UFResult[] | undefined = incoming.ufs;
  if (prev.ufs && prev.ufs.length > 0 && incoming.ufs && incoming.ufs.length > 0) {
    const prevMap = new Map<string, UFResult>(prev.ufs.map(u => [u.uf, u]));
    mergedUFs = incoming.ufs.map(incUF => {
      const oldUF = prevMap.get(incUF.uf);
      if (!oldUF) return incUF;
      if (
        incUF.secoesApuradas > oldUF.secoesApuradas ||
        (incUF.secoesApuradas === oldUF.secoesApuradas && incUF.totalVotosValidos >= oldUF.totalVotosValidos)
      ) {
        return incUF;
      }
      return oldUF;
    });
  }

  // 2. Verificar se o somatório das 28 UFs fundidas no cliente supera o total nacional recebido
  if (mergedUFs && mergedUFs.length === 28) {
    const sumTotalSecoes = mergedUFs.reduce((acc, u) => acc + u.totalSecoes, 0);
    const sumSecoesApuradas = mergedUFs.reduce((acc, u) => acc + u.secoesApuradas, 0);
    const sumVotosValidos = mergedUFs.reduce((acc, u) => acc + u.totalVotosValidos, 0);

    if (
      sumSecoesApuradas > incoming.secoesApuradas ||
      (sumSecoesApuradas === incoming.secoesApuradas && sumVotosValidos > incoming.totalVotosValidos)
    ) {
      const sumLulaVotos = mergedUFs.reduce((acc, u) => acc + u.lulaVotos, 0);
      const sumBolsoVotos = mergedUFs.reduce((acc, u) => acc + u.bolsonaroVotos, 0);

      const updatedCands = incoming.candidatos.map(c => {
        const upper = c.nome.toUpperCase();
        const isLula = c.numero === '13' || upper.includes('LULA');
        const isBolso = c.numero === '22' || upper.includes('BOLSONARO');
        const votos = isLula ? Math.max(c.votos, sumLulaVotos) : isBolso ? Math.max(c.votos, sumBolsoVotos) : c.votos;
        const percentual = sumVotosValidos > 0 ? Number(((votos / sumVotosValidos) * 100).toFixed(2)) : 0;
        return { ...c, votos, percentual };
      });

      updatedCands.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
      updatedCands.forEach((c, idx) => {
        c.posicao = idx + 1;
      });
      if (updatedCands.length === 2 && sumVotosValidos > 0) {
        updatedCands[1].percentual = Number(Math.max(0, 100 - updatedCands[0].percentual).toFixed(2));
      }

      const secoesTotalizadasPct = computeClientPrecisePct(sumSecoesApuradas, sumTotalSecoes, sumVotosValidos);
      const status =
        sumSecoesApuradas >= sumTotalSecoes && sumTotalSecoes > 0
          ? 'finalizada'
          : secoesTotalizadasPct > 0
            ? 'em_andamento'
            : 'aguardando';

      return {
        ...incoming,
        status,
        secoesTotalizadasPct,
        totalSecoes: sumTotalSecoes,
        secoesApuradas: sumSecoesApuradas,
        totalVotosValidos: sumVotosValidos,
        candidatos: updatedCands,
        ufs: mergedUFs,
        secoesAdiantadasUF:
          (incoming.secoesAdiantadasUF ?? 0) + Math.max(0, sumSecoesApuradas - incoming.secoesApuradas),
        votosAdiantadosUF:
          (incoming.votosAdiantadosUF ?? 0) + Math.max(0, sumVotosValidos - incoming.totalVotosValidos)
      };
    }
  }

  // 3. Se o estado nacional anterior já era mais avançado que o incoming, manter o anterior com dataHoraISO e polymarket atualizados
  if (
    prev.secoesApuradas > incoming.secoesApuradas ||
    (prev.secoesApuradas === incoming.secoesApuradas && prev.totalVotosValidos > incoming.totalVotosValidos)
  ) {
    return {
      ...prev,
      dataHoraISO: incoming.dataHoraISO,
      polymarket: incoming.polymarket || prev.polymarket,
      ufs: mergedUFs || prev.ufs
    };
  }

  return {
    ...incoming,
    polymarket: incoming.polymarket || prev.polymarket,
    ufs: mergedUFs
  };
}

export function useElectionData() {
  const [modo, setModo] = useState<ComparisonMode>('urnas');
  const [timeline2022, setTimeline2022] = useState<TimelinePoint2022[]>([]);
  const [timeline2026, setTimeline2026] = useState<TimelinePoint2026[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY_1T);
        const saved = localStorage.getItem(STORAGE_KEY_2026_2T);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Ignorar erros de storage
      }
    }
    return [];
  });
  const [estado2026, setEstado2026] = useState<ElectionState | null>(null);
  const [tempoRestante, setTempoRestante] = useState<number>(POLLING_INTERVAL_SECONDS);
  const [isCarregando, setIsCarregando] = useState<boolean>(true);
  const [isAtualizando, setIsAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pontosSessao2026, setPontosSessao2026] = useState<
    Array<{ tempo: string; pct: number; lulaPct: number; oposicaoPct: number }>
  >([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const lastFetchStartMsRef = useRef<number>(0);
  const latestStateRef = useRef<ElectionState | null>(null);
  const polymarketHistoryRef = useRef<Array<{ timestampMs: number; lulaPct: number; bolsonaroPct: number }>>([]);

  // 1. Carregar o arquivo estático de 2022 (2º Turno) na inicialização
  useEffect(() => {
    async function load2022() {
      try {
        const res = await fetch('/data/2022-timeline.json?v=2t');
        if (!res.ok) throw new Error('Falha ao carregar timeline 2022');
        const data: TimelinePoint2022[] = await res.json();
        setTimeline2022(data);
      } catch (e) {
        console.error('Erro ao carregar dados de 2022:', e);
      }
    }
    load2022();
  }, []);

  // 2. Função de busca de dados do TSE (2026)
  const fetch2026Data = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastFetchStartMsRef.current = Date.now();

    await Promise.resolve();
    setIsAtualizando(true);
    if (!hasLoadedRef.current) {
      setIsCarregando(true);
    }

    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 120));

    try {
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      const baseApiUrl = currentSearch ? `/api/tse${currentSearch}` : '/api/tse';
      const sep = baseApiUrl.includes('?') ? '&' : '?';
      const url = `${baseApiUrl}${sep}_t=${Date.now()}`;

      const [res] = await Promise.all([
        fetch(url, {
          signal: controller.signal,
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }),
        minDelayPromise
      ]);

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const rawData: ElectionState = await res.json();

      if (rawData.polymarket) {
        const nowMs = Date.now();
        const hist = polymarketHistoryRef.current;
        const lastPt = hist[hist.length - 1];
        if (!lastPt || nowMs - lastPt.timestampMs >= 10000) {
          hist.push({
            timestampMs: nowMs,
            lulaPct: rawData.polymarket.lulaPct,
            bolsonaroPct: rawData.polymarket.bolsonaroPct
          });
          while (hist.length > 0 && nowMs - hist[0].timestampMs > 30 * 60 * 1000) {
            hist.shift();
          }
        }
        const pt5m = hist.find(p => nowMs - p.timestampMs >= 3 * 60 * 1000 && nowMs - p.timestampMs <= 8 * 60 * 1000);
        if (
          pt5m &&
          (Math.abs(rawData.polymarket.lulaPct - pt5m.lulaPct) >= 0.1 ||
            Math.abs(rawData.polymarket.bolsonaroPct - pt5m.bolsonaroPct) >= 0.1)
        ) {
          const lulaDelta = Number((rawData.polymarket.lulaPct - pt5m.lulaPct).toFixed(1));
          rawData.polymarket = {
            ...rawData.polymarket,
            lulaDeltaPct: lulaDelta,
            bolsonaroDeltaPct: Number((-lulaDelta).toFixed(1)),
            deltaWindow: '5m'
          };
        }
      }

      const mergedState = mergeMonotonicElectionState(latestStateRef.current, rawData);
      latestStateRef.current = mergedState;
      setEstado2026(mergedState);
      hasLoadedRef.current = true;
      setErro(null);

      // Registrar ponto de sessão para o gráfico Sparkline
      const cand1Pct = mergedState.candidatos[0]?.percentual || 0;
      const cand2Pct = mergedState.candidatos[1]?.percentual || 0;
      setPontosSessao2026(prevPts => {
        const novoPonto = {
          tempo: mergedState.timestamp.slice(0, 5),
          pct: mergedState.secoesTotalizadasPct,
          lulaPct: cand1Pct,
          oposicaoPct: cand2Pct
        };
        if (prevPts.length > 0 && prevPts[prevPts.length - 1].tempo === novoPonto.tempo) {
          const updated = [...prevPts];
          updated[updated.length - 1] = novoPonto;
          return updated;
        }
        return [...prevPts, novoPonto];
      });

      // Sincronizar o histórico real da apuração de 2026
      const serverTimeline = mergedState.timeline2026 || [];
      const currentPoint: TimelinePoint2026 = {
        urnasPct: mergedState.secoesTotalizadasPct,
        timestamp: mergedState.timestamp,
        candidatos: Object.fromEntries(
          mergedState.candidatos.map(c => [c.nome.toUpperCase().trim(), c.percentual])
        )
      };

      setTimeline2026(prevTimeline => {
        const pointMap = new Map<number, TimelinePoint2026>();
        [...prevTimeline, ...serverTimeline, currentPoint].forEach(pt => {
          if (pt && pt.urnasPct > 0) {
            const key = Math.round(pt.urnasPct * 100) / 100;
            const existing = pointMap.get(key);
            if (!existing) {
              pointMap.set(key, pt);
            } else {
              pointMap.set(key, {
                ...existing,
                ...pt,
                candidatos: { ...existing.candidatos, ...pt.candidatos }
              });
            }
          }
        });
        const mergedTimeline = Array.from(pointMap.values()).sort((a, b) => a.urnasPct - b.urnasPct);
        try {
          if (!mergedState.origem.includes('demo')) {
            localStorage.setItem(STORAGE_KEY_2026_2T, JSON.stringify(mergedTimeline));
          }
        } catch {
          // ignore
        }
        return mergedTimeline;
      });

      setTempoRestante(POLLING_INTERVAL_SECONDS);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Erro ao sincronizar dados de 2026:', err);
        setErro('Falha temporária ao comunicar com o servidor do TSE.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsAtualizando(false);
        setIsCarregando(false);
      }
    }
  }, []);

  // 3. Inicializar polling turbo de 5s e contador decrescente segundo a segundo
  useEffect(() => {
    const initTimer = setTimeout(() => {
      fetch2026Data();
    }, 0);

    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          fetch2026Data();
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        // Debounce de 1.2s para evitar que focus + visibilitychange simultâneos cancelem a requisição em voo
        if (Date.now() - lastFetchStartMsRef.current > 1200) {
          setTempoRestante(POLLING_INTERVAL_SECONDS);
          fetch2026Data();
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetch2026Data]);

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
      point2022 = interpolateByUrnas(timeline2022, estado2026.secoesTotalizadasPct);
    } else {
      point2022 = findByTime(timeline2022, estado2026.timestamp.slice(0, 5), estado2026.secoesTotalizadasPct);
    }

    matching2022State = point2022ToElectionState(point2022);
    ritmoMinutos = calculatePaceDifferenceMinutes(estado2026.timestamp, point2022);

    const c1_2026 = estado2026.candidatos[0]?.percentual || 0;
    const c2_2026 = estado2026.candidatos[1]?.percentual || 0;
    const c1_2022 = matching2022State.candidatos[0]?.percentual || 0;
    const c2_2022 = matching2022State.candidatos[1]?.percentual || 0;

    deltaLider = Number((c1_2026 - c1_2022).toFixed(2));
    deltaSegundo = Number((c2_2026 - c2_2022).toFixed(2));

    margem2026 = Number((c1_2026 - c2_2026).toFixed(2));
    margem2022 = Number((c1_2022 - c2_2022).toFixed(2));

    const lula2026 = estado2026.candidatos.find(c => c.nome.includes('LULA'))?.percentual || c1_2026;
    const lula2022 = matching2022State.candidatos.find(c => c.nome.includes('LULA'))?.percentual || point2022.lulaPct;
    deltaLula = Number((lula2026 - lula2022).toFixed(2));

    const opo2026 =
      estado2026.candidatos.find(c => !c.nome.includes('LULA') && c.posicao <= 2)?.percentual || c2_2026;
    const bolso2022 =
      matching2022State.candidatos.find(c => c.nome.includes('BOLSONARO'))?.percentual || point2022.bolsonaroPct;
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
    timeline2026,
    pontosSessao2026,
    recarregarAgora: () => {
      setTempoRestante(POLLING_INTERVAL_SECONDS);
      return fetch2026Data();
    }
  };
}
