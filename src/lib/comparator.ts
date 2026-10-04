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

  // Ordenar pela posição real e reindexar dinamicamente (para refletir a virada de 2022)
  candidatos.sort((a, b) => b.percentual - a.percentual);
  candidatos.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

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
 * Interpolação Exata por % de Urnas:
 * Garante que em 'modo urnas', se 2026 está com X%, 2022 terá EXATAMENTE X% de urnas,
 * com os percentuais dos candidatos interpolados de forma contínua e precisa.
 */
export function interpolateByUrnas(
  timeline: TimelinePoint2022[],
  targetPct: number
): TimelinePoint2022 {
  if (!timeline || timeline.length === 0) {
    throw new Error('Timeline 2022 vazia.');
  }

  const clampedPct = Math.max(0, Math.min(100, targetPct));

  if (clampedPct <= 0) {
    return { ...timeline[0], secoesTotalizadasPct: 0 };
  }

  const last = timeline[timeline.length - 1];
  if (clampedPct >= last.secoesTotalizadasPct) {
    return { ...last, secoesTotalizadasPct: clampedPct };
  }

  // Localizar os dois pontos vizinhos entre os quais clampedPct se encontra
  let idx = 0;
  while (idx < timeline.length - 1 && timeline[idx + 1].secoesTotalizadasPct < clampedPct) {
    idx++;
  }

  const p1 = timeline[idx];
  const p2 = timeline[Math.min(idx + 1, timeline.length - 1)];

  if (p1.secoesTotalizadasPct === p2.secoesTotalizadasPct) {
    return { ...p1, secoesTotalizadasPct: clampedPct };
  }

  // Fração de interpolação t entre p1 e p2
  const t = (clampedPct - p1.secoesTotalizadasPct) / (p2.secoesTotalizadasPct - p1.secoesTotalizadasPct);

  const lulaPct = Number((p1.lulaPct + (p2.lulaPct - p1.lulaPct) * t).toFixed(2));
  const bolsonaroPct = Number((p1.bolsonaroPct + (p2.bolsonaroPct - p1.bolsonaroPct) * t).toFixed(2));
  const tebetPct = Number((p1.tebetPct + (p2.tebetPct - p1.tebetPct) * t).toFixed(2));
  const ciroPct = Number((p1.ciroPct + (p2.ciroPct - p1.ciroPct) * t).toFixed(2));
  const outrosPct = Number(Math.max(0, 100 - (lulaPct + bolsonaroPct + tebetPct + ciroPct)).toFixed(2));

  // Interpolação do horário em que 2022 atingiu essa porcentagem
  const exactMinutesFrom17 = p1.minuteIndex + (p2.minuteIndex - p1.minuteIndex) * t;
  const totalMin = 17 * 60 + exactMinutesFrom17;
  const h = Math.floor(totalMin / 60) % 24;
  const m = Math.floor(totalMin % 60);
  const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const secoesApuradas = Math.round((clampedPct / 100) * p1.totalSecoes);
  const totalVotosValidos = Math.round((clampedPct / 100) * 118580080);

  const lulaVotos = Math.round((lulaPct / 100) * totalVotosValidos);
  const bolsonaroVotos = Math.round((bolsonaroPct / 100) * totalVotosValidos);
  const tebetVotos = Math.round((tebetPct / 100) * totalVotosValidos);
  const ciroVotos = Math.round((ciroPct / 100) * totalVotosValidos);
  const outrosVotos = Math.max(0, totalVotosValidos - (lulaVotos + bolsonaroVotos + tebetVotos + ciroVotos));

  return {
    timestamp: formattedTime,
    minuteIndex: Math.round(exactMinutesFrom17),
    secoesTotalizadasPct: clampedPct, // EXATAMENTE O MESMO PERCENTUAL DE 2026!
    totalSecoes: p1.totalSecoes,
    secoesApuradas,
    lulaPct,
    lulaVotos,
    bolsonaroPct,
    bolsonaroVotos,
    tebetPct,
    tebetVotos,
    ciroPct,
    ciroVotos,
    outrosPct,
    outrosVotos,
    totalVotosValidos
  };
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

  // Se a consulta for feita antes das 17h e não for simulação de noite, não distorcer o cálculo
  if (currentMinutes2026 < 17 * 60) {
    return 0;
  }

  const minutesSince17_2026 = currentMinutes2026 - 17 * 60;
  const minutesSince17_2022 = matching2022Point.minuteIndex;

  return minutesSince17_2022 - minutesSince17_2026;
}
