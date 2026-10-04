'use client';

import React from 'react';

interface EditorialFooterProps {
  origemDados?: string;
  dataHoraISO?: string;
}

export function EditorialFooter({ origemDados, dataHoraISO }: EditorialFooterProps) {
  const electionCode = process.env.NEXT_PUBLIC_TSE_ELECTION_CODE || '600';

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--background)] py-10 px-4 text-xs text-[var(--muted)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metodologia */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Metodologia de Comparação
            </h4>
            <p className="leading-relaxed">
              A sincronização por <strong>% de Urnas Apuradas</strong> neutraliza distorções de velocidade entre diferentes eleições, comparando o mesmo volume de votos processados. A sincronização por <strong>Horário</strong> compara os minutos exatos do relógio de Brasília.
            </p>
          </div>

          {/* Fonte Oficial */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Fonte de Dados Oficial
            </h4>
            <p className="leading-relaxed">
              Dados oficiais originados dos servidores de divulgação pública do <strong>Tribunal Superior Eleitoral (TSE)</strong>. A série histórica de 2022 é baseada na totalização oficial do 1º Turno (02/10/2022).
            </p>
          </div>

          {/* Transparência Técnica */}
          <div className="space-y-1.5 font-mono text-[11px]">
            <h4 className="font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Parâmetros do Sistema
            </h4>
            <ul className="space-y-1">
              <li>• Ciclo de Atualização: 60 segundos</li>
              <li>• Código TSE Ativo: <span className="text-[var(--foreground)]">{electionCode}</span></li>
              <li>• Origem do Pacote: <span className="text-[var(--foreground)]">{origemDados || 'tse-live'}</span></li>
              {dataHoraISO && (
                <li>• Timestamp: {new Date(dataHoraISO).toLocaleTimeString('pt-BR')}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[var(--foreground)]">LADO A LADO</span>
            <span>—</span>
            <span>Jornalismo de Dados Independente</span>
          </div>
          <div>
            Desenvolvido para alta escala • Edge Cached • Zero Cumulative Layout Shift
          </div>
        </div>
      </div>
    </footer>
  );
}
