import { NextRequest, NextResponse } from 'next/server';
import type { ElectionState, TSEApiResponse, CandidateResult } from '@/lib/types';
import { cleanPartyName, getCandidateColor } from '@/lib/candidateUtils';

// Código oficial do pleito presidencial 2026 configurável
const DEFAULT_ELECTION_CODE = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE || '600';
const DEFAULT_ELECTION_CYCLE = process.env.NEXT_PUBLIC_TSE_ELECTION_CYCLE || 'ele2026';

function parseTSEFloat(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace('.', '').replace(',', '.'));
}

function parseTSEInt(value: string | undefined): number {
  if (!value) return 0;
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
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

  // Candidatos configuráveis via URL para testes dinâmicos (ex: Renan Santos, Samara, etc.)
  const cand1Nome = searchParams?.get('cand1') || 'LULA';
  const cand1Partido = searchParams?.get('partido1') || 'PT';
  const cand1Pct = searchParams?.get('pct1') ? parseFloat(searchParams.get('pct1')!) : 47.85;

  const cand2Nome = searchParams?.get('cand2') || 'FLÁVIO BOLSONARO';
  const cand2Partido = searchParams?.get('partido2') || 'PL';
  const cand2Pct = searchParams?.get('pct2') ? parseFloat(searchParams.get('pct2')!) : 44.10;

  const cand3Nome = searchParams?.get('cand3') || 'RONALDO CAIADO';
  const cand3Partido = searchParams?.get('partido3') || 'UNIÃO';
  const cand3Pct = searchParams?.get('pct3') ? parseFloat(searchParams.get('pct3')!) : 4.80;

  const cand4Nome = searchParams?.get('cand4') || 'ROMEU ZEMA';
  const cand4Partido = searchParams?.get('partido4') || 'NOVO';
  const cand4Pct = searchParams?.get('pct4') ? parseFloat(searchParams.get('pct4')!) : 2.25;

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
  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get('demo') === 'true';
  const electionCode = searchParams.get('code') || DEFAULT_ELECTION_CODE;
  const cycle = searchParams.get('cycle') || DEFAULT_ELECTION_CYCLE;

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

  // Montar a URL do CDN do TSE
  const paddedCode = electionCode.padStart(6, '0');
  const tseUrl = `https://resultados.tse.jus.br/oficial/${cycle}/${electionCode}/dados-simplificados/br/br-c0001-e${paddedCode}-r.json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(tseUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LadoALado-Eleicoes/1.0 (Jornalismo de Dados)'
      },
      next: { revalidate: 30 } // Next.js SWR cache na borda
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[TSE API] Resposta não-OK (${response.status}) para ${tseUrl}. Ativando fallback demo.`);
      return NextResponse.json(generateDemoState2026(searchParams), {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
          'X-Data-Source': 'fallback-demo-404'
        }
      });
    }

    const tseData: TSEApiResponse = await response.json();

    const secoesTotalizadasPct = parseTSEFloat(tseData.pst);
    const totalSecoes = parseTSEInt(tseData.s);
    const secoesApuradas = parseTSEInt(tseData.st);
    const totalVotosValidos = parseTSEInt(tseData.vscv);

    const candidatos: CandidateResult[] = (tseData.cand || []).map((c, idx) => {
      const votos = parseTSEInt(c.vap);
      const percentual = parseTSEFloat(c.pvap);
      const partido = cleanPartyName(c.cc);
      const candObj: CandidateResult = {
        id: `cand-${c.n}`,
        nome: c.nm || 'CANDIDATO',
        numero: c.n,
        partido,
        votos,
        percentual,
        posicao: parseInt(c.seq, 10) || (idx + 1),
        cor: ''
      };
      candObj.cor = getCandidateColor(candObj);
      return candObj;
    });

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
