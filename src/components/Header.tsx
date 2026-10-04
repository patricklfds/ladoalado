'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export function Header({
  modo,
  setModo,
  timestamp2026,
  tempoRestante,
  isAtualizando,
  recarregarAgora,
  isDemo = false
}: HeaderProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const isAtualizandoRef = useRef(isAtualizando);
  isAtualizandoRef.current = isAtualizando;

  // Iniciar giro suave quando isAtualizando for true
  useEffect(() => {
    if (isAtualizando) {
      setIsSpinning(true);
    } else if (isSpinning) {
      // Timeout de segurança caso onAnimationIteration não dispare
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

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
          {/* Seletor Minimalista de Sincronia */}
          <div className="flex items-center gap-1 text-[var(--fg-muted)]">
            <span className="text-[11px] text-[var(--fg-subtle)] mr-1">modo:</span>
            <button
              onClick={() => setModo('urnas')}
              className={`px-2 py-1 rounded transition-colors ${
                modo === 'urnas'
                  ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                  : 'hover:text-[var(--fg)]'
              }`}
            >
              % de urnas
            </button>
            <span className="text-[var(--border)]">/</span>
            <button
              onClick={() => setModo('horario')}
              className={`px-2 py-1 rounded transition-colors ${
                modo === 'horario'
                  ? 'text-[var(--fg)] font-semibold bg-[var(--accent)]'
                  : 'hover:text-[var(--fg)]'
              }`}
            >
              horário
            </button>
          </div>

          {/* Status Ao Vivo */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--fg-muted)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[var(--fg)] font-medium">ao vivo</span>
            <span>·</span>
            <span>{timestamp2026 || '18:48'}</span>
            <span>·</span>
            <span className="tabular-nums">{tempoRestante}s</span>
            <button
              onClick={recarregarAgora}
              disabled={isAtualizando || isSpinning}
              title="Atualizar agora"
              className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors disabled:opacity-40 p-0.5 inline-flex items-center justify-center cursor-pointer"
            >
              <svg
                onAnimationIteration={handleAnimationIteration}
                className={`w-3 h-3 ${isSpinning ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transformOrigin: 'center' }}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>

          {/* Tema Claro / Escuro */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="text-[11px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border-l border-[var(--border)] pl-4"
            >
              {isDark ? 'claro' : 'escuro'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
