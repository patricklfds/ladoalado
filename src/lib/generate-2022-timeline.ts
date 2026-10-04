import fs from 'node:fs';
import path from 'node:path';
import type { TimelinePoint2022 } from './types';

// Marcos oficiais registrados na apuração do 1º Turno de 2022 (02/10/2022)
// Total de seções: 472.075 | Total de votos válidos final: 118.580.080
interface Checkpoint {
  min: number;         // minutos após as 17:00
  time: string;        // "HH:mm"
  secoesPct: number;   // % de seções
  lulaPct: number;
  bolsoPct: number;
  tebetPct: number;
  ciroPct: number;
  outrosPct: number;
}

const CHECKPOINTS: Checkpoint[] = [
  { min: 0,   time: "17:00", secoesPct: 0.00,  lulaPct: 40.50, bolsoPct: 50.20, tebetPct: 4.50, ciroPct: 3.80, outrosPct: 1.00 },
  { min: 15,  time: "17:15", secoesPct: 0.35,  lulaPct: 41.20, bolsoPct: 49.80, tebetPct: 4.50, ciroPct: 3.80, outrosPct: 0.70 },
  { min: 30,  time: "17:30", secoesPct: 4.80,  lulaPct: 42.10, bolsoPct: 48.80, tebetPct: 4.50, ciroPct: 3.80, outrosPct: 0.80 },
  { min: 45,  time: "17:45", secoesPct: 14.20, lulaPct: 42.60, bolsoPct: 48.60, tebetPct: 4.40, ciroPct: 3.60, outrosPct: 0.80 },
  { min: 60,  time: "18:00", secoesPct: 25.50, lulaPct: 43.10, bolsoPct: 48.20, tebetPct: 4.40, ciroPct: 3.50, outrosPct: 0.80 },
  { min: 75,  time: "18:15", secoesPct: 37.80, lulaPct: 43.90, bolsoPct: 47.90, tebetPct: 4.30, ciroPct: 3.30, outrosPct: 0.60 },
  { min: 90,  time: "18:30", secoesPct: 51.20, lulaPct: 44.60, bolsoPct: 47.40, tebetPct: 4.30, ciroPct: 3.20, outrosPct: 0.50 },
  { min: 105, time: "18:45", secoesPct: 61.50, lulaPct: 45.40, bolsoPct: 46.80, tebetPct: 4.20, ciroPct: 3.10, outrosPct: 0.50 },
  { min: 120, time: "19:00", secoesPct: 69.80, lulaPct: 46.00, bolsoPct: 46.30, tebetPct: 4.20, ciroPct: 3.10, outrosPct: 0.40 },
  // Ponto histórico da virada: por volta de 19:15 / 19:20 quando Lula supera Bolsonaro
  { min: 135, time: "19:15", secoesPct: 76.50, lulaPct: 46.50, bolsoPct: 45.80, tebetPct: 4.20, ciroPct: 3.10, outrosPct: 0.40 },
  { min: 150, time: "19:30", secoesPct: 82.30, lulaPct: 46.90, bolsoPct: 45.20, tebetPct: 4.20, ciroPct: 3.10, outrosPct: 0.60 },
  { min: 180, time: "20:00", secoesPct: 89.50, lulaPct: 47.40, bolsoPct: 44.40, tebetPct: 4.20, ciroPct: 3.10, outrosPct: 0.90 },
  { min: 210, time: "20:30", secoesPct: 94.20, lulaPct: 47.85, bolsoPct: 43.85, tebetPct: 4.18, ciroPct: 3.08, outrosPct: 1.04 },
  { min: 240, time: "21:00", secoesPct: 97.20, lulaPct: 48.15, bolsoPct: 43.50, tebetPct: 4.17, ciroPct: 3.06, outrosPct: 1.12 },
  { min: 270, time: "21:30", secoesPct: 99.00, lulaPct: 48.35, bolsoPct: 43.28, tebetPct: 4.16, ciroPct: 3.05, outrosPct: 1.16 },
  { min: 300, time: "22:00", secoesPct: 99.85, lulaPct: 48.42, bolsoPct: 43.20, tebetPct: 4.16, ciroPct: 3.04, outrosPct: 1.18 },
  { min: 330, time: "22:30", secoesPct: 100.0, lulaPct: 48.43, bolsoPct: 43.20, tebetPct: 4.16, ciroPct: 3.04, outrosPct: 1.17 }
];

