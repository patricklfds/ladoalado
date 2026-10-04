# Lado a Lado — Apuração Presidencial Comparada (2022 vs 2026)

Aplicação web de jornalismo de dados de alta precisão para comparação em tempo real da apuração de votos das eleições presidenciais do Brasil de 2026 com o histórico de 2022, sincronizada a cada **60 segundos**.

---

## 🏛️ Características & Design Editorial

- **Manifesto Anti-AI-Slop**: Design editorial inspirado nas melhores infografias do *Financial Times*, *The New York Times*, *Reuters* e *Nexo Jornal*. Sem gradientes roxos genéricos, sem bordas neon e sem animações lentas.
- **Números Tabulares (Zero CLS)**: Todos os percentuais e contagens utilizam fonte `font-mono tabular-nums`, impedindo qualquer deslocamento de layout na virada dos números a cada minuto.
- **Resolução de 60 Segundos**:
  - **Histórico 2022**: Dataset de alta densidade (`/data/2022-timeline.json`) com 331 checkpoints minuto a minuto (17:00 às 22:30), calibrado com a totalização oficial do TSE no 1º turno de 2022.
  - **Tempo Real 2026**: Polling automático estrito a cada 60 segundos com timer regressivo na tela e recarga sob demanda.
- **Motor de Comparação Duplo**:
  1. **Por % de Urnas Apuradas (Padrão Recomendado)**: Neutraliza discrepâncias regionais de velocidade na abertura dos votos.
  2. **Por Horário de Brasília**: Sincroniza minuto a minuto com o relógio.
- **Edge Proxy com Cache na Borda**: Rota `/api/tse` com `Cache-Control: public, s-maxage=30, stale-while-revalidate=60` para blindar contra bloqueios de CORS e respeitar o teto de 100 req/s do IP do TSE.

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000).

---

## ⚡ Como Subir para Produção Hoje (Deploy em 1 Minuto)

### Opção 1: Vercel (Recomendado)
```bash
npx vercel --prod
```

### Opção 2: Cloudflare Pages / Edge
Conecte o repositório no dashboard do Cloudflare Pages ou utilize:
```bash
npm run build
```

---

## ⚙️ Configurações do TSE (.env.local)

No dia da eleição, o TSE divulga os identificadores oficiais do pleito. Você pode alterar as variáveis no arquivo `.env.local`:

```bash
# Código oficial do pleito presidencial 1º turno (definido pelo TSE)
NEXT_PUBLIC_TSE_ELECTION_CODE=600
NEXT_PUBLIC_TSE_ELECTION_CYCLE=ele2026

# Ativar como 'true' para forçar dados de teste antes das 17h
NEXT_PUBLIC_DEMO_MODE=false
```

Você também pode testar a interface a qualquer momento adicionando `?demo=true` na URL:
`http://localhost:3000/?demo=true`
