'use client';

import React, { useState, useEffect } from 'react';
import type { ComparisonMode } from '@/lib/types';

interface MastheadProps {
  modo: ComparisonMode;
  setModo: (modo: ComparisonMode) => void;
  statusOrigem?: string;
}

export function Masthead({ modo, setModo, statusOrigem }: MastheadProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

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
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      {/* Barra superior de edição */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs text-[var(--muted)] border-b border-[var(--border)] border-opacity-50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground)] uppercase tracking-wider">Edição Especial</span>
          <span>•</span>
          <span>Domingo, 4 de Outubro de 2026</span>
          <span>•</span>
          <span>Brasília, DF</span>
        </div>
        <div className="flex items-center gap-3">
          {statusOrigem?.includes('demo') && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
              SIMULAÇÃO / DEMO
            </span>
          )}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="text-xs px-2 py-1 border border-[var(--border)] rounded hover:bg-[var(--accent)] transition-colors"
            >
              {isDark ? '☀ Claro' : '☾ Escuro'}
            </button>
          )}
        </div>
      </div>

      {/* Cabeçalho de Imprensa Editorial */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] uppercase">
          Lado a Lado
        </h1>
        <p className="mt-1 text-sm md:text-base text-[var(--muted)] font-serif italic max-w-xl mx-auto">
          Apuração Presidencial Comparada: 2022 vs 2026 no mesmo instante de tempo
        </p>

        {/* Chave Seletora de Sincronia */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <span className="text-xs uppercase tracking-wider text-[var(--muted)] mr-2 font-medium">
            Comparar por:
          </span>
          <div className="inline-flex p-0.5 border border-[var(--border)] rounded bg-[var(--accent)]">
            <button
              onClick={() => setModo('urnas')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                modo === 'urnas'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              % de Urnas Apuradas (Recomendado)
            </button>
            <button
              onClick={() => setModo('horario')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                modo === 'horario'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Horário de Brasília (Relógio)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
