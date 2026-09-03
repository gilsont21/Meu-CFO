-- Schema do servidor caseiro (SQLite). Cobre só as três entidades necessárias
-- para as telas Hoje e Transações funcionarem, entre as descritas em
-- docs/02-modelo-de-dados.md: transaction, category, recurring_item.
--
-- Nomes de tabela em português para acompanhar a convenção já usada em
-- src/domain e src/data (Transacao, CategoriaChave, CompromissoRecorrente).
-- Não há aqui as camadas raw/staging nem as entidades de Open Finance
-- (connection, account, merchant) — este é o plano de servidor caseiro,
-- separado do plano de nuvem documentado no README.

CREATE TABLE IF NOT EXISTS categorias (
  chave TEXT PRIMARY KEY,
  nome  TEXT NOT NULL,
  cor   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transacoes (
  id         TEXT PRIMARY KEY,
  data       TEXT NOT NULL, -- ISO 'AAAA-MM-DD'
  descricao  TEXT NOT NULL,
  valor      REAL NOT NULL, -- com sinal: negativo é saída, positivo é entrada
  categoria  TEXT NOT NULL REFERENCES categorias (chave),
  recorrente INTEGER NOT NULL DEFAULT 0, -- 0/1
  origem     TEXT NOT NULL DEFAULT 'manual', -- openfinance | ofx | manual | synthetic
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes (data);

CREATE TABLE IF NOT EXISTS itens_recorrentes (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  dia       INTEGER NOT NULL, -- dia do mês, 1-31
  descricao TEXT NOT NULL,
  valor     REAL NOT NULL, -- com sinal
  categoria TEXT NOT NULL REFERENCES categorias (chave),
  tipo      TEXT NOT NULL -- entrada | fixo | assinatura | fatura | parcela | variável
);
