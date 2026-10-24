'use client';

import React from 'react';

interface FooterProps {
  timestampISO?: string;
  origem?: string;
}

export function Footer({ timestampISO, origem }: FooterProps) {
  return (
    <footer className="py-12 text-xs font-mono text-[var(--fg-subtle)]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[var(--fg-muted)]">
            <strong className="text-[var(--fg)] font-semibold tracking-[-0.02em] font-sans">Lado a Lado</strong>
            {' · '}2026 vs 2022 · 2º Turno Presidencial
          </p>
          <p className="text-[11px] leading-relaxed">
            Dados oficiais: CDN Tribunal Superior Eleitoral (27 UFs + Exterior + Nacional) · Interpolação contínua sobre a série histórica do 2º turno de 2022 (30/10/2022).
          </p>
        </div>

        <div className="sm:text-right space-y-1 text-[11px] tabular-nums shrink-0">
          <p>
            Sincronizado às{' '}
            <span className="text-[var(--fg-muted)]">
              {timestampISO ? new Date(timestampISO).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '--:--:--'}
            </span>{' '}
            (BRT)
          </p>
          <p className="text-[var(--fg-subtle)] uppercase tracking-[0.06em] text-[10px]">
            Canal: {origem || 'tse-live'} · Polling 5s
          </p>
        </div>
      </div>
    </footer>
  );
}
