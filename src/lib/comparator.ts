import type {
  TimelinePoint2022,
  ElectionState,
  CandidateResult,
  ComparisonMode
} from './types';

/**
 * Converte um ponto da timeline histórica de 2022 em um ElectionState completo
 */
export function point2022ToElectionState(point: TimelinePoint2022): ElectionState {
  const candidatos: CandidateResult[] = [
    {
      id: 'lula-2022',
      nome: 'LULA',
      numero: '13',
      partido: 'PT',
      votos: point.lulaVotos,
      percentual: point.lulaPct,
      posicao: point.lulaPct >= point.bolsonaroPct ? 1 : 2,
      cor: '#C5221F'
    },
    {
      id: 'bolsonaro-2022',
      nome: 'JAIR BOLSONARO',
      numero: '22',
      partido: 'PL',
      votos: point.bolsonaroVotos,
      percentual: point.bolsonaroPct,
      posicao: point.bolsonaroPct > point.lulaPct ? 1 : 2,
      cor: '#1E3A8A'
    },
    {
      id: 'tebet-2022',
      nome: 'SIMONE TEBET',
      numero: '15',
      partido: 'MDB',
      votos: point.tebetVotos,
      percentual: point.tebetPct,
      posicao: 3,
      cor: '#4B5563'
    },
    {
      id: 'ciro-2022',
      nome: 'CIRO GOMES',
      numero: '12',
      partido: 'PDT',
      votos: point.ciroVotos,
      percentual: point.ciroPct,
      posicao: 4,
      cor: '#6B7280'
    }
  ];

  if (point.outrosPct > 0) {
    candidatos.push({
      id: 'outros-2022',
      nome: 'OUTROS CANDIDATOS',
      numero: '--',
      partido: 'DIVERSOS',
      votos: point.outrosVotos,
      percentual: point.outrosPct,
      posicao: 5,
      cor: '#9CA3AF'
    });
  }

  // Ordenar pela posição real
  candidatos.sort((a, b) => b.percentual - a.percentual);

  return {
    ano: 2022,
    timestamp: point.timestamp,
    dataHoraISO: `2022-10-02T${point.timestamp}:00-03:00`,
    secoesTotalizadasPct: point.secoesTotalizadasPct,
    totalSecoes: point.totalSecoes,
    secoesApuradas: point.secoesApuradas,
    totalVotosValidos: point.totalVotosValidos,
    candidatos,
    status: point.secoesTotalizadasPct >= 99.9 ? 'finalizada' : point.secoesTotalizadasPct > 0 ? 'em_andamento' : 'aguardando',
    origem: 'historico-2022'
  };
}

/**
 * Busca Binária O(log n) para encontrar o ponto mais próximo na timeline de 2022 pelo % de urnas
 */
export function findClosestByUrnas(
  timeline: TimelinePoint2022[],
  targetPct: number
): TimelinePoint2022 {
  if (!timeline || timeline.length === 0) {
    throw new Error('Timeline 2022 vazia.');
  }

  if (targetPct <= timeline[0].secoesTotalizadasPct) {
    return timeline[0];
  }

  const last = timeline[timeline.length - 1];
  if (targetPct >= last.secoesTotalizadasPct) {
    return last;
  }

  let low = 0;
  let high = timeline.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = timeline[mid].secoesTotalizadasPct;

    if (midVal === targetPct) {
      return timeline[mid];
    }

    if (midVal < targetPct) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Entre high e low: escolher o mais próximo
  const p1 = timeline[Math.max(0, high)];
  const p2 = timeline[Math.min(timeline.length - 1, low)];

  const diff1 = Math.abs(p1.secoesTotalizadasPct - targetPct);
  const diff2 = Math.abs(p2.secoesTotalizadasPct - targetPct);

  return diff1 <= diff2 ? p1 : p2;
}

/**
 * Busca por horário (HH:mm) na timeline de 2022
 */
export function findByTime(
  timeline: TimelinePoint2022[],
  timeString: string
): TimelinePoint2022 {
  if (!timeline || timeline.length === 0) {
    throw new Error('Timeline 2022 vazia.');
  }

  // Extrair horas e minutos
  const parts = timeString.split(':');
  if (parts.length < 2) return timeline[0];

  const targetMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  const startMinutes = 17 * 60; // 17:00

  const minuteIndex = targetMinutes - startMinutes;

  if (minuteIndex <= 0) {
    return timeline[0];
  }

  if (minuteIndex >= timeline.length) {
    return timeline[timeline.length - 1];
  }

  return timeline[minuteIndex];
}

/**
 * Calcula a diferença de ritmo (em minutos) entre 2026 e 2022 para atingir o mesmo % de apuração
 * Valor positivo: 2026 está mais rápida (atingiu o percentual mais cedo que 2022).
 */
export function calculatePaceDifferenceMinutes(
  time2026Str: string,
  matching2022Point: TimelinePoint2022
): number {
  const parts2026 = time2026Str.split(':');
  if (parts2026.length < 2) return 0;

  const currentMinutes2026 = parseInt(parts2026[0], 10) * 60 + parseInt(parts2026[1], 10);
  const minutesSince17_2026 = Math.max(0, currentMinutes2026 - 17 * 60);

  // minutos que 2022 levou para chegar neste %
  const minutesSince17_2022 = matching2022Point.minuteIndex;

  // Se 2022 levou 120 min e 2026 levou 100 min: 2026 está +20 min adiantada
  return minutesSince17_2022 - minutesSince17_2026;
}