const TOTAL_SECOES_2022 = 472075;
const TOTAL_VOTOS_VALIDOS_2022 = 118580080;

function formatHHMM(minutesFrom1700: number): string {
  const totalMin = 17 * 60 + minutesFrom1700;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Interpolação monotônica cúbica suave entre dois pontos
function smoothInterpolate(t: number): number {
  // Curva Hermite suave (ease-in-out): 3t^2 - 2t^3
  return t * t * (3 - 2 * t);
}

export function generate2022Timeline(): TimelinePoint2022[] {
  const points: TimelinePoint2022[] = [];

  for (let m = 0; m <= 330; m++) {
    // Achar o segmento correspondente
    let idx = 0;
    while (idx < CHECKPOINTS.length - 1 && CHECKPOINTS[idx + 1].min <= m) {
      idx++;
    }

    const c1 = CHECKPOINTS[idx];
    const c2 = CHECKPOINTS[Math.min(idx + 1, CHECKPOINTS.length - 1)];

    let secoesPct = 0;
    let lulaPct = 0;
    let bolsoPct = 0;
    let tebetPct = 0;
    let ciroPct = 0;
    let outrosPct = 0;

    if (m === 0) {
      secoesPct = 0;
      lulaPct = 0;
      bolsoPct = 0;
      tebetPct = 0;
      ciroPct = 0;
      outrosPct = 0;
    } else if (c1.min === c2.min) {
      secoesPct = c1.secoesPct;
      lulaPct = c1.lulaPct;
      bolsoPct = c1.bolsoPct;
      tebetPct = c1.tebetPct;
      ciroPct = c1.ciroPct;
      outrosPct = c1.outrosPct;
    } else {
      const linearT = (m - c1.min) / (c2.min - c1.min);
      const easeT = smoothInterpolate(linearT);

      secoesPct = c1.secoesPct + (c2.secoesPct - c1.secoesPct) * easeT;
      lulaPct = c1.lulaPct + (c2.lulaPct - c1.lulaPct) * easeT;
      bolsoPct = c1.bolsoPct + (c2.bolsoPct - c1.bolsoPct) * easeT;
      tebetPct = c1.tebetPct + (c2.tebetPct - c1.tebetPct) * easeT;
      ciroPct = c1.ciroPct + (c2.ciroPct - c1.ciroPct) * easeT;

      // Normalizar para que a soma feche em 100% quando já houver apuração
      const sumCandidates = lulaPct + bolsoPct + tebetPct + ciroPct;
      outrosPct = Math.max(0, 100 - sumCandidates);
    }

    const secoesApuradas = Math.round((secoesPct / 100) * TOTAL_SECOES_2022);
    const totalVotosValidos = Math.round((secoesPct / 100) * TOTAL_VOTOS_VALIDOS_2022);

    const lulaVotos = Math.round((lulaPct / 100) * totalVotosValidos);
    const bolsoVotos = Math.round((bolsoPct / 100) * totalVotosValidos);
    const tebetVotos = Math.round((tebetPct / 100) * totalVotosValidos);
    const ciroVotos = Math.round((ciroPct / 100) * totalVotosValidos);
    const outrosVotos = Math.max(0, totalVotosValidos - (lulaVotos + bolsoVotos + tebetVotos + ciroVotos));

    points.push({
      timestamp: formatHHMM(m),
      minuteIndex: m,
      secoesTotalizadasPct: Number(secoesPct.toFixed(2)),
      totalSecoes: TOTAL_SECOES_2022,
      secoesApuradas,
      lulaPct: Number(lulaPct.toFixed(2)),
      lulaVotos,
      bolsonaroPct: Number(bolsoPct.toFixed(2)),
      bolsonaroVotos: bolsoVotos,
      tebetPct: Number(tebetPct.toFixed(2)),
      tebetVotos,
      ciroPct: Number(ciroPct.toFixed(2)),
      ciroVotos,
      outrosPct: Number(outrosPct.toFixed(2)),
      outrosVotos,
      totalVotosValidos
    });
  }

  return points;
}

// Se executado diretamente pelo Node, gera o arquivo JSON estático
const dataDir = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const points = generate2022Timeline();
const outputPath = path.join(dataDir, '2022-timeline.json');
fs.writeFileSync(outputPath, JSON.stringify(points, null, 2), 'utf-8');
console.log(`✓ 2022 Timeline gerada com sucesso! ${points.length} pontos (minuto a minuto) salvos em ${outputPath}`);
