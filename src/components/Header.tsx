'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ComparisonMode } from '@/lib/types';

interface HeaderProps {
  modo: ComparisonMode;
  setModo: (modo: ComparisonMode) => void;
  timestamp2026?: string;
  tempoRestante: number;
  isAtualizando: boolean;
  recarregarAgora: () => void;
  isDemo?: boolean;
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
  isDemo = false
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

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--bg)] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Marca & Identidade */}
        <div className="flex items-baseline gap-3">
          <span className="font-semibold text-lg sm:text-xl tracking-tight text-[var(--fg)]">
            Lado a Lado
          </span>
          <span className="text-xs font-mono text-[var(--fg-muted)] tracking-wider">
            2026 vs 2022
          </span>
          {isDemo && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              demo
            </span>
          )}
        </div>

        {/* Controles de Sincronia e Ao Vivo */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          {/* Seletor Minimalista de Sincronia com Acessibilidade ARIA */}
          <div
            role="group"
            aria-label="Modo de comparação temporal"
            className="flex items-center gap-1 text-[var(--fg-muted)]"
          >
            <span className="text-[11px] text-[var(--fg-subtle)] mr-1">modo:</span>
            <button
              type="button"
              role="radio"
              aria-checked={modo === 'urnas'}
              onClick={() => setModo('urnas')}
              className={`px-2.5 py-1.5 rounded transition-colors text-xs font-medium cursor-pointer ${
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
              className={`px-2.5 py-1.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                modo === 'horario'
                  ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                  : 'hover:text-[var(--fg)]'
              }`}
            >
              horário
            </button>
          </div>

          {/* Status Ao Vivo / Conexão */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--fg-muted)]">
            <span
              className={`inline-block w-2 h-2 rounded-full transition-colors ${
                !isOnline
                  ? 'bg-rose-500'
                  : isAtualizando
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
              title={!isOnline ? 'Sem conexão com a internet' : isAtualizando ? 'Sincronizando...' : 'Conexão ativa'}
              aria-hidden="true"
            />
            <span className="text-[var(--fg)] font-medium">
              {!isOnline ? 'offline' : isAtualizando ? 'sincronizando' : 'ao vivo'}
            </span>
            <span>·</span>
            <span>{timestamp2026 || '18:48'}</span>
            <span>·</span>
            <span className="tabular-nums" title={`Próxima atualização em ${tempoRestante} segundos`}>
              {tempoRestante}s
            </span>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isAtualizando || isSpinning}
              aria-label="Atualizar dados da apuração agora"
              title="Atualizar dados agora"
              className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors disabled:opacity-40 p-1.5 inline-flex items-center justify-center cursor-pointer min-w-[28px] min-h-[28px]"
            >
              <svg
                onAnimationIteration={handleAnimationIteration}
                className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
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

          {/* Tema Claro / Escuro */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
              className="text-[11px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border-l border-[var(--border)] pl-4 py-1 cursor-pointer"
            >
              {isDark ? 'claro' : 'escuro'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
