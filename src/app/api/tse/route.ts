import { NextRequest, NextResponse } from 'next/server';
import type { ElectionState, CandidateResult, TimelinePoint2026 } from '@/lib/types';
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
  hg?: string;
  pst?: string;
  s?: string | Record<string, string>;
  st?: string;
  vscv?: string;
  v?: Record<string, string>;
  e?: Record<string, string>;
  carg?: TSECargoNode[];
  cand?: TSECandNode[];
}

// Código oficial do 2º Turno Presidencial 2026 no CDN do TSE (6258)
// Ignora códigos legados do 1º turno ('600' ou '6257') caso ainda estejam em variáveis de ambiente antigas
const envCode = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE;
const DEFAULT_ELECTION_CODE =
  envCode && envCode !== '600' && envCode !== '6257' ? envCode : '6258';
const DEFAULT_ELECTION_CYCLE = process.env.NEXT_PUBLIC_TSE_ELECTION_CYCLE || 'ele2026';

function parseTSEFloat(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value.replace('.', '').replace(',', '.'));
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

// Rate Limiter simples em memória para Edge / Node
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  record.count++;
  return record.count > maxRequests;
}

// Buffer histórico em memória para traçar a evolução real das urnas do 2º Turno de 2026 ao longo do tempo
// Inicia limpo para o 2º Turno (sem pontos do 1º turno)
const historicalTimeline2026: TimelinePoint2026[] = [];

function recordTimelinePoint(urnasPct: number, timestamp: string, candidatos: CandidateResult[]): TimelinePoint2026[] {
  if (urnasPct > 0 && candidatos.length > 0) {
    const candMap: Record<string, number> = {};
    candidatos.forEach(c => {
      candMap[c.nome.toUpperCase().trim()] = c.percentual;
    });

    const existingIdx = historicalTimeline2026.findIndex(p => Math.abs(p.urnasPct - urnasPct) < 0.05);
    if (existingIdx >= 0) {
      historicalTimeline2026[existingIdx] = {
        urnasPct,
        timestamp,
        candidatos: { ...historicalTimeline2026[existingIdx].candidatos, ...candMap }
      };
    } else {
      historicalTimeline2026.push({
        urnasPct,
        timestamp,
        candidatos: candMap
      });
      historicalTimeline2026.sort((a, b) => a.urnasPct - b.urnasPct);
    }
  }
  return [...historicalTimeline2026];
}

/**
 * Gera um estado de simulação realista de 2º Turno (apenas os 2 finalistas somando 100% dos votos válidos),
 * permitindo também simular qualquer percentual ou ultrapassagem via parâmetros de URL (?demo=true&pct1=50.8&pct2=49.2).
 */
