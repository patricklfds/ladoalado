'use client';

import React from 'react';

interface FooterProps {
  timestampISO?: string;
  origem?: string;
}

export function Footer({ timestampISO, origem }: FooterProps) {
  return (
    <footer className="py-12 text-xs font-mono text-[var(--fg-subtle)]">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[var(--fg-muted)]">
            <strong>Lado a Lado</strong> — Jornalismo de dados eleitorais.
          </p>
          <p>
            Fonte oficial: Tribunal Superior Eleitoral (TSE) · Atualização a cada 60 segundos.
          </p>
        </div>

        <div className="text-right sm:text-right space-y-1 text-[11px]">
          <p>
            Sincronizado: {timestampISO ? new Date(timestampISO).toLocaleTimeString('pt-BR') : '18:48:00'}
          </p>
          <p className="text-[var(--fg-subtle)]">
            Pacote: {origem || 'tse-live'}
          </p>
        </div>
      </div>
    </footer>
  );
}
