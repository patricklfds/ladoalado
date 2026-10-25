import type { MacroRegiao } from './types';
import rawData from './data/historical2022UFsAndRegions.json';

type Point = [number, number, number]; // [secoesPct, lulaPct, bolsoPct]

interface HistoricalData {
  ufs: Record<string, Point[]>;
  regioes: Record<string, Point[]>;
}

const data = rawData as unknown as HistoricalData;

function interpolatePoints(
  points: Point[] | undefined,
  pct: number,
  fallbackLula: number,
  fallbackBolso: number
): { lula2022: number; bolso2022: number } {
  if (!points || points.length === 0) {
    return { lula2022: fallbackLula, bolso2022: fallbackBolso };
  }

  const last = points[points.length - 1];

  // Antes de começar a apuração ou ao finalizar, usar o resultado consolidado (100%)
  if (pct <= 0 || pct >= 100) {
    return { lula2022: last[1], bolso2022: last[2] };
  }

  // Se a apuração atual for menor que o primeiro checkpoint registrado em 2022, usar o 1º ponto
  if (pct <= points[0][0]) {
    return { lula2022: points[0][1], bolso2022: points[0][2] };
  }

  // Busca binária para achar o intervalo exato
  let low = 0;
  let high = points.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (points[mid][0] === pct) {
      return { lula2022: points[mid][1], bolso2022: points[mid][2] };
    }
    if (points[mid][0] < pct) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx1 = Math.max(0, high);
  const idx2 = Math.min(points.length - 1, low);
  const p1 = points[idx1];
  const p2 = points[idx2];

  if (p1[0] === p2[0]) {
    return { lula2022: p1[1], bolso2022: p1[2] };
  }

  const t = (pct - p1[0]) / (p2[0] - p1[0]);
  const lula = Number((p1[1] + (p2[1] - p1[1]) * t).toFixed(2));
  const bolso = Number(Math.max(0, 100 - lula).toFixed(2));

  return { lula2022: lula, bolso2022: bolso };
}

/**
 * Retorna o percentual exato de Lula e Bolsonaro em 2022 para uma UF
 * na MESMA porcentagem de apuração das urnas.
 */
export function get2022UFBaseline(
  uf: string,
  secoesPct: number
): { lula2022: number; bolso2022: number } {
  const ufKey = uf.toUpperCase().trim();
  const points = data.ufs[ufKey];
  return interpolatePoints(points, secoesPct, 50, 50);
}

/**
 * Retorna o percentual exato de Lula e Bolsonaro em 2022 para uma Macro-Região
 * na MESMA porcentagem de apuração das urnas.
 */
export function get2022RegiaoBaseline(
  regiao: MacroRegiao,
  secoesPct: number
): { lula2022: number; bolso2022: number } {
  const points = data.regioes[regiao];
  return interpolatePoints(points, secoesPct, 50, 50);
}