function generateDemoState2026(searchParams?: URLSearchParams): ElectionState {
  const now = new Date();
  const timeStr = '18:48:00';

  // Simulação de apuração realista de 2º Turno em 64.80%
  const totalSecoes = 499248;
  const pct = parseSafeFloat(searchParams?.get('urnas'), 64.80);
  const secoesApuradas = Math.round((pct / 100) * totalSecoes);
  const totalVotosValidos = Math.round((pct / 100) * 120000000);

  // Candidatos configuráveis via URL para testes dinâmicos de 2º turno
  const cand1Nome = (searchParams?.get('cand1') || 'LULA').slice(0, 40);
  const cand1Partido = (searchParams?.get('partido1') || 'PT').slice(0, 15);
  const hasCustomPct1 = searchParams?.has('pct1');
  const hasCustomPct2 = searchParams?.has('pct2');

  let cand1Pct = parseSafeFloat(searchParams?.get('pct1'), 50.45);
  let cand2Pct = parseSafeFloat(searchParams?.get('pct2'), Number((100 - cand1Pct).toFixed(2)));

  if (!hasCustomPct1 && hasCustomPct2) {
    cand1Pct = Number(Math.max(0, 100 - cand2Pct).toFixed(2));
  } else if (!hasCustomPct2) {
    cand2Pct = Number(Math.max(0, 100 - cand1Pct).toFixed(2));
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

  // Atribuir cores dinâmicas
  rawCandidatos.forEach(c => {
    if (!c.cor) c.cor = getCandidateColor(c);
  });

  // Garantir ordenação estritamente dinâmica por votos/percentual
  rawCandidatos.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
  rawCandidatos.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

  const c1Key = cand1Nome.toUpperCase().trim();
  const c2Key = cand2Nome.toUpperCase().trim();

  return {
    ano: 2026,
    timestamp: timeStr,
    dataHoraISO: now.toISOString(),
    secoesTotalizadasPct: pct,
    totalSecoes,
    secoesApuradas,
    totalVotosValidos,
    votosBrancos: Math.round(totalVotosValidos * 0.0145),
    votosBrancosPct: 1.38,
    votosNulos: Math.round(totalVotosValidos * 0.0312),
    votosNulosPct: 2.96,
    abstencao: Math.round(158745502 * (pct / 100) * 0.2045),
    abstencaoPct: 20.45,
    candidatos: rawCandidatos,
    status: 'em_andamento',
    origem: 'tse-demo',
    mensagemStatus: `MODO DEMONSTRAÇÃO 2º TURNO (simulando ${pct.toFixed(1)}% das urnas)`,
    timeline2026: [
      { urnasPct: 5.0, timestamp: '17:15', candidatos: { [c1Key]: 45.80, [c2Key]: 54.20 } },
      { urnasPct: 18.0, timestamp: '17:35', candidatos: { [c1Key]: 47.40, [c2Key]: 52.60 } },
      { urnasPct: 35.0, timestamp: '18:00', candidatos: { [c1Key]: 48.75, [c2Key]: 51.25 } },
      { urnasPct: 50.0, timestamp: '18:25', candidatos: { [c1Key]: 49.65, [c2Key]: 50.35 } },
      { urnasPct: pct, timestamp: timeStr, candidatos: { [c1Key]: cand1Pct, [c2Key]: cand2Pct } }
    ]
  };
}

export async function GET(request: NextRequest) {
  // 1. Blindagem de Rate Limiting por IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(clientIp, 80, 60000)) {
    return NextResponse.json(
      { erro: 'Limite de requisições excedido. Tente novamente em alguns segundos.' },
      { status: 429, headers: { 'Retry-After': '30' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === 'true';

  // 2. Validação rigorosa dos parâmetros de pleito contra SSRF / injeções
  const rawCode = searchParams.get('code') || DEFAULT_ELECTION_CODE;
  const rawCycle = searchParams.get('cycle') || DEFAULT_ELECTION_CYCLE;

  const electionCode = /^\d{1,6}$/.test(rawCode) ? rawCode : DEFAULT_ELECTION_CODE;
  const cycle = /^ele\d{4}$/.test(rawCycle) ? rawCycle : DEFAULT_ELECTION_CYCLE;

  // Se o usuário solicitou demo explicitamente ou se a variável de ambiente força demo
  if (forceDemo || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.json(generateDemoState2026(searchParams), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Data-Source': 'demo'
      }
    });
  }

  // Montar as URLs possíveis do CDN do TSE (suporta u.json oficial de 2026, r.json simplificado e u.jws)
  const paddedCode = electionCode.padStart(6, '0');
  const candidateUrls = [
    `https://resultados.tse.jus.br/oficial/${cycle}/${electionCode}/dados/br/br-c0001-e${paddedCode}-u.json`,
    `https://resultados.tse.jus.br/oficial/${cycle}/${electionCode}/dados-simplificados/br/br-c0001-e${paddedCode}-r.json`,
    `https://resultados.tse.jus.br/oficial/${cycle}/${electionCode}/dados/br/br-c0001-e${paddedCode}-u.jws`
  ];

  try {
    let response: Response | null = null;
    let successfulUrl = '';

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'LadoALado-Eleicoes/2.0 (Jornalismo de Dados)'
          },
          next: { revalidate: 5 } // SWR 5s na borda para apuração ultrarrápida
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          response = res;
          successfulUrl = url;
          break;
        }
      } catch {
        // Tentar próxima URL candidata
      }
    }

    if (!response || !response.ok) {
      console.warn(`[TSE API] Nenhuma URL retornou 200 para pleito ${electionCode}. Ativando fallback demo.`);
      return NextResponse.json(generateDemoState2026(searchParams), {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
          'X-Data-Source': 'fallback-demo-404'
        }
      });
    }

    const rawText = await response.text();
    let tseData: TSEPayload | null = null;

    if (successfulUrl.endsWith('.jws') || rawText.startsWith('eyJ')) {
      const parts = rawText.split('.');
      if (parts.length >= 2) {
        const jsonStr = Buffer.from(parts[1], 'base64url').toString('utf-8');
        tseData = JSON.parse(jsonStr) as TSEPayload;
      }
    } else {
      tseData = JSON.parse(rawText) as TSEPayload;
    }

    if (!tseData) {
      throw new Error('Falha ao decodificar JSON do TSE');
    }

    let secoesTotalizadasPct = 0;
    let totalSecoes = 0;
    let secoesApuradas = 0;
    let totalVotosValidos = 0;
    let votosBrancos: number | undefined;
    let votosBrancosPct: number | undefined;
    let votosNulos: number | undefined;
    let votosNulosPct: number | undefined;
    let abstencao: number | undefined;
    let abstencaoPct: number | undefined;
    const candidatos: CandidateResult[] = [];

    if (tseData.s && typeof tseData.s === 'object') {
      // Formato oficial 2026 (u.json / u.jws com estrutura completa)
      const sObj = tseData.s;
      secoesTotalizadasPct = parseTSEFloat(sObj.pst);
      totalSecoes = parseTSEInt(sObj.ts);
      secoesApuradas = parseTSEInt(sObj.st);

      const vObj = (tseData.v || {}) as Record<string, string>;
      totalVotosValidos = parseTSEInt(vObj.vv || vObj.tv);
      if (vObj.vb !== undefined) votosBrancos = parseTSEInt(vObj.vb);
      if (vObj.pvb !== undefined) votosBrancosPct = parseTSEFloat(vObj.pvb);
      if (vObj.tvn !== undefined || vObj.vn !== undefined) votosNulos = parseTSEInt(vObj.tvn || vObj.vn);
      if (vObj.ptvn !== undefined || vObj.pvn !== undefined) votosNulosPct = parseTSEFloat(vObj.ptvn || vObj.pvn);

      const eObj = (tseData.e || {}) as Record<string, string>;
      if (eObj.a !== undefined) abstencao = parseTSEInt(eObj.a);
      if (eObj.pa !== undefined) abstencaoPct = parseTSEFloat(eObj.pa);

      if (Array.isArray(tseData.carg) && tseData.carg[0]?.agr) {
        tseData.carg[0].agr.forEach((a: TSEColigacaoNode) => {
          (a.par || []).forEach((p: TSEParNode) => {
            (p.cand || []).forEach((c: TSECandNode) => {
              const candObj: CandidateResult = {
                id: `cand-${c.n}`,
                nome: (c.nmu || c.nm || 'CANDIDATO').slice(0, 40),
                numero: c.n,
                partido: p.sg || cleanPartyName(c.cc),
                votos: parseTSEInt(c.vap),
                percentual: parseTSEFloat(c.pvap),
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
      // Formato dados-simplificados legado (r.json)
      secoesTotalizadasPct = parseTSEFloat(tseData.pst);
      totalSecoes = parseTSEInt(tseData.s as string);
      secoesApuradas = parseTSEInt(tseData.st as string);
      totalVotosValidos = parseTSEInt(tseData.vscv as string);

      (tseData.cand || []).forEach((c: TSECandNode, idx: number) => {
        const candObj: CandidateResult = {
          id: `cand-${c.n || idx}`,
          nome: (c.nm || 'CANDIDATO').slice(0, 40),
          numero: c.n || String(idx + 1),
          partido: cleanPartyName(c.cc),
          votos: parseTSEInt(c.vap),
          percentual: parseTSEFloat(c.pvap),
          posicao: parseInt(c.seq || '1', 10) || (idx + 1),
          cor: ''
        };
        candObj.cor = getCandidateColor(candObj);
        candidatos.push(candObj);
      });
    }

    // Ordenar por percentual/votos estritamente decrescente, mantendo ordem oficial (seq) em caso de 0%
    candidatos.sort((a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao));
    candidatos.forEach((c, idx) => {
      c.posicao = idx + 1;
    });

    const timeline2026 = recordTimelinePoint(secoesTotalizadasPct, tseData.hg || '17:00:00', candidatos);

    const electionState: ElectionState = {
      ano: 2026,
      timestamp: tseData.hg || '17:00:00',
      dataHoraISO: new Date().toISOString(),
      secoesTotalizadasPct,
      totalSecoes,
      secoesApuradas,
      totalVotosValidos,
      votosBrancos,
      votosBrancosPct,
      votosNulos,
      votosNulosPct,
      abstencao,
      abstencaoPct,
      candidatos,
      status: secoesTotalizadasPct >= 99.9 ? 'finalizada' : secoesTotalizadasPct > 0 ? 'em_andamento' : 'aguardando',
      origem: 'tse-live',
      timeline2026
    };

    return NextResponse.json(electionState, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        'X-Data-Source': 'tse-live'
      }
    });
  } catch (error) {
    console.error('[TSE API] Erro ao consultar CDN oficial:', error);
    // Em caso de falha de rede/timeout, retornar fallback demo para não quebrar a UI
    return NextResponse.json(generateDemoState2026(searchParams), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'X-Data-Source': 'fallback-demo-error'
      }
    });
  }
}
