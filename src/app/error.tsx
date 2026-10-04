'use client';

import React, { useEffect } from 'react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--fg-subtle)]">
            Lado a Lado · Eleições Gerais
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
            Falha temporária ao sincronizar
          </h1>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
            Não foi possível renderizar a apuração neste instante. Isso pode ocorrer durante picos de tráfego nos servidores de dados.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-mono font-medium rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            Tentar carregar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
