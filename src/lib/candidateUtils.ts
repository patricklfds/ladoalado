import type { CandidateResult } from './types';

/**
 * Paleta editorial institucional para partidos políticos brasileiros
 */
export const PARTY_COLORS: Record<string, string> = {
  'PT': '#C5221F',
  'PL': '#1E3A8A',
  'UP': '#DC2626',
  'PCB': '#991B1B',
  'PSTU': '#B91C1C',
  'PCO': '#7F1D1D',
  'PSOL': '#E11D48',
  'REDE': '#0D9488',
  'PV': '#15803D',
  'PCDOB': '#B91C1C',
  'PDT': '#B45309',
  'PSB': '#EAB308',
  'MDB': '#16A34A',
  'PSDB': '#2563EB',
  'CIDADANIA': '#DB2777',
  'UNIAO': '#0284C7',
  'UNIÃO': '#0284C7',
  'PP': '#0369A1',
  'REPUBLICANOS': '#0284C7',
  'PSD': '#2563EB',
  'PODE': '#0284C7',
  'PODEMOS': '#0284C7',
  'NOVO': '#EA580C',
  'MISSAO': '#0F766E',
  'MISSÃO': '#0F766E',
  'PRD': '#475569',
  'SOLIDARIEDADE': '#F97316',
  'AVANTE': '#D97706',
};

/**
 * Formata qualquer nome de candidato da urna de forma 100% dinâmica.
 * Converte caixas altas da urna em Title Case jornalístico refinado,
 * respeitando preposições e nomes consagrados.
 * Ex: "RENAN SANTOS" -> "Renan Santos"
 *     "SAMARA" -> "Samara"
 *     "SAMARA DA SILVA" -> "Samara da Silva"
 *     "RONALDO CAIADO" -> "Ronaldo Caiado"
 */
export function formatCandidateName(name: string): string {
  if (!name) return '';
  const upper = name.trim().toUpperCase();

  // Tratamento de nomes consagrados de urna
  if (upper === 'LULA' || upper.includes('LUIZ INÁCIO')) return 'Lula';
  if (upper === 'JAIR BOLSONARO' || upper.includes('JAIR MESSIAS')) return 'Jair Bolsonaro';
  if (upper.includes('FLÁVIO BOLSONARO') || upper.includes('FLAVIO BOLSONARO')) return 'Flávio Bolsonaro';
  if (upper === 'OUTROS' || upper.includes('DEMAIS') || upper.includes('OUTROS CANDIDATOS')) return 'Outros candidatos';

  // Conjunto de preposições em português mantidas em caixa baixa
  const preposicoes = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      if (idx > 0 && preposicoes.has(word)) return word;
      // Tratar apóstrofo como d'Avila
      if (word.includes("'")) {
        return word.split("'").map((part, pIdx) => pIdx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join("'");
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Limpa o nome da coligação do TSE extraindo a sigla partidária principal
 * Ex: "PT - BRASIL DA ESPERANÇA (PT/PC do B/PV)" -> "PT"
 *     "UP - UNIDADE POPULAR" -> "UP"
 *     "MISSÃO / MBL" -> "MISSÃO"
 */
export function cleanPartyName(cc: string | undefined): string {
  if (!cc) return '';
  const firstPart = cc.split(/[-/]/)[0].trim();
  return firstPart || cc;
}

/**
 * Retorna a cor editorial para qualquer partido ou candidato de forma dinâmica
 */
export function getCandidateColor(cand: CandidateResult | undefined): string {
  if (!cand) return 'var(--fg)';
  if (cand.cor && cand.cor.startsWith('#')) return cand.cor;

  const party = cand.partido ? cand.partido.toUpperCase().replace(/[^A-Z0-9À-Ú]/g, '') : '';
  const name = cand.nome.toUpperCase();

  if (party === 'PT' || name.includes('LULA')) return 'var(--color-pt)';
  if (party === 'PL' || name.includes('BOLSONARO')) return 'var(--color-pl)';

  for (const [key, color] of Object.entries(PARTY_COLORS)) {
    const cleanKey = key.toUpperCase().replace(/[^A-Z0-9À-Ú]/g, '');
    if (party.includes(cleanKey)) return color;
  }

  return 'var(--fg)';
}

/**
 * Encontra a referência histórica em 2022 de forma 100% dinâmica.
 * Se Renan Santos, Samara, Flávio ou Lula estiverem em 1º, 2º, 3º ou 4º,
 * a referência de comparação é identificada corretamente:
 * 1. Pelo candidato direto correspondente (ex: Lula -> Lula 2022, PL -> Bolsonaro 2022)
 * 2. Pelo mesmo partido em 2022 (ex: UP -> Leo Péricles 2022, MDB -> Simone Tebet 2022)
 * 3. Pela mesma posição ocupada na apuração de 2022 (ex: 3º lugar 2026 vs 3º lugar 2022)
 */
export function getHistoricalReference(
  cand2026: CandidateResult | undefined,
  cands2022: CandidateResult[]
): { label: string; percentual: number; delta: number } | null {
  if (!cand2026 || !cands2022 || cands2022.length === 0) return null;

  const nomeUpper = cand2026.nome.toUpperCase();
  const partyUpper = cand2026.partido ? cand2026.partido.toUpperCase() : '';

  // 1. Lula 2026 -> Lula 2022
  if (nomeUpper.includes('LULA')) {
    const ref = cands2022.find(c => c.nome.toUpperCase().includes('LULA'));
    if (ref) {
      return {
        label: 'vs Lula 2022',
        percentual: ref.percentual,
        delta: Number((cand2026.percentual - ref.percentual).toFixed(2))
      };
    }
  }

  // 2. Flávio Bolsonaro / PL -> Jair Bolsonaro 2022
  if (nomeUpper.includes('BOLSONARO') || partyUpper === 'PL') {
    const ref = cands2022.find(c => c.nome.toUpperCase().includes('BOLSONARO'));
    if (ref) {
      return {
        label: 'vs Jair Bolsonaro 2022',
        percentual: ref.percentual,
        delta: Number((cand2026.percentual - ref.percentual).toFixed(2))
      };
    }
  }

  // 3. Mesmo partido em 2022 (ex: UP -> Leo Péricles, MDB -> Simone Tebet, PDT -> Ciro Gomes)
  const byParty = cands2022.find(c => c.partido.toUpperCase() === partyUpper);
  if (byParty) {
    return {
      label: `vs ${formatCandidateName(byParty.nome)} (${byParty.partido}) 2022`,
      percentual: byParty.percentual,
      delta: Number((cand2026.percentual - byParty.percentual).toFixed(2))
    };
  }

  // 4. Fallback nominal: mesmo ranking de 2022 (ex: 3º lugar de 2026 vs 3º lugar de 2022)
  const byRank = cands2022[cand2026.posicao - 1];
  if (byRank) {
    return {
      label: `vs ${cand2026.posicao}º em 2022 (${formatCandidateName(byRank.nome)})`,
      percentual: byRank.percentual,
      delta: Number((cand2026.percentual - byRank.percentual).toFixed(2))
    };
  }

  return null;
}
