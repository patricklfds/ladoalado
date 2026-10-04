import { ImageResponse } from 'next/og';

export const alt = 'Lado a Lado | Apuração Presidencial Comparada';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0C0C0E',
          color: '#EDEDEA',
          padding: '70px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Topo / Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#EDEDEA',
              }}
            >
              Lado a Lado
            </span>
            <span
              style={{
                fontSize: 14,
                fontFamily: 'monospace',
                color: '#888884',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #202024',
              }}
            >
              2026 vs 2022
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#888884' }}>
              Ao vivo · TSE
            </span>
          </div>
        </div>

        {/* Centro / Título e Comparador */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#FFFFFF',
            }}
          >
            Apuração Presidencial Comparada
          </span>
          <span
            style={{
              fontSize: 24,
              color: '#A1A1AA',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Acompanhe o ritmo voto a voto da eleição de 2026 comparado no mesmo instante ao histórico de 2022.
          </span>
        </div>

        {/* Rodapé do Card */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #202024',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '30px', fontSize: 15, fontFamily: 'monospace', color: '#71717A' }}>
            <span>● 50% / 50% Espelhado</span>
            <span>● Atualização a cada 60s</span>
            <span>● Zero Vibe-Coding</span>
          </div>
          <span style={{ fontSize: 15, fontFamily: 'monospace', color: '#EDEDEA' }}>
            ladoalado.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
