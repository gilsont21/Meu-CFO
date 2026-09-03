# Meu CFO — servidor caseiro

Backend Node/Express + SQLite para rodar o Meu CFO num servidor caseiro (ex.: celular Android
via Termux). **Este é um plano separado do plano de nuvem** (Supabase/Postgres) documentado no
`README.md` e nos `docs/` da raiz do projeto — os dois não se misturam.

Reaproveita integralmente a lógica financeira de `../src/domain` (projeção, ritmo, categorias
do mês) — o servidor só busca dados no SQLite e monta os parâmetros; nenhuma conta, saldo ou
ritmo é recalculado aqui.

## Stack

- Express 5
- `node:sqlite` (`DatabaseSync`) — o driver SQLite embutido no próprio Node.js desde a v22,
  também síncrono. Sem compilação nativa: nenhum pacote de banco a instalar, nenhum binário a
  compilar em cada plataforma — era esse o motivo da troca (ver **Requisito de versão do Node**
  abaixo).
- `tsx` para rodar TypeScript direto, sem etapa de build separada (inclusive importando
  `../src/domain` e `../src/data` do projeto raiz)
- `@anthropic-ai/sdk` para o chat, chamado só do servidor (ADR 0002)

## Escopo desta primeira versão

Só as três entidades necessárias para as telas **Hoje** e **Transações** funcionarem (de
`docs/02-modelo-de-dados.md`): `transaction` → tabela `transacoes`, `category` → `categorias`,
`recurring_item` → `itens_recorrentes`. Não há aqui as camadas raw/staging nem as entidades de
Open Finance (`connection`, `account`, `merchant`) — isso é do plano de nuvem.

Como ainda não existe uma entidade `account` com saldo, `saldoHoje` é informado por quem chama
`GET /api/resumo` e `POST /api/chat` (query param / body). Isso é uma simplificação deliberada
deste MVP — quando o servidor caseiro ganhar uma tela de configuração, dá para trocar por uma
tabela `config` com o saldo inicial da conta.

## Requisito de versão do Node

**Node.js 22.10 ou superior** (checado via `engines` no `package.json`) — é a versão mínima
que traz o `node:sqlite` estável com as opções usadas aqui (`enableForeignKeyConstraints`).
Rode `node --version` antes de instalar; no Termux, `pkg install nodejs-lts` já traz uma
versão compatível.

## Rodando localmente

```bash
cd server
npm install
cp .env.example .env
# edite .env e preencha ANTHROPIC_API_KEY (opcional — sem ela, /api/chat
# responde no modo degradado, com os mesmos números, sem chamar o modelo)

npm run seed   # popula categorias, compromissos fixos e transações sintéticas de teste
npm run dev    # sobe com watch, http://localhost:3000
```

Para produção (depois de buildar o front-end):

```bash
cd ..            # raiz do projeto
npm run build    # gera dist/
cd server
npm start
```

O servidor serve a API e os arquivos de `../dist` na mesma porta — é o que permite expor uma
porta só a partir do celular.

## Rotas

### Transações

- `GET /api/transacoes?ano=2026&mes=9` — lista as transações do mês (mês 1-12).
- `POST /api/transacoes` — cria uma transação.
  ```json
  {
    "data": "2026-09-03",
    "descricao": "Mercado",
    "valor": -87.5,
    "categoria": "mercado",
    "recorrente": false,
    "origem": "manual"
  }
  ```
- `DELETE /api/transacoes/:id` — remove uma transação.

### Resumo do mês

- `GET /api/resumo?ano=&mes=&dia=&saldoHoje=&corte=&mesesReferencia=`
  Todos os parâmetros são opcionais (default: ano/mês/dia de hoje, saldoHoje=0, corte=0,
  mesesReferencia=3). Devolve projeção diária, ritmo de gasto, categorias do mês com média de
  referência e os compromissos que ainda vão vencer — tudo calculado por `src/domain`.

### Chat

- `POST /api/chat`
  ```json
  { "pergunta": "posso gastar 200 reais num jantar?", "saldoHoje": 3200 }
  ```
  Monta o contexto financeiro do mês corrente (mesmos cálculos de `/api/resumo`) e chama a API
  da Anthropic do lado do servidor. Se `ANTHROPIC_API_KEY` não estiver definida, ou se a
  chamada falhar, responde no modo degradado: uma resposta baseada em regras usando os mesmos
  números já calculados, nunca um número inventado.

## Fora do escopo por enquanto

Docker, Tailscale, deploy no Termux — isso fica para depois, feito manualmente.
