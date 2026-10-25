'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ComparisonMode, ElectionStatus, ElectionState } from '@/lib/types';
import { formatCandidateName } from '@/lib/candidateUtils';

interface HeaderProps {
  modo: ComparisonMode;
  setModo: (modo: ComparisonMode) => void;
  timestamp2026?: string;
  tempoRestante: number;
  isAtualizando: boolean;
  recarregarAgora: () => void;
  isDemo?: boolean;
  status2026?: ElectionStatus;
  estado2026?: ElectionState | null;
  estado2022?: ElectionState | null;
}

function buildShareText(
  estado2026: ElectionState | null | undefined,
  estado2022: ElectionState | null | undefined,
  modo: ComparisonMode
): string {
  const siteUrl = 'https://ladoalado2026.vercel.app';
  const pct = estado2026?.secoesTotalizadasPct ?? 0;
  const hasVotes2026 = (estado2026?.totalVotosValidos ?? 0) > 0 && pct > 0;

  if (!hasVotes2026) {
    return [
      '🇧🇷 Apuração 2º Turno — 2026 vs 2022 (Lado a Lado)',
      '',
      'Acompanhe a totalização oficial em tempo real comparada no mesmo ponto exato com o 2º turno de 2022:',
      siteUrl
    ].join('\n');
  }

  const c26 = [...(estado2026?.candidatos || [])].sort(
    (a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao)
  );
  const c22 = [...(estado2022?.candidatos || [])].sort(
    (a, b) => (b.percentual - a.percentual) || (b.votos - a.votos) || (a.posicao - b.posicao)
  );

  const l26 = c26[0];
  const s26 = c26[1];
  const l22 = c22[0];
  const s22 = c22[1];

  const lula26 = c26.find(c => c.numero === '13' || c.nome.toUpperCase().includes('LULA'));
  const lula22 = c22.find(c => c.numero === '13' || c.nome.toUpperCase().includes('LULA'));
  const deltaLula = lula26 && lula22 ? Number((lula26.percentual - lula22.percentual).toFixed(2)) : 0;

  const lines: string[] = [
    `🇧🇷 Apuração 2º Turno (${pct.toFixed(2)}% das urnas)`,
    ''
  ];

  if (l26 && s26) {
    lines.push(
      `2026 (agora): ${formatCandidateName(l26.nome)} ${l26.percentual.toFixed(2)}% vs ${formatCandidateName(s26.nome)} ${s26.percentual.toFixed(2)}%`
    );
  }
  if (l22 && s22) {
    const label22 = modo === 'urnas' ? '2022 (mesmo %)' : `2022 (${estado2022?.timestamp || 'mesmo horário'})`;
    lines.push(
      `${label22}: ${formatCandidateName(l22.nome)} ${l22.percentual.toFixed(2)}% vs ${formatCandidateName(s22.nome)} ${s22.percentual.toFixed(2)}%`
    );
  }

  lines.push('');
  if (Math.abs(deltaLula) < 0.01) {
    lines.push('⚖️ Placar idêntico ao 2º turno de 2022 neste ponto');
  } else if (deltaLula > 0) {
    lines.push(`📈 Lula está +${deltaLula.toFixed(2)} p.p. acima de 2022 neste ponto`);
  } else {
    lines.push(`📈 Flávio está +${Math.abs(deltaLula).toFixed(2)} p.p. acima de Bolsonaro em 2022 neste ponto`);
  }

  lines.push(`Acompanhe ao vivo: ${siteUrl}`);
  return lines.join('\n');
}

