# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comunicação

Responda sempre em português do Brasil — explicações, resumos, atualizações de progresso e
mensagens de commit propostas. Isso vale mesmo quando código, nomes de variáveis/funções e
comentários técnicos permanecem em inglês (padrão da indústria); a língua do código não muda a
língua da conversa com o usuário.

## Status

This repository is in the **planning / pre-migration** stage. There is no `package.json`,
build tooling, or implementation code yet — only architecture docs (`docs/`) and a
single-file v0 prototype (`docs/prototipo/meu-cfo-v0.jsx`). The `src/` tree is scaffolding
(each folder holds a `.gitkeep`). Before writing any real code, check whether the project
has since been bootstrapped (look for `package.json`); if not, follow the stack choices in
`README.md` (React + TypeScript + Vite, FastAPI + PostgreSQL + Redis from v1, LangGraph for
orchestration) when setting things up.

## Product

Meu CFO is a personal-finance app for Brazilian users, built around Open Finance data. It
answers one question — "posso gastar ou não?" ("can I spend or not?") — with a plain-language
verdict on the home screen, a slider to test the effect of spending less per day, and the
underlying numbers one click away. Full product rationale: `docs/01-visao-produto.md`.

## Non-negotiable architectural rules

These are project-wide constraints, not suggestions — every future feature must respect them.

1. **The LLM never emits a number.** Every value shown in the UI or referenced by the chat is
   computed by a deterministic function over the database; the model only interprets,
   prioritizes, and translates values it's given. See `docs/adr/0001-nenhum-numero-gerado-por-llm.md`.
   Practically: any new chat capability that needs a new slice of data requires a new typed
   tool (see `docs/03-arquitetura-ia.md`), not a prompt that lets the model compute it.
2. **The client never talks to the model provider directly.** All LLM calls go through a
   server route that authenticates the session, builds context from the database (never from
   what the client sent), and holds the API key server-side. See
   `docs/adr/0002-chave-de-api-nunca-no-front.md`.
3. **Domain code has zero dependency on UI.** `src/domain` (pure TypeScript: projection,
   categorization, aggregations) must not import from `src/ui` or `src/features`. This
   boundary is what lets the data source or visual layer change without touching financial
   logic.
4. **The UI reads only the `curated` data layer**, never `raw` or `staging`. Data flows
   `raw` (immutable provider payload, idempotency hash) → `staging` (normalized/typed:
   connection, account, transaction, merchant) → `curated` (query tables: fact_transaction,
   agg_monthly_category, fct_forecast). See `docs/02-modelo-de-dados.md`.
5. **Agents only read, compute, and notify — never act on money.** Any tool that writes data
   is separate from read tools and requires explicit UI confirmation before executing.

## Architecture map

- `src/domain/` — pure TypeScript: cashflow projection, categorization, aggregations. This is
  the tested core and the only layer allowed to encode financial logic.
- `src/data/` — data source adapters: deterministic synthetic transaction generator, OFX/CSV
  import, Pluggy (Open Finance) adapter. All three funnel into the same raw→staging→curated
  pipeline.
- `src/features/` — one folder per screen: `hoje` (today/verdict), `transacoes`
  (transactions), `compromissos` (upcoming commitments), `cfo` (AI chat), `agentes` (agent
  catalog). No "modo planejamento" screen — planning mode is a chat state that writes a
  `scenario` into Compromissos.
- `src/ui/` — design tokens and base components, shared across features.

### Categorization cascade

Categorization runs cheapest-first, each stage only handling what the previous one missed:
deterministic MCC/regex rule → merchant→category cache → LLM batch on the residue → user
correction (which writes a new rule back into stage 1). This ordering is the deliberate
cost/accuracy argument for the whole categorization design — see `docs/02-modelo-de-dados.md`.

### AI orchestration

LangGraph: one graph for chat (with a router) and one graph per agent, with explicit state
between nodes for reproducibility/auditability. The chat UI must show which typed tools
(`query_transactions`, `get_period_summary`, `get_upcoming_commitments`, `forecast_cashflow`,
`compare_periods`, `create_budget`, `simulate_scenario`) were called for a given response —
this is a transparency requirement, not incidental debug output. See `docs/03-arquitetura-ia.md`.

If the model call fails, a local rule-based responder must take over using the same computed
numbers — degrade gracefully, never break, never fabricate a number instead.

### Agents

Each agent is a declarative, asynchronous routine (`id`, name, trigger, allowed tools,
estimated cost, output format, max alert frequency) that writes findings to `insight` and
execution metadata to `agent_run`. The UI never blocks on an agent. Agents are rate-limited by
design ("silence principle" — an agent that over-notifies gets disabled); see
`docs/04-agentes.md` for the current catalog (Vigia de gastos, Caça-assinaturas, Radar de
faturas, Caçador de preços, Planejador) before adding a new one.

## Migration plan from the v0 prototype

`docs/prototipo/meu-cfo-v0.jsx` is a single-file React prototype with synthetic, seeded data —
reference only, not to be imported as-is. `docs/prototipo/README.md` specifies the extraction
order: `projeta()` / `MEDIA_DIARIA` / `COMPROMISSOS` and aggregations → `src/domain` (with
tests) → transaction generator → `src/data` → the CSS design tokens block → `src/ui` → each
screen → its `src/features/<name>` folder. The prototype file can be deleted once migration is
complete (git history preserves it).

## Conventions

- Portuguese (pt-BR) for all product-facing copy, docs, and ADRs; sentence case in the UI,
  active verbs ("Ver transações", not "Visualização de transações"), no jargon.
- Chat tone: 2–4 sentences, no jargon, no lists, no markdown; if data doesn't exist, say so
  rather than estimating.
- Category taxonomy is fixed at 8 categories (Moradia, Mercado, Comer fora, Transporte,
  Saúde, Lazer, Assinaturas, Compras) with colors drawn from Brazilian real banknotes — don't
  introduce a generic color palette or add categories without updating `docs/02-modelo-de-dados.md`.
- Formatting/lint config already exists (`.editorconfig`: LF, 2-space indent; `.vscode/settings.json`
  expects Prettier + ESLint fix-on-save, 100-col ruler) even though the toolchain itself isn't
  installed yet — match these when scaffolding the real project.
