import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';
import type {
  ElectionState,
  CandidateResult,
  TimelinePoint2026,
  UFResult,
  MacroRegiao,
  PolymarketOdds
} from '@/lib/types';
import { cleanPartyName, getCandidateColor } from '@/lib/candidateUtils';

interface TSECandNode {
  n: string;
  nm?: string;
  nmu?: string;
  cc?: string;
  vap: string;
  pvap: string;
  seq?: string;
}

interface TSEParNode {
  sg?: string;
  cand?: TSECandNode[];
}

interface TSEColigacaoNode {
  par?: TSEParNode[];
}

interface TSECargoNode {
  agr?: TSEColigacaoNode[];
}

interface TSEPayload {
  dg?: string;
  hg?: string;
  idg?: string;
  pst?: string;
  s?: string | Record<string, string>;
  st?: string;
  vscv?: string;
  v?: Record<string, string>;
  e?: Record<string, string>;
  carg?: TSECargoNode[];
  cand?: TSECandNode[];
}

interface UFMetadata {
  code: string;
  uf: string;
  nome: string;
  regiao: MacroRegiao;
  defaultSecoes: number;
  demoWeight: number;
  demoLulaShare: number;
  demoProgressBias: number;
}

const UF_LIST: UFMetadata[] = [
  { code: 'sp', uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste', defaultSecoes: 103656, demoWeight: 21.8, demoLulaShare: 44.8, demoProgressBias: 1.04 },
  { code: 'mg', uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste', defaultSecoes: 52062, demoWeight: 10.6, demoLulaShare: 50.2, demoProgressBias: 0.98 },
  { code: 'rj', uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste', defaultSecoes: 37675, demoWeight: 8.1, demoLulaShare: 43.5, demoProgressBias: 1.02 },
  { code: 'ba', uf: 'BA', nome: 'Bahia', regiao: 'Nordeste', defaultSecoes: 35476, demoWeight: 7.2, demoLulaShare: 72.1, demoProgressBias: 0.88 },
  { code: 'rs', uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul', defaultSecoes: 27775, demoWeight: 5.6, demoLulaShare: 43.7, demoProgressBias: 1.12 },
  { code: 'pr', uf: 'PR', nome: 'Paraná', regiao: 'Sul', defaultSecoes: 27147, demoWeight: 5.5, demoLulaShare: 37.6, demoProgressBias: 1.18 },
  { code: 'ce', uf: 'CE', nome: 'Ceará', regiao: 'Nordeste', defaultSecoes: 22248, demoWeight: 4.5, demoLulaShare: 69.9, demoProgressBias: 0.94 },
  { code: 'pe', uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste', defaultSecoes: 21783, demoWeight: 4.5, demoLulaShare: 66.9, demoProgressBias: 0.92 },
  { code: 'pa', uf: 'PA', nome: 'Pará', regiao: 'Norte', defaultSecoes: 19956, demoWeight: 3.8, demoLulaShare: 54.7, demoProgressBias: 0.85 },
  { code: 'sc', uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul', defaultSecoes: 17854, demoWeight: 3.7, demoLulaShare: 30.7, demoProgressBias: 1.10 },
  { code: 'ma', uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste', defaultSecoes: 17198, demoWeight: 3.2, demoLulaShare: 71.1, demoProgressBias: 0.89 },
  { code: 'go', uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste', defaultSecoes: 15810, demoWeight: 3.3, demoLulaShare: 41.3, demoProgressBias: 1.08 },
  { code: 'pb', uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste', defaultSecoes: 10079, demoWeight: 2.1, demoLulaShare: 66.6, demoProgressBias: 1.03 },
  { code: 'es', uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste', defaultSecoes: 9638, demoWeight: 1.9, demoLulaShare: 42.0, demoProgressBias: 1.14 },
  { code: 'pi', uf: 'PI', nome: 'Piauí', regiao: 'Nordeste', defaultSecoes: 8922, demoWeight: 1.7, demoLulaShare: 76.8, demoProgressBias: 0.95 },
  { code: 'mt', uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste', defaultSecoes: 8228, demoWeight: 1.6, demoLulaShare: 34.9, demoProgressBias: 1.01 },
  { code: 'rn', uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste', defaultSecoes: 8216, demoWeight: 1.7, demoLulaShare: 65.1, demoProgressBias: 1.00 },
  { code: 'am', uf: 'AM', nome: 'Amazonas', regiao: 'Norte', defaultSecoes: 8172, demoWeight: 1.7, demoLulaShare: 51.1, demoProgressBias: 0.86 },
  { code: 'ms', uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', defaultSecoes: 7164, demoWeight: 1.3, demoLulaShare: 40.5, demoProgressBias: 1.15 },
  { code: 'al', uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste', defaultSecoes: 7101, demoWeight: 1.5, demoLulaShare: 58.6, demoProgressBias: 0.91 },
  { code: 'df', uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste', defaultSecoes: 6900, demoWeight: 1.5, demoLulaShare: 41.2, demoProgressBias: 1.22 },
  { code: 'se', uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste', defaultSecoes: 5718, demoWeight: 1.1, demoLulaShare: 67.2, demoProgressBias: 0.96 },
  { code: 'ro', uf: 'RO', nome: 'Rondônia', regiao: 'Norte', defaultSecoes: 4444, demoWeight: 0.8, demoLulaShare: 29.4, demoProgressBias: 0.97 },
  { code: 'to', uf: 'TO', nome: 'Tocantins', regiao: 'Norte', defaultSecoes: 4091, demoWeight: 0.7, demoLulaShare: 51.3, demoProgressBias: 1.06 },
  { code: 'ac', uf: 'AC', nome: 'Acre', regiao: 'Norte', defaultSecoes: 2270, demoWeight: 0.4, demoLulaShare: 29.7, demoProgressBias: 0.82 },
  { code: 'ap', uf: 'AP', nome: 'Amapá', regiao: 'Norte', defaultSecoes: 1938, demoWeight: 0.4, demoLulaShare: 48.6, demoProgressBias: 1.09 },
  { code: 'rr', uf: 'RR', nome: 'Roraima', regiao: 'Norte', defaultSecoes: 1378, demoWeight: 0.3, demoLulaShare: 23.9, demoProgressBias: 1.05 },
  { code: 'zz', uf: 'ZZ', nome: 'Exterior', regiao: 'Exterior', defaultSecoes: 1351, demoWeight: 0.3, demoLulaShare: 51.2, demoProgressBias: 0.78 }
];

// Código oficial do 2º Turno Presidencial 2026 no CDN do TSE (6258)
const envCode = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE;
const DEFAULT_ELECTION_CODE =
  envCode && envCode !== '600' && envCode !== '6257' ? envCode : '6258';
const DEFAULT_ELECTION_CYCLE = process.env.NEXT_PUBLIC_TSE_ELECTION_CYCLE || 'ele2026';

function parseTSEFloat(value: string | undefined): number {
  if (!value) return 0;
  const trimmed = value.trim();
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTSEInt(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value.replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseSafeFloat(val: string | null | undefined, defaultValue: number): number {
  if (!val) return defaultValue;
  const num = parseFloat(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? Number(num.toFixed(2)) : defaultValue;
}

/**
 * Formata o percentual de seções totalizadas garantindo que:
 * - Quando há pelo menos 1 seção ou voto apurado, o percentual seja >= 0.01% (nunca arredondando para 0.00%)
 * - Enquanto ainda restar alguma seção não apurada, o percentual não arredonde prematuramente para 100.00%
 */
function computePreciseSecoesPct(secoesApuradas: number, totalSecoes: number, totalVotosValidos: number): number {
  if (totalSecoes <= 0 || (secoesApuradas <= 0 && totalVotosValidos <= 0)) {
    return 0;
  }
  if (secoesApuradas >= totalSecoes) {
    return 100;
  }
  const raw = (secoesApuradas / totalSecoes) * 100;
  const rounded = Number(raw.toFixed(2));
  if (rounded <= 0) return 0.01;
  if (rounded >= 100) return 99.99;
  return rounded;
}

// Rate Limiter em memória (comporta polling turbo de 5s + múltiplos usuários na mesma rede CGNAT/Wi-Fi)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, maxRequests = 1500, windowMs = 60000): boolean {
  const now = Date.now();
  if (ipRequestCounts.size > 5000) {
    for (const [k, v] of ipRequestCounts.entries()) {
      if (now > v.resetTime) {
        ipRequestCounts.delete(k);
      }
    }
  }
  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  record.count++;
  return record.count > maxRequests;
}

// Buffer histórico em memória isolado por código de pleito
const historicalTimelineByCode = new Map<string, TimelinePoint2026[]>();

function recordTimelinePoint(
  electionCode: string,
  urnasPct: number,
  timestamp: string,
  candidatos: CandidateResult[]
): TimelinePoint2026[] {
  const list = historicalTimelineByCode.get(electionCode) || [];
  if (urnasPct > 0 && candidatos.length > 0) {
    const candMap: Record<string, number> = {};
    candidatos.forEach(c => {
      candMap[c.nome.toUpperCase().trim()] = c.percentual;
    });

    const existingIdx = list.findIndex(p => Math.abs(p.urnasPct - urnasPct) < 0.15);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        urnasPct,
        timestamp,
        candidatos: { ...list[existingIdx].candidatos, ...candMap }
      };
    } else {
      list.push({
        urnasPct,
        timestamp,
        candidatos: candMap
      });
      list.sort((a, b) => a.urnasPct - b.urnasPct);
    }
    historicalTimelineByCode.set(electionCode, list);
  }
  return [...list];
}

interface ParsedScopeData {
  scope: string;
  idg: number;
  timestamp: string;
  secoesTotalizadasPct: number;
  totalSecoes: number;
  secoesApuradas: number;
  totalVotosValidos: number;
  totalVotosComparecimento: number;
  votosBrancos?: number;
  votosBrancosPct?: number;
  votosNulos?: number;
  votosNulosPct?: number;
  abstencao?: number;
  abstencaoPct?: number;
  eleitoradoInstalado: number;
  candidatos: CandidateResult[];
}

// High-Water Mark monotônico por escopo (BR + 28 UFs) em memória
const scopeHighWaterMark = new Map<string, ParsedScopeData>();

// Coalescência de requisições (Singleflight) + cache ultra-rápido de 1.5s em memória
const liveCache = new Map<string, { timestampMs: number; state: ElectionState }>();
const inFlightRequests = new Map<string, Promise<ElectionState>>();

// Cache em memória de 15s + buffer histórico circular (5m / 15m / 1h) para as probabilidades do Polymarket
const POLYMARKET_EVENT_URL = 'https://polymarket.com/event/brazil-presidential-election';
const polymarketHistory: Array<{ timestampMs: number; lulaPct: number; bolsonaroPct: number }> = [];

let polymarketCache: { timestampMs: number; data: PolymarketOdds } = {
  timestampMs: 0,
  data: {
    lulaPct: 17.5,
    bolsonaroPct: 82.4,
    lulaDeltaPct: 0.5,
    bolsonaroDeltaPct: -0.5,
    deltaWindow: '1h',
    volumeUsd: 194749220,
    updatedAtISO: new Date().toISOString(),
    url: POLYMARKET_EVENT_URL
  }
};

interface PolymarketMarketItem {
  active?: boolean;
  closed?: boolean;
  groupItemTitle?: string;
  question?: string;
  outcomePrices?: string | string[];
  lastTradePrice?: number | string;
  oneHourPriceChange?: number | string;
  oneDayPriceChange?: number | string;
}

interface PolymarketEventPayload {
  volume?: number | string;
  markets?: PolymarketMarketItem[];
}

function parsePolymarketEvents(events: PolymarketEventPayload[]): PolymarketOdds | null {
  const ev = Array.isArray(events) ? events[0] : null;
  if (!ev || !Array.isArray(ev.markets)) return null;

  let lulaPct: number | null = null;
  let bolsonaroPct: number | null = null;
  let lula1hDelta: number | null = null;
  let bolso1hDelta: number | null = null;
  let lula24hDelta: number | null = null;
  let bolso24hDelta: number | null = null;

  for (const m of ev.markets) {
    if (!m.active || m.closed) continue;
    const title = (m.groupItemTitle || m.question || '').toUpperCase();
    let yesPrice = 0;
    if (typeof m.outcomePrices === 'string') {
      try {
        const parsed = JSON.parse(m.outcomePrices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          yesPrice = parseFloat(parsed[0]);
        }
      } catch {
        yesPrice = Number(m.lastTradePrice || 0);
      }
    } else if (Array.isArray(m.outcomePrices) && m.outcomePrices.length > 0) {
      yesPrice = parseFloat(m.outcomePrices[0]);
    } else if (m.lastTradePrice !== undefined) {
      yesPrice = Number(m.lastTradePrice);
    }

    if (!Number.isFinite(yesPrice) || yesPrice < 0 || yesPrice > 1) continue;
    const pct = Number((yesPrice * 100).toFixed(1));
    const chg1h = m.oneHourPriceChange !== undefined ? Number((Number(m.oneHourPriceChange) * 100).toFixed(1)) : null;
    const chg24h = m.oneDayPriceChange !== undefined ? Number((Number(m.oneDayPriceChange) * 100).toFixed(1)) : null;

    if (title.includes('LULA')) {
      lulaPct = pct;
      if (chg1h !== null && Number.isFinite(chg1h)) lula1hDelta = chg1h;
      if (chg24h !== null && Number.isFinite(chg24h)) lula24hDelta = chg24h;
    } else if (title.includes('BOLSONARO') || title.includes('FLÁVIO') || title.includes('FLAVIO')) {
      bolsonaroPct = pct;
      if (chg1h !== null && Number.isFinite(chg1h)) bolso1hDelta = chg1h;
      if (chg24h !== null && Number.isFinite(chg24h)) bolso24hDelta = chg24h;
    }
  }

  if (lulaPct === null && bolsonaroPct === null) return null;
  if ((lulaPct ?? 0) <= 0 && (bolsonaroPct ?? 0) <= 0) return null;
  const finalBolso = bolsonaroPct ?? Number((100 - (lulaPct ?? 50)).toFixed(1));
  const finalLula = lulaPct ?? Number((100 - finalBolso).toFixed(1));
  const volumeUsd = ev.volume !== undefined ? Number(ev.volume) : undefined;

  // Registra no buffer circular de até 60 minutos para detectar oscilações rápidas de 5m e 15m durante a apuração
  const nowMs = Date.now();
  const lastSample = polymarketHistory[polymarketHistory.length - 1];
  if (!lastSample || nowMs - lastSample.timestampMs >= 15000) {
    polymarketHistory.push({ timestampMs: nowMs, lulaPct: finalLula, bolsonaroPct: finalBolso });
    while (polymarketHistory.length > 0 && nowMs - polymarketHistory[0].timestampMs > 65 * 60 * 1000) {
      polymarketHistory.shift();
    }
  }

  // Seleção adaptativa de janela: prioriza 5m e 15m quando há movimento na apuração ao vivo; caso contrário, usa 1h / 24h da API Gamma
  const sample5m = polymarketHistory.find(
    p => nowMs - p.timestampMs >= 3 * 60 * 1000 && nowMs - p.timestampMs <= 8 * 60 * 1000
  );
  const sample15m = polymarketHistory.find(
    p => nowMs - p.timestampMs >= 10 * 60 * 1000 && nowMs - p.timestampMs <= 22 * 60 * 1000
  );

  let lulaDeltaPct = 0;
  let bolsonaroDeltaPct = 0;
  let deltaWindow = '1h';

  if (
    sample5m &&
    (Math.abs(finalLula - sample5m.lulaPct) >= 0.1 || Math.abs(finalBolso - sample5m.bolsonaroPct) >= 0.1)
  ) {
    lulaDeltaPct = Number((finalLula - sample5m.lulaPct).toFixed(1));
    bolsonaroDeltaPct = Number((finalBolso - sample5m.bolsonaroPct).toFixed(1));
    deltaWindow = '5m';
  } else if (
    sample15m &&
    (Math.abs(finalLula - sample15m.lulaPct) >= 0.1 || Math.abs(finalBolso - sample15m.bolsonaroPct) >= 0.1)
  ) {
    lulaDeltaPct = Number((finalLula - sample15m.lulaPct).toFixed(1));
    bolsonaroDeltaPct = Number((finalBolso - sample15m.bolsonaroPct).toFixed(1));
    deltaWindow = '15m';
  } else if (
    (lula1hDelta !== null && Math.abs(lula1hDelta) >= 0.1) ||
    (bolso1hDelta !== null && Math.abs(bolso1hDelta) >= 0.1)
  ) {
    lulaDeltaPct = lula1hDelta ?? Number((-(bolso1hDelta ?? 0)).toFixed(1));
    bolsonaroDeltaPct = bolso1hDelta ?? Number((-(lula1hDelta ?? 0)).toFixed(1));
    deltaWindow = '1h';
  } else if (
    (lula24hDelta !== null && Math.abs(lula24hDelta) >= 0.1) ||
    (bolso24hDelta !== null && Math.abs(bolso24hDelta) >= 0.1)
  ) {
    lulaDeltaPct = lula24hDelta ?? Number((-(bolso24hDelta ?? 0)).toFixed(1));
    bolsonaroDeltaPct = bolso24hDelta ?? Number((-(lula24hDelta ?? 0)).toFixed(1));
    deltaWindow = '24h';
  } else if (lula1hDelta !== null || bolso1hDelta !== null) {
    lulaDeltaPct = lula1hDelta ?? 0;
    bolsonaroDeltaPct = bolso1hDelta ?? 0;
    deltaWindow = '1h';
  }

  return {
    lulaPct: finalLula,
    bolsonaroPct: finalBolso,
    lulaDeltaPct,
    bolsonaroDeltaPct,
    deltaWindow,
    volumeUsd: Number.isFinite(volumeUsd) ? volumeUsd : undefined,
    updatedAtISO: new Date().toISOString(),
    url: POLYMARKET_EVENT_URL
  };
}

async function fetchPolymarketViaDoH(): Promise<PolymarketOdds | null> {
  try {
    const dohRes = await fetch(
      'https://cloudflare-dns.com/dns-query?name=gamma-api.polymarket.com&type=A',
      {
        headers: { accept: 'application/dns-json' },
        cache: 'no-store'
      }
    );
    if (!dohRes.ok) return null;
    const dohJson = (await dohRes.json()) as { Answer?: Array<{ type: number; data: string }> };
    const ip = dohJson.Answer?.find(a => a.type === 1)?.data;
    if (!ip) return null;

    const rawText = await new Promise<string>((resolve, reject) => {
      const req = https.get(
        {
          host: ip,
          servername: 'gamma-api.polymarket.com',
          path: '/events?slug=brazil-presidential-election',
          timeout: 1800,
          headers: {
            Host: 'gamma-api.polymarket.com',
            Accept: 'application/json',
            'User-Agent': 'LadoALado-Eleicoes/2.0'
          }
        },
        res => {
          if (res.statusCode !== 200) {
            reject(new Error(`Status ${res.statusCode}`));
            return;
          }
          let body = '';
          res.on('data', chunk => {
            body += chunk;
          });
          res.on('end', () => resolve(body));
        }
      );
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });

    return parsePolymarketEvents(JSON.parse(rawText) as PolymarketEventPayload[]);
  } catch {
    return null;
  }
}

async function getPolymarketOdds(): Promise<PolymarketOdds> {
  const now = Date.now();
  if (now - polymarketCache.timestampMs < 15000) {
    return polymarketCache.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1600);
    const res = await fetch('https://gamma-api.polymarket.com/events?slug=brazil-presidential-election', {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'LadoALado-Eleicoes/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const events = (await res.json()) as PolymarketEventPayload[];
      const parsed = parsePolymarketEvents(events);
      if (parsed) {
        polymarketCache = { timestampMs: now, data: parsed };
        return parsed;
      }
    }
  } catch {
    const dohParsed = await fetchPolymarketViaDoH();
    if (dohParsed) {
      polymarketCache = { timestampMs: now, data: dohParsed };
      return dohParsed;
    }
  }

  polymarketCache.timestampMs = now - 10000; // Re-tentar em 5s sem travar
  return polymarketCache.data;
}

/**
 * Compara dois snapshots do mesmo escopo (ex: .json vs .jws vs High-Water Mark)
 * e retorna true se `candidate` for mais recente ou igual a `reference`.
 */
function isFresherOrEqualScope(candidate: ParsedScopeData, reference: ParsedScopeData | undefined): boolean {
  if (!reference) return true;
  if (candidate.secoesApuradas !== reference.secoesApuradas) {
    return candidate.secoesApuradas > reference.secoesApuradas;
  }
  if (candidate.totalVotosValidos !== reference.totalVotosValidos) {
    return candidate.totalVotosValidos > reference.totalVotosValidos;
  }
  return candidate.idg >= reference.idg;
}

function parseTSEPayloadToScope(scope: string, tseData: TSEPayload): ParsedScopeData {
  let secoesTotalizadasPct = 0;
  let totalSecoes = 0;
  let secoesApuradas = 0;
  let totalVotosValidos = 0;
  let totalVotosComparecimento = 0;
  let votosBrancos: number | undefined;
  let votosBrancosPct: number | undefined;
  let votosNulos: number | undefined;
  let votosNulosPct: number | undefined;
  let abstencao: number | undefined;
  let abstencaoPct: number | undefined;
  let eleitoradoInstalado = 0;
  const idg = parseTSEInt(tseData.idg);
  const candidatos: CandidateResult[] = [];

  if (tseData.s && typeof tseData.s === 'object') {
    const sObj = tseData.s;
    totalSecoes = parseTSEInt(sObj.ts);
    secoesApuradas = parseTSEInt(sObj.st);

    const vObj = (tseData.v || {}) as Record<string, string>;
    totalVotosValidos = parseTSEInt(vObj.vv || vObj.tv);
    totalVotosComparecimento = parseTSEInt(vObj.tv);
    secoesTotalizadasPct = computePreciseSecoesPct(secoesApuradas, totalSecoes, totalVotosValidos);

    if (vObj.vb !== undefined) votosBrancos = parseTSEInt(vObj.vb);
    if (vObj.pvb !== undefined) votosBrancosPct = parseTSEFloat(vObj.pvb);
    if (vObj.tvn !== undefined || vObj.vn !== undefined) votosNulos = parseTSEInt(vObj.tvn || vObj.vn);
    if (vObj.ptvn !== undefined || vObj.pvn !== undefined) votosNulosPct = parseTSEFloat(vObj.ptvn || vObj.pvn);

    const eObj = (tseData.e || {}) as Record<string, string>;
    if (eObj.a !== undefined) abstencao = parseTSEInt(eObj.a);
    if (eObj.pa !== undefined) abstencaoPct = parseTSEFloat(eObj.pa);
    eleitoradoInstalado = parseTSEInt(eObj.esi || eObj.est || eObj.te);

    if (Array.isArray(tseData.carg) && tseData.carg[0]?.agr) {
      tseData.carg[0].agr.forEach((a: TSEColigacaoNode) => {
        (a.par || []).forEach((p: TSEParNode) => {
          const candList = Array.isArray(p.cand) ? p.cand : [];
          candList.forEach((c: TSECandNode) => {
            const votos = parseTSEInt(c.vap);
            const pct =
              totalVotosValidos > 0
                ? Number(((votos / totalVotosValidos) * 100).toFixed(2))
                : parseTSEFloat(c.pvap);
            const candObj: CandidateResult = {
              id: `cand-${c.n}`,
              nome: (c.nmu || c.nm || 'CANDIDATO').slice(0, 40),
              numero: c.n,
              partido: p.sg || cleanPartyName(c.cc),
              votos,
              percentual: pct,
              posicao: parseInt(c.seq || '1', 10) || 1,
              cor: ''
            };
            candObj.cor = getCandidateColor(candObj);
            candidatos.push(candObj);
          });
        });
      });
    }
  } else {
    totalSecoes = parseTSEInt(tseData.s as string);
    secoesApuradas = parseTSEInt(tseData.st as string);
    totalVotosValidos = parseTSEInt(tseData.vscv as string);
    totalVotosComparecimento = totalVotosValidos;
    secoesTotalizadasPct = computePreciseSecoesPct(secoesApuradas, totalSecoes, totalVotosValidos);
  }

  if (candidatos.length === 0 && Array.isArray(tseData.cand)) {
    tseData.cand.forEach((c: TSECandNode, idx: number) => {
      const votos = parseTSEInt(c.vap);
      const pct =
        totalVotosValidos > 0
          ? Number(((votos / totalVotosValidos) * 100).toFixed(2))
          : parseTSEFloat(c.pvap);
      const candObj: CandidateResult = {
        id: `cand-${c.n || idx}`,
        nome: (c.nmu || c.nm || 'CANDIDATO').slice(0, 40),
        numero: c.n || String(idx + 1),
        partido: cleanPartyName(c.cc),
        votos,
        percentual: pct,
        posicao: parseInt(c.seq || '1', 10) || (idx + 1),
        cor: ''
      };
      candObj.cor = getCandidateColor(candObj);
      candidatos.push(candObj);
    });
  }

  candidatos.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
  candidatos.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

  if (candidatos.length === 2 && totalVotosValidos > 0) {
    candidatos[1].percentual = Number(Math.max(0, 100 - candidatos[0].percentual).toFixed(2));
  }

  return {
    scope,
    idg,
    timestamp: tseData.hg || '17:00:00',
    secoesTotalizadasPct,
    totalSecoes,
    secoesApuradas,
    totalVotosValidos,
    totalVotosComparecimento,
    votosBrancos,
    votosBrancosPct,
    votosNulos,
    votosNulosPct,
    abstencao,
    abstencaoPct,
    eleitoradoInstalado,
    candidatos
  };
}

async function fetchSingleUrl(scope: string, url: string): Promise<ParsedScopeData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3200);
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Pragma': 'no-cache',
        'User-Agent': 'LadoALado-Eleicoes/2.0 (Jornalismo de Dados)'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const rawText = await res.text();
    let tseData: TSEPayload | null = null;
    if (url.endsWith('.jws') || rawText.startsWith('eyJ')) {
      const parts = rawText.split('.');
      if (parts.length >= 2) {
        const jsonStr = Buffer.from(parts[1], 'base64url').toString('utf-8');
        tseData = JSON.parse(jsonStr) as TSEPayload;
      }
    } else {
      tseData = JSON.parse(rawText) as TSEPayload;
    }

    return tseData ? parseTSEPayloadToScope(scope, tseData) : null;
  } catch {
    return null;
  }
}

/**
 * Busca simultaneamente os dois canais independentes da CDN Akamai (.json e .jws)
 * para um mesmo escopo (UF ou BR) e retorna o snapshot mais avançado entre os dois.
 * Como .json e .jws têm janelas de expiração de cache independentes na Akamai,
 * consultar ambos em paralelo reduz pela metade o tempo de espera por novos boletins.
 */
async function fetchDualChannelScope(
  cycle: string,
  electionCode: string,
  paddedCode: string,
  scope: string
): Promise<ParsedScopeData | null> {
  const baseUrl = `https://resultados.tse.jus.br/oficial/${cycle}/${electionCode}/dados/${scope}/${scope}-c0001-e${paddedCode}`;
  const [jsonSnap, jwsSnap] = await Promise.all([
    fetchSingleUrl(scope, `${baseUrl}-u.json`),
    fetchSingleUrl(scope, `${baseUrl}-u.jws`)
  ]);

  if (jsonSnap && jwsSnap) {
    return isFresherOrEqualScope(jwsSnap, jsonSnap) ? jwsSnap : jsonSnap;
  }
  return jsonSnap || jwsSnap;
}

/**
 * Executa a consulta paralela Dual-Channel (.json + .jws) às 28 UFs + Consolidado Nacional (BR)
 * (58 endpoints simultâneos em ~250ms), aplicando High-Water Mark monotônico por UF e BR.
 */
async function fetchLiveMultiUFTurboState(cycle: string, electionCode: string): Promise<ElectionState> {
  const paddedCode = electionCode.padStart(6, '0');
  const allScopes = ['br', ...UF_LIST.map(u => u.code)];

  const [results, polymarket] = await Promise.all([
    Promise.all(allScopes.map(scope => fetchDualChannelScope(cycle, electionCode, paddedCode, scope))),
    getPolymarketOdds()
  ]);

  const rawBr = results[0];
  const ufParsedList = results.slice(1);

  // Verificar se houve reset completo (zerésima oficial) no TSE:
  // Exige que a maioria dos escopos tenha respondido de fato (não timeout/null) e que TODOS reportem 0 seções apuradas.
  const respondingCount = (rawBr ? 1 : 0) + ufParsedList.filter(u => u !== null).length;
  const allReturnedZero =
    respondingCount >= 15 &&
    (rawBr === null || rawBr.secoesApuradas === 0) &&
    ufParsedList.every(u => u === null || u.secoesApuradas === 0);

  if (allReturnedZero) {
    scopeHighWaterMark.delete(`${electionCode}:br`);
    for (const meta of UF_LIST) {
      scopeHighWaterMark.delete(`${electionCode}:${meta.code}`);
    }
    historicalTimelineByCode.delete(electionCode);
  }

  // Atualizar High-Water Mark do consolidado BR
  if (rawBr) {
    const brKey = `${electionCode}:br`;
    const prevBr = scopeHighWaterMark.get(brKey);
    if (isFresherOrEqualScope(rawBr, prevBr)) {
      scopeHighWaterMark.set(brKey, rawBr);
    }
  }
  const brParsed = scopeHighWaterMark.get(`${electionCode}:br`) || rawBr;

  // Atualizar High-Water Mark de cada uma das 28 UFs
  ufParsedList.forEach((ufData, idx) => {
    if (!ufData) return;
    const ufCode = UF_LIST[idx].code;
    const key = `${electionCode}:${ufCode}`;
    const prev = scopeHighWaterMark.get(key);
    if (isFresherOrEqualScope(ufData, prev)) {
      scopeHighWaterMark.set(key, ufData);
    }
  });

  // Construir lista de UFs atualizada e somatório nacional direto a partir das 28 UFs
  const ufsResult: UFResult[] = [];
  let sumTotalSecoes = 0;
  let sumSecoesApuradas = 0;
  let sumVotosValidos = 0;
  let sumVotosComparecimento = 0;
  let sumBrancos = 0;
  let sumNulos = 0;
  let sumAbstencao = 0;
  let sumEleitoradoInstalado = 0;
  let latestActiveUFTimestamp = '';
  let latestAnyUFTimestamp = '';
  let availableUFsCount = 0;

  const candAccumulator = new Map<
    string,
    { id: string; nome: string; numero: string; partido: string; votos: number; seq: number; cor: string }
  >();

  for (const meta of UF_LIST) {
    const snap = scopeHighWaterMark.get(`${electionCode}:${meta.code}`);
    if (!snap) {
      // Se alguma UF isolada sofreu timeout no cold-start, garante presença nas 28 UFs com totalSecoes oficial
      sumTotalSecoes += meta.defaultSecoes;
      ufsResult.push({
        uf: meta.uf,
        nome: meta.nome,
        regiao: meta.regiao,
        secoesTotalizadasPct: 0,
        totalSecoes: meta.defaultSecoes,
        secoesApuradas: 0,
        totalVotosValidos: 0,
        timestamp: brParsed?.timestamp || '17:00:00',
        lulaPct: 0,
        lulaVotos: 0,
        bolsonaroPct: 0,
        bolsonaroVotos: 0
      });
      continue;
    }

    availableUFsCount++;
    sumTotalSecoes += snap.totalSecoes;
    sumSecoesApuradas += snap.secoesApuradas;
    sumVotosValidos += snap.totalVotosValidos;
    sumVotosComparecimento += snap.totalVotosComparecimento;
    sumBrancos += snap.votosBrancos ?? 0;
    sumNulos += snap.votosNulos ?? 0;
    sumAbstencao += snap.abstencao ?? 0;
    sumEleitoradoInstalado += snap.eleitoradoInstalado;

    if (snap.timestamp > latestAnyUFTimestamp) {
      latestAnyUFTimestamp = snap.timestamp;
    }
    if (snap.secoesApuradas > 0 && snap.timestamp > latestActiveUFTimestamp) {
      latestActiveUFTimestamp = snap.timestamp;
    }

    let lulaPct = 0;
    let lulaVotos = 0;
    let bolsonaroPct = 0;
    let bolsonaroVotos = 0;

    for (const c of snap.candidatos) {
      const upper = c.nome.toUpperCase();
      if (c.numero === '13' || upper.includes('LULA')) {
        lulaPct = c.percentual;
        lulaVotos = c.votos;
      } else if (c.numero === '22' || upper.includes('BOLSONARO')) {
        bolsonaroPct = c.percentual;
        bolsonaroVotos = c.votos;
      }

      const existing = candAccumulator.get(c.numero);
      if (!existing) {
        candAccumulator.set(c.numero, {
          id: c.id,
          nome: c.nome,
          numero: c.numero,
          partido: c.partido,
          votos: c.votos,
          seq: c.posicao,
          cor: c.cor
        });
      } else {
        existing.votos += c.votos;
      }
    }

    ufsResult.push({
      uf: meta.uf,
      nome: meta.nome,
      regiao: meta.regiao,
      secoesTotalizadasPct: snap.secoesTotalizadasPct,
      totalSecoes: snap.totalSecoes,
      secoesApuradas: snap.secoesApuradas,
      totalVotosValidos: snap.totalVotosValidos,
      timestamp: snap.timestamp,
      lulaPct,
      lulaVotos,
      bolsonaroPct,
      bolsonaroVotos
    });
  }

  if (!brParsed && availableUFsCount === 0) {
    throw new Error(`Nenhum endpoint do TSE respondeu para pleito ${electionCode}`);
  }

  const hasCompleteUFs = availableUFsCount === UF_LIST.length;
  const brSecoesApuradas = brParsed?.secoesApuradas ?? 0;
  const brVotosValidos = brParsed?.totalVotosValidos ?? 0;

  const useUFAggregation =
    (hasCompleteUFs &&
      (sumSecoesApuradas > brSecoesApuradas ||
        (sumSecoesApuradas === brSecoesApuradas && sumVotosValidos >= brVotosValidos))) ||
    (availableUFsCount > 0 &&
      (!brParsed || (sumSecoesApuradas > brSecoesApuradas && sumVotosValidos >= brVotosValidos)));

  if (useUFAggregation) {
    const secoesTotalizadasPct = computePreciseSecoesPct(sumSecoesApuradas, sumTotalSecoes, sumVotosValidos);

    const aggregatedCandidatos: CandidateResult[] = Array.from(candAccumulator.values()).map(c => ({
      id: c.id,
      nome: c.nome,
      numero: c.numero,
      partido: c.partido,
      votos: c.votos,
      percentual: sumVotosValidos > 0 ? Number(((c.votos / sumVotosValidos) * 100).toFixed(2)) : 0,
      posicao: c.seq,
      cor: c.cor
    }));

    aggregatedCandidatos.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
    aggregatedCandidatos.forEach((c, idx) => {
      c.posicao = idx + 1;
    });

    if (aggregatedCandidatos.length === 2 && sumVotosValidos > 0) {
      aggregatedCandidatos[1].percentual = Number(
        Math.max(0, 100 - aggregatedCandidatos[0].percentual).toFixed(2)
      );
    }

    const votosBrancosPct =
      sumVotosComparecimento > 0 ? Number(((sumBrancos / sumVotosComparecimento) * 100).toFixed(2)) : 0;
    const votosNulosPct =
      sumVotosComparecimento > 0 ? Number(((sumNulos / sumVotosComparecimento) * 100).toFixed(2)) : 0;
    const abstencaoPct =
      sumEleitoradoInstalado > 0 ? Number(((sumAbstencao / sumEleitoradoInstalado) * 100).toFixed(2)) : 0;

    const currentBrasiliaTime = new Date().toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false
    });

    const effectiveTimestamp =
      sumSecoesApuradas > 0
        ? latestActiveUFTimestamp || brParsed?.timestamp || latestAnyUFTimestamp || currentBrasiliaTime
        : currentBrasiliaTime;

    const secoesAdiantadasUF = Math.max(0, sumSecoesApuradas - brSecoesApuradas);
    const votosAdiantadosUF = Math.max(0, sumVotosValidos - brVotosValidos);

    const timeline2026 = recordTimelinePoint(
      electionCode,
      secoesTotalizadasPct,
      effectiveTimestamp,
      aggregatedCandidatos
    );

    return {
      ano: 2026,
      timestamp: effectiveTimestamp,
      dataHoraISO: new Date().toISOString(),
      secoesTotalizadasPct,
      totalSecoes: sumTotalSecoes,
      secoesApuradas: sumSecoesApuradas,
      totalVotosValidos: sumVotosValidos,
      votosBrancos: sumBrancos,
      votosBrancosPct,
      votosNulos: sumNulos,
      votosNulosPct,
      abstencao: sumAbstencao,
      abstencaoPct,
      secoesAdiantadasUF,
      votosAdiantadosUF,
      ufs: ufsResult,
      polymarket,
      candidatos: aggregatedCandidatos,
      status:
        sumSecoesApuradas >= sumTotalSecoes && sumTotalSecoes > 0
          ? 'finalizada'
          : secoesTotalizadasPct > 0
          ? 'em_andamento'
          : 'aguardando',
      origem: 'tse-uf-turbo',
      timeline2026
    };
  }

  const primary = brParsed!;
  const currentBrasiliaTime = new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour12: false
  });
  const primaryTimestamp = primary.secoesApuradas > 0 ? primary.timestamp : currentBrasiliaTime;

  const timeline2026 = recordTimelinePoint(
    electionCode,
    primary.secoesTotalizadasPct,
    primaryTimestamp,
    primary.candidatos
  );

  return {
    ano: 2026,
    timestamp: primaryTimestamp,
    dataHoraISO: new Date().toISOString(),
    secoesTotalizadasPct: primary.secoesTotalizadasPct,
    totalSecoes: primary.totalSecoes,
    secoesApuradas: primary.secoesApuradas,
    totalVotosValidos: primary.totalVotosValidos,
    votosBrancos: primary.votosBrancos,
    votosBrancosPct: primary.votosBrancosPct,
    votosNulos: primary.votosNulos,
    votosNulosPct: primary.votosNulosPct,
    abstencao: primary.abstencao,
    abstencaoPct: primary.abstencaoPct,
    secoesAdiantadasUF: 0,
    votosAdiantadosUF: 0,
    ufs: ufsResult.length > 0 ? ufsResult : undefined,
    polymarket,
    candidatos: primary.candidatos,
    status:
      primary.secoesApuradas >= primary.totalSecoes && primary.totalSecoes > 0
        ? 'finalizada'
        : primary.secoesTotalizadasPct > 0
        ? 'em_andamento'
        : 'aguardando',
    origem: 'tse-live',
    timeline2026
  };
}

/**
 * Gera um estado de simulação realista de 2º Turno (incluindo as 28 UFs e o avanço Multi-UF),
 * permitindo também simular qualquer percentual ou ultrapassagem via parâmetros de URL (?demo=true&pct1=50.8&pct2=49.2).
 */
function generateDemoState2026(searchParams?: URLSearchParams): ElectionState {
  const now = new Date();
  const timeStr = '18:48:15';

  const totalSecoes = 499248;
  const rawUrnasParam = searchParams?.get('urnas') ?? searchParams?.get('pct');
  const pct = parseSafeFloat(rawUrnasParam, 64.80);
  const secoesApuradas = pct <= 0 ? 0 : pct >= 100 ? totalSecoes : Math.max(1, Math.round((pct / 100) * totalSecoes));
  const totalVotosValidos = pct <= 0 ? 0 : Math.max(200, Math.round((pct / 100) * 120000000));

  const cand1Nome = (searchParams?.get('cand1') || 'LULA').slice(0, 40);
  const cand1Partido = (searchParams?.get('partido1') || 'PT').slice(0, 15);
  const hasCustomPct1 = searchParams?.has('pct1');
  const hasCustomPct2 = searchParams?.has('pct2');

  let cand1Pct = pct <= 0 && !hasCustomPct1 && !hasCustomPct2 ? 0 : parseSafeFloat(searchParams?.get('pct1'), 50.45);
  let cand2Pct = pct <= 0 && !hasCustomPct1 && !hasCustomPct2 ? 0 : parseSafeFloat(searchParams?.get('pct2'), Number((100 - cand1Pct).toFixed(2)));

  if (pct > 0 || hasCustomPct1 || hasCustomPct2) {
    if (!hasCustomPct1 && hasCustomPct2) {
      cand1Pct = Number(Math.max(0, 100 - cand2Pct).toFixed(2));
    } else if (!hasCustomPct2) {
      cand2Pct = Number(Math.max(0, 100 - cand1Pct).toFixed(2));
    }
  }

  const cand2Nome = (searchParams?.get('cand2') || 'FLÁVIO BOLSONARO').slice(0, 40);
  const cand2Partido = (searchParams?.get('partido2') || 'PL').slice(0, 15);

  const cand1Votes = Math.round(totalVotosValidos * (cand1Pct / 100));
  const cand2Votes = Math.max(0, totalVotosValidos - cand1Votes);

  const rawCandidatos: CandidateResult[] = [
    {
      id: 'cand-13',
      nome: cand1Nome,
      numero: '13',
      partido: cand1Partido,
      votos: cand1Votes,
      percentual: cand1Pct,
      posicao: 1,
      cor: ''
    },
    {
      id: 'cand-22',
      nome: cand2Nome,
      numero: '22',
      partido: cand2Partido,
      votos: cand2Votes,
      percentual: cand2Pct,
      posicao: 2,
      cor: ''
    }
  ];

  rawCandidatos.forEach(c => {
    if (!c.cor) c.cor = getCandidateColor(c);
  });

  rawCandidatos.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
  rawCandidatos.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

  const c1Key = cand1Nome.toUpperCase().trim();
  const c2Key = cand2Nome.toUpperCase().trim();

  const demoUFs: UFResult[] = UF_LIST.map((meta, idx) => {
    const ufPct = pct <= 0 ? 0 : Number(Math.min(100, Math.max(0, pct * meta.demoProgressBias)).toFixed(2));
    const ufSecoesApuradas = ufPct <= 0 ? 0 : Math.round((ufPct / 100) * meta.defaultSecoes);
    const ufVotosValidos = ufPct <= 0 ? 0 : Math.round(120000000 * (meta.demoWeight / 100) * (ufPct / 100));
    const shift = cand1Pct > 0 ? cand1Pct - 50.45 : 0;
    const stateVariation = ((idx % 5) - 2) * 0.45;
    const lulaPct = ufVotosValidos <= 0 ? 0 : Number(Math.min(95, Math.max(5, meta.demoLulaShare + shift + stateVariation)).toFixed(2));
    const bolsonaroPct = ufVotosValidos <= 0 ? 0 : Number((100 - lulaPct).toFixed(2));
    const lulaVotos = Math.round(ufVotosValidos * (lulaPct / 100));
    const bolsonaroVotos = Math.max(0, ufVotosValidos - lulaVotos);

    return {
      uf: meta.uf,
      nome: meta.nome,
      regiao: meta.regiao,
      secoesTotalizadasPct: ufPct,
      totalSecoes: meta.defaultSecoes,
      secoesApuradas: ufSecoesApuradas,
      totalVotosValidos: ufVotosValidos,
      timestamp: timeStr,
      lulaPct,
      lulaVotos,
      bolsonaroPct,
      bolsonaroVotos
    };
  });

  const basePoly = polymarketCache.data;
  const hasLiveDelta =
    (basePoly.lulaDeltaPct !== undefined && Math.abs(basePoly.lulaDeltaPct) >= 0.1) ||
    (basePoly.bolsonaroDeltaPct !== undefined && Math.abs(basePoly.bolsonaroDeltaPct) >= 0.1);

  const baseDemoTimeline: TimelinePoint2026[] = [
    { urnasPct: 5.0, timestamp: '17:15', candidatos: { [c1Key]: 45.80, [c2Key]: 54.20 } },
    { urnasPct: 18.0, timestamp: '17:35', candidatos: { [c1Key]: 47.40, [c2Key]: 52.60 } },
    { urnasPct: 35.0, timestamp: '18:00', candidatos: { [c1Key]: 48.75, [c2Key]: 51.25 } },
    { urnasPct: 50.0, timestamp: '18:25', candidatos: { [c1Key]: 49.65, [c2Key]: 50.35 } }
  ];
  const filteredDemoTimeline =
    pct <= 0
      ? []
      : [
          ...baseDemoTimeline.filter(pt => pt.urnasPct < pct - 0.05),
          { urnasPct: pct, timestamp: timeStr, candidatos: { [c1Key]: cand1Pct, [c2Key]: cand2Pct } }
        ];

  return {
    ano: 2026,
    timestamp: pct <= 0 ? '17:00:00' : timeStr,
    dataHoraISO: now.toISOString(),
    secoesTotalizadasPct: pct,
    totalSecoes,
    secoesApuradas,
    totalVotosValidos,
    votosBrancos: Math.round(totalVotosValidos * 0.0145),
    votosBrancosPct: pct > 0 ? 1.38 : 0,
    votosNulos: Math.round(totalVotosValidos * 0.0312),
    votosNulosPct: pct > 0 ? 2.96 : 0,
    abstencao: Math.round(158745502 * (pct / 100) * 0.2045),
    abstencaoPct: pct > 0 ? 20.45 : 0,
    secoesAdiantadasUF: pct > 0 && pct < 100 ? 1842 : 0,
    votosAdiantadosUF: pct > 0 && pct < 100 ? 214590 : 0,
    ufs: demoUFs,
    polymarket: hasLiveDelta
      ? basePoly
      : {
          ...basePoly,
          lulaDeltaPct: 1.8,
          bolsonaroDeltaPct: -1.8,
          deltaWindow: '5m'
        },
    candidatos: rawCandidatos,
    status: secoesApuradas >= totalSecoes && totalSecoes > 0 ? 'finalizada' : pct > 0 ? 'em_andamento' : 'aguardando',
    origem: 'tse-demo',
    mensagemStatus: `MODO DEMONSTRAÇÃO 2º TURNO (simulando ${pct.toFixed(2)}% das urnas)`,
    timeline2026: filteredDemoTimeline
  };
}

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(clientIp, 400, 60000)) {
    return NextResponse.json(
      { erro: 'Limite de requisições excedido. Tente novamente em alguns segundos.' },
      { status: 429, headers: { 'Retry-After': '5' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === 'true';

  const rawCode = searchParams.get('code') || DEFAULT_ELECTION_CODE;
  const rawCycle = searchParams.get('cycle') || DEFAULT_ELECTION_CYCLE;

  const electionCode = /^\d{1,6}$/.test(rawCode) ? rawCode : DEFAULT_ELECTION_CODE;
  const cycle = /^ele\d{4}$/.test(rawCycle) ? rawCycle : DEFAULT_ELECTION_CYCLE;

  if (forceDemo || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    await getPolymarketOdds();
    return NextResponse.json(generateDemoState2026(searchParams), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        'X-Data-Source': 'demo'
      }
    });
  }

  const cacheKey = `${cycle}:${electionCode}`;
  const nowMs = Date.now();
  const cached = liveCache.get(cacheKey);
  if (cached && nowMs - cached.timestampMs < 1500) {
    return NextResponse.json(cached.state, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=3',
        'X-Data-Source': cached.state.origem
      }
    });
  }

  try {
    let promise = inFlightRequests.get(cacheKey);
    if (!promise) {
      promise = fetchLiveMultiUFTurboState(cycle, electionCode);
      inFlightRequests.set(cacheKey, promise);
    }

    const electionState = await promise;
    liveCache.set(cacheKey, { timestampMs: Date.now(), state: electionState });
    inFlightRequests.delete(cacheKey);

    return NextResponse.json(electionState, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=3',
        'X-Data-Source': electionState.origem
      }
    });
  } catch (error) {
    inFlightRequests.delete(cacheKey);
    console.error('[TSE API] Erro ao consultar motor Multi-UF Dual-Channel do CDN oficial:', error);
    return NextResponse.json(generateDemoState2026(searchParams), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        'X-Data-Source': 'fallback-demo-error'
      }
    });
  }
}
