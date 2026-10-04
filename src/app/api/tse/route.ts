import { NextRequest, NextResponse } from 'next/server';
import type { ElectionState, TSEApiResponse, CandidateResult } from '@/lib/types';

// Código oficial do pleito presidencial 2026 configurável
const DEFAULT_ELECTION_CODE = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE || '600';
const DEFAULT_ELECTION_CYCLE = process.env.NEXT_PUBLIC_TSE_ELECTION_CYCLE || 'ele2026';

// Paleta de cores institucionais editoriais para candidatos
const PARTY_COLORS: Record<string, string> = {
  'PT': '#C5221F',
  'PL': '#1E3A8A',
  'MDB': '#15803D',
  'PDT': '#B45309',
  'PSOL': '#DC2626',
  'NOVO': '#EA580C',
  'PSDB': '#2563EB',
  'UNIAO': '#0284C7',
  'REPUBLICANOS': '#0369A1',
};

function getCandidateColor(nome: string, partido: string, index: number): string {
  const upperPart = partido.toUpperCase();
  for (const [key, color] of Object.entries(PARTY_COLORS)) {
    if (upperPart.includes(key)) return color;
  }
  if (index === 0) return '#C5221F';
  if (index === 1) return '#1E3A8A';
  return '#52525B';
}

function parseTSEFloat(value: string | undefined): number {
  if (!value) return 0;
  return Number(value.replace('.', '').replace(',', '.'));
}

function parseTSEInt(value: string | undefined): number {
  if (!value) return 0;
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
}

/**
 * Gera um estado de simulação realista para testes antes da abertura das urnas às 17h
 */
function generateDemoState2026(): ElectionState {
  const now = new Date();
  // Para simulação realista de 64.8% de urnas, o horário de apuração no Brasil é por volta das 18:48
  const timeStr = '18:48:00';

  // Simulação de apuração realista em 64.80%
  const totalSecoes = 492000;
  const pct = 64.80;
  const secoesApuradas = Math.round((pct / 100) * totalSecoes);
  const totalVotosValidos = 78540200;

  const candLulaVotes = Math.round(totalVotosValidos * 0.4785);
  const candOposicaoVotes = Math.round(totalVotosValidos * 0.4410);
  const cand3Votes = Math.round(totalVotosValidos * 0.0480);
  const cand4Votes = Math.round(totalVotosValidos * 0.0225);
  const candOutrosVotes = totalVotosValidos - (candLulaVotes + candOposicaoVotes + cand3Votes + cand4Votes);

  const candidatos: CandidateResult[] = [
    {
      id: 'cand-1',
      nome: 'LULA',
      numero: '13',
      partido: 'PT - BRASIL DA ESPERANÇA',
      votos: candLulaVotes,
      percentual: 47.85,
      posicao: 1,
      cor: '#C5221F'
    },
    {
      id: 'cand-2',
      nome: 'CANDIDATO DA OPOSIÇÃO',
      numero: '22',
      partido: 'PL',
      votos: candOposicaoVotes,
      percentual: 44.10,
      posicao: 2,
      cor: '#1E3A8A'
    },
    {
      id: 'cand-3',
      nome: 'TERCEIRA VIA',
      numero: '15',
      partido: 'MDB / UNIÃO',
      votos: cand3Votes,
      percentual: 4.80,
      posicao: 3,
      cor: '#15803D'
    },
    {
      id: 'cand-4',
      nome: 'QUARTO COLOCADO',
      numero: '30',
      partido: 'NOVO',
      votos: cand4Votes,
      percentual: 2.25,
      posicao: 4,
      cor: '#EA580C'
    },
    {
      id: 'cand-5',
      nome: 'DEMAIS CANDIDATOS',
      numero: '--',
      partido: 'DIVERSOS',
      votos: candOutrosVotes,
      percentual: 1.00,
      posicao: 5,
      cor: '#52525B'
    }
  ];

  return {
    ano: 2026,
    timestamp: timeStr,
    dataHoraISO: now.toISOString(),
    secoesTotalizadasPct: pct,
    totalSecoes,
    secoesApuradas,
    totalVotosValidos,
    candidatos,
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
    return NextResponse.json(generateDemoState2026(), {
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
      return NextResponse.json(generateDemoState2026(), {
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
      const partido = c.cc || '';
      return {
        id: `cand-${c.n}`,
        nome: c.nm || 'CANDIDATO',
        numero: c.n,
        partido,
        votos,
        percentual,
        posicao: parseInt(c.seq, 10) || (idx + 1),
        cor: getCandidateColor(c.nm, partido, idx)
      };
    });

    // Ordenar por percentual
    candidatos.sort((a, b) => b.percentual - a.percentual);

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
