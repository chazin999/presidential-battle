# 🏆 Presidential Battle — Painel de Live (TikTok)

Painel visual de votação/competição em tempo real entre três candidatos
fictícios (**Presidente Alpha**, **Presidente Beta**, **Presidente Gamma**),
feito para ser exibido como overlay/painel durante uma LIVE do TikTok.

> Não usa políticos reais. Nomes, fotos e presentes são totalmente
> configuráveis pela interface — nenhuma edição de código é necessária
> no dia a dia.

---

## 1. Estrutura do projeto

```
presidential-battle/
├── frontend/          # React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── components/   # CandidateCard, ScoreHUD, GiftModal, AdminPanel...
│       ├── state/         # store (zustand) com toda a lógica de pontuação
│       ├── services/      # TikTokEventProvider (contrato), Mock e Remoto
│       ├── hooks/          # useFullscreen, useGiftEventBridge
│       ├── data/            # catálogo de presentes (módulo de dados isolado)
│       └── types/
├── backend/            # Node.js + TypeScript + Express + WebSocket + SQLite
│   └── src/
│       ├── db/              # schema e conexão SQLite
│       ├── services/        # scoreEngine, TikTokEventProvider (mock)
│       ├── websocket/        # broadcast em tempo real
│       └── routes/            # candidates, gifts, settings, auth, demo
└── README.md
```

---

## 2. Como instalar

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

## 3. Como iniciar o backend

```bash
cd backend
npm run dev
```

Isso sobe o servidor em `http://localhost:4000`, cria o banco SQLite
automaticamente em `backend/data/battle.db` e abre o WebSocket em
`ws://localhost:4000/ws`.

## 4. Como iniciar o frontend

```bash
cd frontend
npm run dev
```

Acesse `http://localhost:5173`. O frontend funciona **mesmo sem o
backend rodando**, no modo DEMO (tudo fica salvo no `localStorage` do
navegador). Para eventos em tempo real vindos do backend, use o modo
LIVE (botão no topo da tela).

## 5. Como configurar o `.env`

**`backend/.env`**

