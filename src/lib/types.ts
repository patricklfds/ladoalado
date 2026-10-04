/**
 * Tipagens estritas do sistema "Lado a Lado"
 * Apuração Presidencial Comparada: 2022 vs 2026
 */

export interface TimelinePoint2022 {
  timestamp: string;             // "HH:mm" (ex: "18:42")
  minuteIndex: number;           // Minutos decorridos desde 17:00 (0 a 330)
  secoesTotalizadasPct: number;  // % de seções apuradas (ex: 58.14)
  totalSecoes: number;           // 472075 no 1º turno de 2022
  secoesApuradas: number;
  lulaPct: number;               // % de votos válidos de Lula (13)
  lulaVotos: number;
  bolsonaroPct: number;          // % de votos válidos de Bolsonaro (22)
  bolsonaroVotos: number;
  tebetPct: number;              // % de votos válidos de Simone Tebet (15)
  tebetVotos: number;
  ciroPct: number;               // % de votos válidos de Ciro Gomes (12)
  ciroVotos: number;
  outrosPct: number;             // % somada dos demais candidatos
  outrosVotos: number;
  totalVotosValidos: number;
}

export interface CandidateResult {
  id: string;
  nome: string;
  numero: string;
  partido: string;
  votos: number;
  percentual: number;
  posicao: number;
  cor: string;                  // Cor editorial institucional
}

export type ElectionStatus = 'aguardando' | 'em_andamento' | 'finalizada' | 'erro';

export interface ElectionState {
  ano: 2022 | 2026;
  timestamp: string;             // "HH:mm" ou "HH:mm:ss"
  dataHoraISO: string;
  secoesTotalizadasPct: number;
  totalSecoes: number;
  secoesApuradas: number;
  totalVotosValidos: number;
  candidatos: CandidateResult[];
  status: ElectionStatus;
  origem: 'tse-live' | 'tse-demo' | 'historico-2022';
  mensagemStatus?: string;
}

export type ComparisonMode = 'urnas' | 'horario';

export interface ComparisonData {
  ano2026: ElectionState;
  ano2022: ElectionState;
  modo: ComparisonMode;
  deltaLider: number;            // 2026 1º lugar - 2022 1º lugar
  deltaSegundo: number;          // 2026 2º lugar - 2022 2º lugar
  deltaLula: number;             // Lula 2026 - Lula 2022
  deltaOposicao: number;         // Oposição 2026 - Bolsonaro 2022
  margem2026: number;            // Margem entre 1º e 2º em 2026
  margem2022: number;            // Margem entre 1º e 2º em 2022
  ritmoMinutos: number;          // Diferença de velocidade da apuração em minutos
  tempoRestanteSegundos: number; // Para o countdown de 60s
  isAtualizando: boolean;
}

export interface TSEApiResponse {
  dg: string;                    // Data de geração "DD/MM/AAAA"
  hg: string;                    // Hora de geração "HH:MM:SS"
  pst: string;                   // % seções totalizadas "62,45"
  s: string;                     // Total de seções
  st: string;                    // Seções totalizadas
  vscv: string;                  // Votos a candidatos concorrentes (válidos)
  cand: Array<{
    seq: string;                 // Posição
    sqcand: string;              // Sequencial do candidato
    n: string;                   // Número do candidato
    nm: string;                  // Nome de urna
    cc: string;                  // Coligação
    nv: string;                  // Nome do vice
    vap: string;                 // Votos apurados
    pvap: string;                // % votos apurados "48,15"
  }>;
}
