# 02 — Modelo de dados

## Três camadas

Dado financeiro vem sujo, duplicado e em formatos que mudam sem aviso. A separação em
camadas isola essa instabilidade num único lugar.

```
raw        payload bruto do provedor, imutável, com hash de idempotência
  ↓
staging    normalizado e tipado: connection, account, transaction, merchant
  ↓
curated    tabelas de consulta: fact_transaction, agg_monthly_category, fct_forecast
```

A interface e as ferramentas da IA leem **apenas** a camada curated. Nada consulta raw
diretamente. Quando o provedor muda o formato, só a fronteira raw → staging é reescrita.

## Entidades

### connection
Vínculo com uma instituição via Open Finance.
`id`, `institution`, `consent_id`, `status`, `granted_at`, `expires_at`, `scopes`

### account
`id`, `connection_id`, `type` (corrente, poupança, cartão, investimento), `balance`,
`currency`, `synced_at`

### transaction
Entidade central.
`id`, `account_id`, `posted_at`, `amount` (com sinal), `raw_description`, `merchant_id`,
`mcc`, `category_id`, `is_recurring`, `installment_n`, `installment_total`, `source`
(openfinance, ofx, manual, synthetic), `dedupe_hash`

`dedupe_hash` é derivado de conta + data + valor + descrição normalizada. É o que impede
duplicata quando a mesma transação chega por duas sincronizações.

### merchant
Normalização do estabelecimento. `PAG*IFD SAOPAULO` vira `iFood`.
`id`, `normalized_name`, `raw_patterns[]`, `default_category_id`

### category e rule
`category`: taxonomia, com cor e ícone.
`rule`: `pattern` (MCC ou regex), `category_id`, `priority`, `source` (sistema ou usuário).

### recurring_item
Recorrência detectada. `merchant_id`, `expected_amount`, `cadence`, `next_due`,
`amount_history[]` — o histórico é o que permite detectar reajuste silencioso.

### invoice
Ciclo de fatura de cartão. `account_id`, `closes_at`, `due_at`, `total`,
`future_installments[]`

### budget, goal, scenario
Orçamento por categoria e mês, metas, e cenários de simulação salvos.

### agent_run
`agent_id`, `triggered_by`, `started_at`, `duration_ms`, `cost`, `output`

### insight
Saída de agente destinada ao usuário. `agent_id`, `severity`, `message`, `state`
(novo, lido, dispensado). Estado é o que impede o app de repetir o mesmo aviso.

## Categorização em cascata

Do mais barato para o mais caro. Cada etapa só recebe o que a anterior não resolveu.

| Etapa | Método | Cobertura esperada |
|---|---|---|
| 1 | Regra determinística por MCC e regex de merchant | ~60% |
| 2 | Cache `merchant → categoria` já resolvido antes | ~25% |
| 3 | LLM em lote, apenas para o resíduo | ~15% |
| 4 | Correção do usuário, que grava uma `rule` nova | — |

A etapa 4 alimenta a etapa 1. O custo de LLM cai a cada mês de uso, e a acurácia sobe.
Esse é o argumento central do projeto do ponto de vista de engenharia: usar modelo de
linguagem onde ele é insubstituível, e não onde uma expressão regular resolve.

## Taxonomia

Oito categorias. Poucas o bastante para caber em um gráfico legível, específicas o bastante
para gerar decisão.

Moradia · Mercado · Comer fora · Transporte · Saúde · Lazer · Assinaturas · Compras

As cores vêm das cédulas do real — azul do 100, verde, terra do 50, roxo do 5, vermelho do
10, amarelo do 20. A referência é do mundo do próprio assunto, e não de uma paleta genérica.

## Origens de dados

Três modos, mesmo pipeline:

- `synthetic` — gerador determinístico com semente fixa. Usado no protótipo e nos testes.
- `import` — OFX ou CSV exportado do banco. Não exige credencial nem consentimento.
- `openfinance` — Pluggy ou Belvo, em sandbox primeiro.

A demonstração funciona sempre, mesmo sem conexão bancária, e os testes rodam sobre dados
estáveis.