| Variável | Descrição |
|---|---|
| `PORT` | porta do servidor (padrão `4000`) |
| `FRONTEND_ORIGIN` | URL do frontend, usada no CORS e nos redirects do OAuth |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | credenciais do seu app no [TikTok for Developers](https://developers.tiktok.com/) |
| `TIKTOK_REDIRECT_URI` | URL de callback do OAuth (deve bater com o cadastrado no app do TikTok) |
| `GIFT_EVENT_SOURCE` | `mock` (padrão) ou `live`, ver seção 9 |
| `DATABASE_PATH` | caminho do arquivo SQLite |

**`frontend/.env`**

| Variável | Descrição |
|---|---|
| `VITE_WS_URL` | endereço do WebSocket do backend |

## 6. Como usar o modo DEMO

O modo DEMO é a forma de testar tudo (pontuação, animações, líder,
vitória, reset) **sem precisar de uma LIVE real**:

1. No topo da tela, deixe o botão em **"● MODO DEMO"**.
2. Use o painel **"MODO DEMO · SIMULAR PRESENTES"** (parte inferior da
   tela) para escolher um candidato e clicar em um dos 3 presentes
   configurados — o ponto é somado exatamente como aconteceria numa
   LIVE real.
3. Ao atingir a meta, a animação de **WINNER** dispara automaticamente
   e a rodada reseta.

Isso funciona tanto direto no navegador (via `MockTikTokEventProvider`
do frontend) quanto contra o backend (via `POST /api/demo/emit-gift`,
que passa pelo mesmo `scoreEngine` que qualquer evento "real" usaria).

## 7. Como configurar os três candidatos

No canto superior direito, clique em **⚙ ADMIN → aba "Candidatos"**:

- Clique no ícone 📷 no card do candidato (ou na miniatura no admin)
  para trocar a foto — a imagem é lida do dispositivo e salva
  automaticamente, sem precisar editar código.
- Edite o nome diretamente no campo de texto.
- Use o checkbox "ativo" para remover temporariamente um candidato da
  disputa (ele fica acinzentado e não recebe pontos).

## 8. Como configurar os presentes

**⚙ ADMIN → aba "Presentes"**: cada candidato tem 3 slots. Clique no
presente para abrir o catálogo (busca incluída) e escolher qual
presente está associado àquele slot; edite o campo numérico ao lado
para definir quantos pontos aquele presente vale. Tudo é salvo na hora.

> **Sobre o catálogo de presentes:** o TikTok não disponibiliza uma
> lista pública oficial de presentes de LIVE (com nomes, ícones e
> valores em moedas) para desenvolvedores de terceiros. Por isso o
> catálogo incluído (`frontend/src/data/giftsCatalog.json`) é um
> conjunto de exemplo, claramente isolado como módulo de dados. Se uma
> fonte oficial/autorizada for disponibilizada no futuro, basta
> substituir esse arquivo (ou trocá-lo por uma chamada de API) — nenhum
> componente de UI precisa mudar.

## 9. Como alterar a meta

**⚙ ADMIN → aba "Pontuação"**: campo "Meta para Vitória" (aceita
qualquer número, com atalhos para 50/100/250/500/1000/5000) e o
checkbox "Ativar reset automático" — se desativado, os pontos
continuam acumulando sem reset ao atingir a meta.

## 10. Como conectar a integração oficial do TikTok

**⚙ ADMIN → aba "TikTok" → CONECTAR TIKTOK.**

Esse botão inicia o fluxo OAuth oficial (TikTok Login Kit). Ele **nunca
pede senha** dentro do site. Para funcionar de verdade você precisa:

1. Criar um app em https://developers.tiktok.com/
2. Preencher `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` e
   `TIKTOK_REDIRECT_URI` no `backend/.env`
3. Reiniciar o backend

Sem essas credenciais configuradas, o botão informa exatamente isso em
vez de simular uma conexão falsa.

## 11. O que é real e o que é mock — leia antes de usar em produção

Este projeto foi construído para **não fingir** integrações que não
existem oficialmente. Resumo honesto do estado de cada funcionalidade:

| Funcionalidade | Status |
|---|---|
| Login/conexão de conta (OAuth) | **Real**, via TikTok Login Kit — requer app aprovado pelo TikTok |
| Dados básicos da conta (nome/@usuário) | **Real**, obtidos após o OAuth |
| Lista oficial de presentes com valor em moedas | **Não disponível publicamente.** O catálogo incluído é um placeholder de demonstração |
| Recebimento automático de presentes de uma LIVE em tempo real | **Não disponível publicamente** para apps de terceiros comuns, até onde há documentação oficial pública do TikTok no momento em que este projeto foi criado. O sistema está 100% arquitetado para isso (`TikTokEventProvider` no frontend e no backend) — falta apenas plugar uma fonte oficial autorizada quando/se ela existir para a sua conta |
| Modo DEMO (simulação de presentes) | **Real e funcional**, exercita o mesmo pipeline que um evento real usaria |
| Pontuação, líder, barra de progresso, winners, histórico, estatísticas | **Real e funcional** |
| Reset automático / manual, meta configurável, empates por ordem de chegada | **Real e funcional** |
| Upload de fotos dos candidatos | **Real**, salvo localmente (localStorage) |
| Persistência de configurações | **Real** — frontend usa `localStorage`; backend usa SQLite |

Caso o TikTok publique, ou você obtenha acesso homologado a, uma API
de eventos de LIVE, crie uma classe `LiveTikTokEventProvider` em
`backend/src/services/` implementando a interface
`TikTokEventProvider` (mesmo contrato do mock) e troque a instanciação
em `backend/src/index.ts`. Nenhuma outra parte do sistema precisa
mudar. Este projeto **não usa** bibliotecas não-oficiais que fazem
engenharia reversa do protocolo de LIVE do TikTok, conforme solicitado.

## 12. Modo Fullscreen

Botão **⛶ FULLSCREEN** no topo. Esconde os controles administrativos e
mostra apenas os 3 cards, o HUD e o histórico — pronto para ser
capturado como fonte de tela/janela em qualquer software de live
streaming (OBS, TikTok LIVE Studio, etc.). Um botão discreto no canto
inferior direito permite sair do modo.

## 13. Segurança

- Nenhuma senha do TikTok é solicitada ou armazenada.
- `TIKTOK_CLIENT_SECRET` fica apenas no backend, nunca no frontend.
- Tokens de acesso são trocados servidor-a-servidor.
- Use sempre HTTPS em produção e mantenha o `backend/.env` fora do
  controle de versão (já incluído em `.gitignore`).

## 14. Deploy no GitHub + Render

### 14.1 Subir para o GitHub

```bash
cd presidential-battle
git init
git add .
git commit -m "Presidential Battle - painel de live"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/presidential-battle.git
git push -u origin main
```

(Crie o repositório vazio antes em github.com/new — sem README, sem
.gitignore, para não gerar conflito com o push acima.)

### 14.2 Hospedar no Render

Este projeto já inclui um `render.yaml` na raiz (formato "Blueprint").
No painel do Render:

1. **New +** → **Blueprint**
2. Conecte o repositório `presidential-battle` que você acabou de subir
3. O Render vai ler o `render.yaml` e propor **dois serviços**:
   - `presidential-battle-backend` (Web Service, Node)
   - `presidential-battle-frontend` (Static Site)
4. Clique em **Apply** — o build/deploy dos dois começa automaticamente

Depois do primeiro deploy, ajuste 2 coisas manualmente no painel (o
Render gera URLs com um sufixo aleatório às vezes, então confirme as
URLs reais):

- No serviço **backend** → Environment → `FRONTEND_ORIGIN` deve ser a
  URL pública do frontend (ex: `https://presidential-battle-frontend.onrender.com`)
- No serviço **frontend** → Environment → `VITE_WS_URL` deve ser
  `wss://` + a URL pública do backend + `/ws`
  (ex: `wss://presidential-battle-backend.onrender.com/ws`) — depois
  de mudar, clique em **Manual Deploy → Clear build cache & deploy**
  no frontend, pois `VITE_WS_URL` é usada em tempo de build

Se quiser conectar o TikTok de verdade (seção 10), preencha também
`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` e `TIKTOK_REDIRECT_URI`
(este último apontando para
`https://SEU-BACKEND.onrender.com/api/auth/tiktok/callback`) nas
variáveis de ambiente do serviço backend no Render.

**Sobre persistência no plano gratuito:** o Render free não inclui
disco persistente, então o SQLite do backend reseta a cada novo
deploy/reinício do serviço (o serviço também "dorme" após 15 min sem
uso e demora alguns segundos para acordar na próxima requisição — normal
do free tier). Isso não afeta o uso do painel no dia a dia, pois fotos,
nomes, presentes e pontuação já ficam salvos no `localStorage` do
navegador pelo frontend. Se quiser que o backend também persista entre
deploys, faça upgrade do serviço backend e descomente o bloco `disk:`
no `render.yaml`.

## 15. Stack técnica

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS +
  Framer Motion (animações) + canvas-confetti (celebração de vitória) +
  Zustand (estado global com persistência em `localStorage`)
- **Backend:** Node.js + TypeScript + Express + `ws` (WebSocket) +
  better-sqlite3
- **Comunicação em tempo real:** WebSocket (`/ws`)