// Hook idiomático e sem re-render desnecessário para detectar hidratação no cliente
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Header({
  modo,
  setModo,
  timestamp2026,
  tempoRestante,
  isAtualizando,
  recarregarAgora,
  isDemo = false,
  status2026,
  estado2026,
  estado2022
}: HeaderProps) {
  const mounted = useIsMounted();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const isAtualizandoRef = useRef(isAtualizando);

  // Monitorar conectividade online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronizar classe dark com o DOM
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sincronizar ref fora do render para conformidade estrita com React 19
  useEffect(() => {
    isAtualizandoRef.current = isAtualizando;

    if (isAtualizando) {
      // Agendar ativação do giro sem bloquear o ciclo síncrono do effect
      const frame = requestAnimationFrame(() => setIsSpinning(true));
      return () => cancelAnimationFrame(frame);
    } else if (isSpinning) {
      const timeout = setTimeout(() => {
        setIsSpinning(false);
      }, 1100);
      return () => clearTimeout(timeout);
    }
  }, [isAtualizando, isSpinning]);

  // Completar a rotação de 360 graus suavemente antes de parar
  const handleAnimationIteration = () => {
    if (!isAtualizandoRef.current) {
      setIsSpinning(false);
    }
  };

  const handleManualRefresh = () => {
    setIsSpinning(true);
    recarregarAgora();
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleShare = async () => {
    const text = buildShareText(estado2026, estado2022, modo);

    let copied = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--bg)] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {/* Marca & Identidade Editorial */}
        <div className="flex items-baseline gap-2.5 shrink-0">
          <span className="font-semibold text-lg sm:text-xl tracking-[-0.03em] text-[var(--fg)] whitespace-nowrap">
            Lado a Lado
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--fg-muted)] whitespace-nowrap">
            2026 vs 2022 · 2º Turno
          </span>
          {isDemo && (
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
              demo
            </span>
          )}
        </div>

        {/* Controles de Sincronia e Ao Vivo (largura estável para nunca quebrar linha durante o refresh de 5s) */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-y-2 gap-x-3 sm:gap-x-4 text-xs shrink-0">
          {/* Seletor Minimalista de Sincronia com Acessibilidade ARIA */}
          <div
            role="group"
            aria-label="Modo de comparação temporal"
            className="flex items-center gap-1 font-mono text-[11px] text-[var(--fg-muted)] shrink-0"
          >
            <span className="hidden lg:inline text-[10px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mr-1">
              modo:
            </span>
            <button
              type="button"
              role="radio"
              aria-checked={modo === 'urnas'}
              onClick={() => setModo('urnas')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                modo === 'urnas'
                  ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                  : 'hover:text-[var(--fg)]'
              }`}
            >
              % de urnas
            </button>
            <span className="text-[var(--border)]" aria-hidden="true">/</span>
            <button
              type="button"
              role="radio"
              aria-checked={modo === 'horario'}
              onClick={() => setModo('horario')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                modo === 'horario'
                  ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                  : 'hover:text-[var(--fg)]'
              }`}
            >
              horário
            </button>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 border-l border-[var(--border)] pl-3 sm:pl-4 shrink-0">
            {/* Status Ao Vivo / Conexão (texto fixo para zero Layout Shift a cada 5s) */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--fg-muted)] whitespace-nowrap">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  !isOnline
                    ? 'bg-rose-500'
                    : isAtualizando
                    ? 'bg-amber-400 animate-pulse'
                    : status2026 === 'finalizada'
                    ? 'bg-neutral-500'
                    : 'bg-emerald-500'
                }`}
                title={!isOnline ? 'Sem conexão com a internet' : isAtualizando ? 'Sincronizando...' : status2026 === 'finalizada' ? 'Apuração concluída (100%)' : 'Conexão ativa'}
                aria-hidden="true"
              />
              <span className="text-[var(--fg)] font-medium">
                {!isOnline
                  ? 'offline'
                  : status2026 === 'finalizada'
                  ? 'finalizada'
                  : 'ao vivo'}
              </span>
              <span className="text-[var(--fg-subtle)]">·</span>
              <span className="tabular-nums text-[var(--fg)]">{timestamp2026 || '17:00'}</span>
              {status2026 !== 'finalizada' && (
                <>
                  <span className="text-[var(--fg-subtle)]">·</span>
                  <span className="tabular-nums text-[var(--fg-subtle)] inline-block w-[16px] text-right" title={`Próxima atualização em ${tempoRestante} segundos`}>
                    {tempoRestante}s
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isAtualizando || isSpinning}
                aria-label="Atualizar dados da apuração agora"
                title="Atualizar dados agora"
                className="text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors disabled:opacity-40 p-1 inline-flex items-center justify-center cursor-pointer shrink-0"
              >
                <svg
                  onAnimationIteration={handleAnimationIteration}
                  className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transformOrigin: 'center' }}
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            </div>

            {/* Compartilhar Placar (WhatsApp / X) */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartilhar resumo do placar atual"
              title="Copiar resumo formatado para WhatsApp ou X"
              className={`text-[11px] font-mono transition-colors border-l border-[var(--border)] pl-2.5 sm:pl-3.5 py-0.5 cursor-pointer whitespace-nowrap shrink-0 ${
                copiedShare
                  ? 'text-[var(--color-positive)] font-semibold'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {copiedShare ? 'copiado ✓' : 'compartilhar ↗'}
            </button>

            {/* Tema Claro / Escuro */}
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
                className="text-[11px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border-l border-[var(--border)] pl-2.5 sm:pl-3.5 py-0.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isDark ? 'claro' : 'escuro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
