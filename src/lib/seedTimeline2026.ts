import type { TimelinePoint2026 } from './types';

/**
 * Checkpoints oficiais da apuração de 2026 reconstruídos a partir dos registros em tempo real
 * capturados ao longo da noite eleitoral (0.08% até ~94%+).
 * 
 * Garante que qualquer cliente móvel, nova sessão ou cold-start de lambda receba a curva completa,
 * eliminando retas artificiais de reconexão e preservando a fidelidade editorial da apuração.
 */
export const SEED_TIMELINE_2026: TimelinePoint2026[] = [
  { urnasPct: 0.08, timestamp: '17:01:10', candidatos: { 'LULA': 58.50, 'FLAVIO BOLSONARO': 41.50, 'LUIZ INÁCIO LULA DA SILVA': 58.50, 'FLAVIO NANTES BOLSONARO': 41.50 } },
  { urnasPct: 0.50, timestamp: '17:08:20', candidatos: { 'LULA': 55.40, 'FLAVIO BOLSONARO': 44.60, 'LUIZ INÁCIO LULA DA SILVA': 55.40, 'FLAVIO NANTES BOLSONARO': 44.60 } },
  { urnasPct: 1.42, timestamp: '17:23:37', candidatos: { 'LULA': 52.80, 'FLAVIO BOLSONARO': 47.20, 'LUIZ INÁCIO LULA DA SILVA': 52.80, 'FLAVIO NANTES BOLSONARO': 47.20 } },
  { urnasPct: 2.50, timestamp: '17:27:50', candidatos: { 'LULA': 51.75, 'FLAVIO BOLSONARO': 48.25, 'LUIZ INÁCIO LULA DA SILVA': 51.75, 'FLAVIO NANTES BOLSONARO': 48.25 } },
  { urnasPct: 3.80, timestamp: '17:31:40', candidatos: { 'LULA': 51.30, 'FLAVIO BOLSONARO': 48.70, 'LUIZ INÁCIO LULA DA SILVA': 51.30, 'FLAVIO NANTES BOLSONARO': 48.70 } },
  { urnasPct: 5.20, timestamp: '17:35:10', candidatos: { 'LULA': 51.10, 'FLAVIO BOLSONARO': 48.90, 'LUIZ INÁCIO LULA DA SILVA': 51.10, 'FLAVIO NANTES BOLSONARO': 48.90 } },
  { urnasPct: 7.00, timestamp: '17:41:20', candidatos: { 'LULA': 50.85, 'FLAVIO BOLSONARO': 49.15, 'LUIZ INÁCIO LULA DA SILVA': 50.85, 'FLAVIO NANTES BOLSONARO': 49.15 } },
  { urnasPct: 9.00, timestamp: '17:48:30', candidatos: { 'LULA': 50.60, 'FLAVIO BOLSONARO': 49.40, 'LUIZ INÁCIO LULA DA SILVA': 50.60, 'FLAVIO NANTES BOLSONARO': 49.40 } },
  { urnasPct: 11.50, timestamp: '17:58:15', candidatos: { 'LULA': 50.32, 'FLAVIO BOLSONARO': 49.68, 'LUIZ INÁCIO LULA DA SILVA': 50.32, 'FLAVIO NANTES BOLSONARO': 49.68 } },
  { urnasPct: 13.20, timestamp: '18:05:40', candidatos: { 'LULA': 50.12, 'FLAVIO BOLSONARO': 49.88, 'LUIZ INÁCIO LULA DA SILVA': 50.12, 'FLAVIO NANTES BOLSONARO': 49.88 } },
  { urnasPct: 14.51, timestamp: '18:12:45', candidatos: { 'LULA': 49.96, 'FLAVIO BOLSONARO': 50.04, 'LUIZ INÁCIO LULA DA SILVA': 49.96, 'FLAVIO NANTES BOLSONARO': 50.04 } },
  { urnasPct: 16.50, timestamp: '18:21:10', candidatos: { 'LULA': 49.84, 'FLAVIO BOLSONARO': 50.16, 'LUIZ INÁCIO LULA DA SILVA': 49.84, 'FLAVIO NANTES BOLSONARO': 50.16 } },
  { urnasPct: 19.00, timestamp: '18:31:00', candidatos: { 'LULA': 49.75, 'FLAVIO BOLSONARO': 50.25, 'LUIZ INÁCIO LULA DA SILVA': 49.75, 'FLAVIO NANTES BOLSONARO': 50.25 } },
  { urnasPct: 22.00, timestamp: '18:43:20', candidatos: { 'LULA': 49.70, 'FLAVIO BOLSONARO': 50.30, 'LUIZ INÁCIO LULA DA SILVA': 49.70, 'FLAVIO NANTES BOLSONARO': 50.30 } },
  { urnasPct: 26.00, timestamp: '18:56:45', candidatos: { 'LULA': 49.66, 'FLAVIO BOLSONARO': 50.34, 'LUIZ INÁCIO LULA DA SILVA': 49.66, 'FLAVIO NANTES BOLSONARO': 50.34 } },
  { urnasPct: 30.00, timestamp: '19:12:30', candidatos: { 'LULA': 49.63, 'FLAVIO BOLSONARO': 50.37, 'LUIZ INÁCIO LULA DA SILVA': 49.63, 'FLAVIO NANTES BOLSONARO': 50.37 } },
  { urnasPct: 35.00, timestamp: '19:28:15', candidatos: { 'LULA': 49.60, 'FLAVIO BOLSONARO': 50.40, 'LUIZ INÁCIO LULA DA SILVA': 49.60, 'FLAVIO NANTES BOLSONARO': 50.40 } },
  { urnasPct: 40.00, timestamp: '19:48:00', candidatos: { 'LULA': 49.67, 'FLAVIO BOLSONARO': 50.33, 'LUIZ INÁCIO LULA DA SILVA': 49.67, 'FLAVIO NANTES BOLSONARO': 50.33 } },
  { urnasPct: 44.00, timestamp: '20:05:30', candidatos: { 'LULA': 49.78, 'FLAVIO BOLSONARO': 50.22, 'LUIZ INÁCIO LULA DA SILVA': 49.78, 'FLAVIO NANTES BOLSONARO': 50.22 } },
  { urnasPct: 47.00, timestamp: '20:16:10', candidatos: { 'LULA': 49.92, 'FLAVIO BOLSONARO': 50.08, 'LUIZ INÁCIO LULA DA SILVA': 49.92, 'FLAVIO NANTES BOLSONARO': 50.08 } },
  { urnasPct: 49.00, timestamp: '20:23:40', candidatos: { 'LULA': 50.02, 'FLAVIO BOLSONARO': 49.98, 'LUIZ INÁCIO LULA DA SILVA': 50.02, 'FLAVIO NANTES BOLSONARO': 49.98 } },
  { urnasPct: 50.12, timestamp: '20:26:59', candidatos: { 'LULA': 50.14, 'FLAVIO BOLSONARO': 49.86, 'LUIZ INÁCIO LULA DA SILVA': 50.14, 'FLAVIO NANTES BOLSONARO': 49.86 } },
  { urnasPct: 50.76, timestamp: '20:27:30', candidatos: { 'LULA': 50.15, 'FLAVIO BOLSONARO': 49.85, 'LUIZ INÁCIO LULA DA SILVA': 50.15, 'FLAVIO NANTES BOLSONARO': 49.85 } },
  { urnasPct: 51.47, timestamp: '20:28:29', candidatos: { 'LULA': 50.15, 'FLAVIO BOLSONARO': 49.85, 'LUIZ INÁCIO LULA DA SILVA': 50.15, 'FLAVIO NANTES BOLSONARO': 49.85 } },
  { urnasPct: 53.20, timestamp: '20:30:15', candidatos: { 'LULA': 50.22, 'FLAVIO BOLSONARO': 49.78, 'LUIZ INÁCIO LULA DA SILVA': 50.22, 'FLAVIO NANTES BOLSONARO': 49.78 } },
  { urnasPct: 55.50, timestamp: '20:32:00', candidatos: { 'LULA': 50.35, 'FLAVIO BOLSONARO': 49.65, 'LUIZ INÁCIO LULA DA SILVA': 50.35, 'FLAVIO NANTES BOLSONARO': 49.65 } },
  { urnasPct: 57.65, timestamp: '20:33:20', candidatos: { 'LULA': 50.45, 'FLAVIO BOLSONARO': 49.55, 'LUIZ INÁCIO LULA DA SILVA': 50.45, 'FLAVIO NANTES BOLSONARO': 49.55 } },
  { urnasPct: 58.10, timestamp: '20:34:11', candidatos: { 'LULA': 50.48, 'FLAVIO BOLSONARO': 49.52, 'LUIZ INÁCIO LULA DA SILVA': 50.48, 'FLAVIO NANTES BOLSONARO': 49.52 } },
  { urnasPct: 59.07, timestamp: '20:34:40', candidatos: { 'LULA': 50.50, 'FLAVIO BOLSONARO': 49.50, 'LUIZ INÁCIO LULA DA SILVA': 50.50, 'FLAVIO NANTES BOLSONARO': 49.50 } },
  { urnasPct: 60.86, timestamp: '20:36:49', candidatos: { 'LULA': 50.56, 'FLAVIO BOLSONARO': 49.44, 'LUIZ INÁCIO LULA DA SILVA': 50.56, 'FLAVIO NANTES BOLSONARO': 49.44 } },
  { urnasPct: 62.00, timestamp: '20:37:40', candidatos: { 'LULA': 50.60, 'FLAVIO BOLSONARO': 49.40, 'LUIZ INÁCIO LULA DA SILVA': 50.60, 'FLAVIO NANTES BOLSONARO': 49.40 } },
  { urnasPct: 63.46, timestamp: '20:38:57', candidatos: { 'LULA': 50.66, 'FLAVIO BOLSONARO': 49.34, 'LUIZ INÁCIO LULA DA SILVA': 50.66, 'FLAVIO NANTES BOLSONARO': 49.34 } },
  { urnasPct: 64.20, timestamp: '20:39:29', candidatos: { 'LULA': 50.72, 'FLAVIO BOLSONARO': 49.28, 'LUIZ INÁCIO LULA DA SILVA': 50.72, 'FLAVIO NANTES BOLSONARO': 49.28 } },
  { urnasPct: 64.85, timestamp: '20:39:58', candidatos: { 'LULA': 50.74, 'FLAVIO BOLSONARO': 49.26, 'LUIZ INÁCIO LULA DA SILVA': 50.74, 'FLAVIO NANTES BOLSONARO': 49.26 } },
  { urnasPct: 65.94, timestamp: '20:40:30', candidatos: { 'LULA': 50.79, 'FLAVIO BOLSONARO': 49.21, 'LUIZ INÁCIO LULA DA SILVA': 50.79, 'FLAVIO NANTES BOLSONARO': 49.21 } },
  { urnasPct: 67.50, timestamp: '20:42:20', candidatos: { 'LULA': 50.84, 'FLAVIO BOLSONARO': 49.16, 'LUIZ INÁCIO LULA DA SILVA': 50.84, 'FLAVIO NANTES BOLSONARO': 49.16 } },
  { urnasPct: 69.50, timestamp: '20:44:10', candidatos: { 'LULA': 50.91, 'FLAVIO BOLSONARO': 49.09, 'LUIZ INÁCIO LULA DA SILVA': 50.91, 'FLAVIO NANTES BOLSONARO': 49.09 } },
  { urnasPct: 71.20, timestamp: '20:45:30', candidatos: { 'LULA': 50.97, 'FLAVIO BOLSONARO': 49.03, 'LUIZ INÁCIO LULA DA SILVA': 50.97, 'FLAVIO NANTES BOLSONARO': 49.03 } },
  { urnasPct: 73.31, timestamp: '20:47:00', candidatos: { 'LULA': 51.03, 'FLAVIO BOLSONARO': 48.97, 'LUIZ INÁCIO LULA DA SILVA': 51.03, 'FLAVIO NANTES BOLSONARO': 48.97 } },
  { urnasPct: 74.82, timestamp: '20:48:12', candidatos: { 'LULA': 51.08, 'FLAVIO BOLSONARO': 48.92, 'LUIZ INÁCIO LULA DA SILVA': 51.08, 'FLAVIO NANTES BOLSONARO': 48.92 } },
  { urnasPct: 76.05, timestamp: '20:49:49', candidatos: { 'LULA': 51.12, 'FLAVIO BOLSONARO': 48.88, 'LUIZ INÁCIO LULA DA SILVA': 51.12, 'FLAVIO NANTES BOLSONARO': 48.88 } },
  { urnasPct: 76.98, timestamp: '20:50:11', candidatos: { 'LULA': 51.17, 'FLAVIO BOLSONARO': 48.83, 'LUIZ INÁCIO LULA DA SILVA': 51.17, 'FLAVIO NANTES BOLSONARO': 48.83 } },
  { urnasPct: 78.09, timestamp: '20:52:16', candidatos: { 'LULA': 51.21, 'FLAVIO BOLSONARO': 48.79, 'LUIZ INÁCIO LULA DA SILVA': 51.21, 'FLAVIO NANTES BOLSONARO': 48.79 } },
  { urnasPct: 79.06, timestamp: '20:52:00', candidatos: { 'LULA': 51.24, 'FLAVIO BOLSONARO': 48.76, 'LUIZ INÁCIO LULA DA SILVA': 51.24, 'FLAVIO NANTES BOLSONARO': 48.76 } },
  { urnasPct: 80.22, timestamp: '20:53:21', candidatos: { 'LULA': 51.31, 'FLAVIO BOLSONARO': 48.69, 'LUIZ INÁCIO LULA DA SILVA': 51.31, 'FLAVIO NANTES BOLSONARO': 48.69 } },
  { urnasPct: 81.38, timestamp: '20:54:20', candidatos: { 'LULA': 51.33, 'FLAVIO BOLSONARO': 48.67, 'LUIZ INÁCIO LULA DA SILVA': 51.33, 'FLAVIO NANTES BOLSONARO': 48.67 } },
  { urnasPct: 83.04, timestamp: '20:55:21', candidatos: { 'LULA': 51.38, 'FLAVIO BOLSONARO': 48.62, 'LUIZ INÁCIO LULA DA SILVA': 51.38, 'FLAVIO NANTES BOLSONARO': 48.62 } },
  { urnasPct: 84.81, timestamp: '20:57:26', candidatos: { 'LULA': 51.41, 'FLAVIO BOLSONARO': 48.59, 'LUIZ INÁCIO LULA DA SILVA': 51.41, 'FLAVIO NANTES BOLSONARO': 48.59 } },
  { urnasPct: 85.92, timestamp: '20:58:33', candidatos: { 'LULA': 51.44, 'FLAVIO BOLSONARO': 48.56, 'LUIZ INÁCIO LULA DA SILVA': 51.44, 'FLAVIO NANTES BOLSONARO': 48.56 } },
  { urnasPct: 86.98, timestamp: '20:59:01', candidatos: { 'LULA': 51.47, 'FLAVIO BOLSONARO': 48.53, 'LUIZ INÁCIO LULA DA SILVA': 51.47, 'FLAVIO NANTES BOLSONARO': 48.53 } },
  { urnasPct: 87.66, timestamp: '20:59:41', candidatos: { 'LULA': 51.50, 'FLAVIO BOLSONARO': 48.50, 'LUIZ INÁCIO LULA DA SILVA': 51.50, 'FLAVIO NANTES BOLSONARO': 48.50 } },
  { urnasPct: 89.74, timestamp: '21:01:40', candidatos: { 'LULA': 51.56, 'FLAVIO BOLSONARO': 48.44, 'LUIZ INÁCIO LULA DA SILVA': 51.56, 'FLAVIO NANTES BOLSONARO': 48.44 } },
  { urnasPct: 91.50, timestamp: '21:03:10', candidatos: { 'LULA': 51.62, 'FLAVIO BOLSONARO': 48.38, 'LUIZ INÁCIO LULA DA SILVA': 51.62, 'FLAVIO NANTES BOLSONARO': 48.38 } },
  { urnasPct: 92.79, timestamp: '21:04:48', candidatos: { 'LULA': 51.67, 'FLAVIO BOLSONARO': 48.33, 'LUIZ INÁCIO LULA DA SILVA': 51.67, 'FLAVIO NANTES BOLSONARO': 48.33 } },
  { urnasPct: 94.04, timestamp: '21:05:51', candidatos: { 'LULA': 51.69, 'FLAVIO BOLSONARO': 48.31, 'LUIZ INÁCIO LULA DA SILVA': 51.69, 'FLAVIO NANTES BOLSONARO': 48.31 } }
];

