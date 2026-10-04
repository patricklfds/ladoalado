import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)] px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--fg-subtle)]">
          404 · Página não encontrada
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">
          Página não encontrada
        </h1>
        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          O endereço acessado não existe. Acompanhe a apuração comparada ao vivo na página principal.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-4 py-2 text-xs font-mono font-medium rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            ← Voltar para a apuração ao vivo
          </Link>
        </div>
      </div>
    </div>
  );
}
