import { NextRequest, NextResponse } from 'next/server';
import type { ElectionState, CandidateResult } from '@/lib/types';
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
  carg?: TSECargoNode[];
  cand?: TSECandNode[];
}

// Código oficial do pleito presidencial 2026 configurável
const DEFAULT_ELECTION_CODE = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE || '6257';
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

/**
 * Gera um estado de simulação realista para testes antes da abertura das urnas às 17h,
 * permitindo também simular qualquer candidato ou ultrapassagem via parâmetros de URL.
 */
function generateDemoState2026(searchParams?: URLSearchParams): ElectionState {
  const now = new Date();
  const timeStr = '18:48:00';

  // Simulação de apuração realista em 64.80%
  const totalSecoes = 492000;
  const pct = 64.80;
  const secoesApuradas = Math.round((pct / 100) * totalSecoes);
  const totalVotosValidos = 78540200;

  // Candidatos configuráveis via URL para testes dinâmicos com sanitização
  const cand1Nome = (searchParams?.get('cand1') || 'LULA').slice(0, 40);
  const cand1Partido = (searchParams?.get('partido1') || 'PT').slice(0, 15);
  const cand1Pct = parseSafeFloat(searchParams?.get('pct1'), 47.85);

  const cand2Nome = (searchParams?.get('cand2') || 'FLÁVIO BOLSONARO').slice(0, 40);
  const cand2Partido = (searchParams?.get('partido2') || 'PL').slice(0, 15);
  const cand2Pct = parseSafeFloat(searchParams?.get('pct2'), 44.10);

  const cand3Nome = (searchParams?.get('cand3') || 'RONALDO CAIADO').slice(0, 40);
  const cand3Partido = (searchParams?.get('partido3') || 'UNIÃO').slice(0, 15);
  const cand3Pct = parseSafeFloat(searchParams?.get('pct3'), 4.80);

  const cand4Nome = (searchParams?.get('cand4') || 'ROMEU ZEMA').slice(0, 40);
  const cand4Partido = (searchParams?.get('partido4') || 'NOVO').slice(0, 15);
  const cand4Pct = parseSafeFloat(searchParams?.get('pct4'), 2.25);

  const candOutrosPct = Math.max(0, Number((100 - (cand1Pct + cand2Pct + cand3Pct + cand4Pct)).toFixed(2)));

  const cand1Votes = Math.round(totalVotosValidos * (cand1Pct / 100));
  const cand2Votes = Math.round(totalVotosValidos * (cand2Pct / 100));
  const cand3Votes = Math.round(totalVotosValidos * (cand3Pct / 100));
  const cand4Votes = Math.round(totalVotosValidos * (cand4Pct / 100));
  const candOutrosVotes = totalVotosValidos - (cand1Votes + cand2Votes + cand3Votes + cand4Votes);

  const rawCandidatos: CandidateResult[] = [
    {
      id: 'cand-1',
      nome: cand1Nome,
      numero: '13',
      partido: cand1Partido,
      votos: cand1Votes,
      percentual: cand1Pct,
      posicao: 1,
      cor: ''
    },
    {
      id: 'cand-2',
      nome: cand2Nome,
      numero: '22',
      partido: cand2Partido,
      votos: cand2Votes,
      percentual: cand2Pct,
      posicao: 2,
      cor: ''
    },
    {
      id: 'cand-3',
      nome: cand3Nome,
      numero: '44',
      partido: cand3Partido,
      votos: cand3Votes,
      percentual: cand3Pct,
      posicao: 3,
      cor: ''
    },
    {
      id: 'cand-4',
      nome: cand4Nome,
      numero: '30',
      partido: cand4Partido,
      votos: cand4Votes,
      percentual: cand4Pct,
      posicao: 4,
      cor: ''
    },
    {
      id: 'cand-5',
      nome: 'OUTROS CANDIDATOS',
      numero: '--',
      partido: 'DIVERSOS',
      votos: candOutrosVotes,
      percentual: candOutrosPct,
      posicao: 5,
      cor: '#52525B'
    }
  ];

  // Atribuir cores dinâmicas
  rawCandidatos.forEach(c => {
    if (!c.cor) c.cor = getCandidateColor(c);
  });

  // Garantir ordenação estritamente dinâmica por votos/percentual
  rawCandidatos.sort((a, b) => b.percentual - a.percentual);
  rawCandidatos.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

  return {
    ano: 2026,
    timestamp: timeStr,
    dataHoraISO: now.toISOString(),
    secoesTotalizadasPct: pct,
    totalSecoes,
    secoesApuradas,
    totalVotosValidos,
    candidatos: rawCandidatos,
    status: 'em_andamento',
    origem: 'tse-demo',
    mensagemStatus: 'MODO DEMONSTRAÇÃO (simulando 64.8% para testes antes das 17h)'
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
            'User-Agent': 'LadoALado-Eleicoes/1.0 (Jornalismo de Dados)'
          },
          next: { revalidate: 15 } // SWR 15s na borda
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
    const candidatos: CandidateResult[] = [];

    if (tseData.s && typeof tseData.s === 'object') {
      // Formato oficial 2026 (u.json / u.jws com estrutura completa)
      const sObj = tseData.s;
      secoesTotalizadasPct = parseTSEFloat(sObj.pst);
      totalSecoes = parseTSEInt(sObj.ts);
      secoesApuradas = parseTSEInt(sObj.st);

      const vObj = (tseData.v || {}) as Record<string, string>;
      totalVotosValidos = parseTSEInt(vObj.vv || vObj.tv);

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

    // Ordenar por percentual estritamente decrescente e atualizar posições dinamicamente
    candidatos.sort((a, b) => b.percentual - a.percentual);
    candidatos.forEach((c, idx) => {
      c.posicao = idx + 1;
    });

    const electionState: ElectionState = {
      ano: 2026,
      timestamp: tseData.hg || '17:00:00',
      dataHoraISO: new Date().toISOString(),
      secoesTotalizadasPct,
      totalSecoes,
      secoesApuradas,
      totalVotosValidos,
      candidatos,
      status: secoesTotalizadasPct >= 99.9 ? 'finalizada' : secoesTotalizadasPct > 0 ? 'em_andamento' : 'aguardando',
      origem: 'tse-live'
    };

    return NextResponse.json(electionState, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Data-Source': 'tse-live'
      }
    });
  } catch (error) {
    console.error('[TSE API] Erro ao consultar CDN oficial:', error);
    // Em caso de falha de rede/timeout, retornar fallback demo para não quebrar a UI
    return NextResponse.json(generateDemoState2026(), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'X-Data-Source': 'fallback-demo-error'
      }
    });
  }
}