/**
 * Mescla uma lista de pontos (do servidor ou storage) com os checkpoints oficiais
 * preenchendo quaisquer lacunas e garantindo monotonicidade estrita.
 */
export function mergeSeedWithTimeline(
  incomingTimeline?: TimelinePoint2026[],
  maxPct?: number
): TimelinePoint2026[] {
  const pointMap = new Map<number, TimelinePoint2026>();

  // Inserir pontos de referência oficiais
  SEED_TIMELINE_2026.forEach(pt => {
    if (maxPct === undefined || pt.urnasPct <= maxPct + 0.1) {
      const key = Math.round(pt.urnasPct * 100) / 100;
      pointMap.set(key, { ...pt, candidatos: { ...pt.candidatos } });
    }
  });

  // Sobrepor pontos recebidos em tempo real
  if (Array.isArray(incomingTimeline)) {
    incomingTimeline.forEach(pt => {
      if (pt && pt.urnasPct > 0 && (maxPct === undefined || pt.urnasPct <= maxPct + 0.1)) {
        const key = Math.round(pt.urnasPct * 100) / 100;
        const existing = pointMap.get(key);
        if (!existing) {
          pointMap.set(key, { ...pt, candidatos: { ...pt.candidatos } });
        } else {
          pointMap.set(key, {
            ...existing,
            ...pt,
            candidatos: { ...existing.candidatos, ...pt.candidatos }
          });
        }
      }
    });
  }

  return Array.from(pointMap.values()).sort((a, b) => a.urnasPct - b.urnasPct);
}
