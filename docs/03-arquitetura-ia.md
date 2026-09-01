# 03 — Arquitetura de IA

## Regra fundamental

**O modelo de linguagem nunca produz um número.**

Todo valor exibido ou citado vem de função determinística sobre o banco. O modelo recebe
esses valores prontos e apenas os interpreta, prioriza e traduz para linguagem comum.

Num produto financeiro, um número inventado não é um erro de qualidade — é a falha que
destrói a confiança de forma irreversível. A pessoa que descobre um valor errado nunca mais
acredita nos valores certos. Detalhamento em
[ADR 0001](adr/0001-nenhum-numero-gerado-por-llm.md).

## Ferramentas expostas

Cada uma é uma consulta tipada sobre a camada curated. O modelo escolhe quais chamar; nenhuma
retorna texto livre.

| Ferramenta | Retorna |
|---|---|
| `query_transactions` | Transações por período, categoria ou estabelecimento |
| `get_period_summary` | Entradas, saídas e saldo de um intervalo |
| `get_upcoming_commitments` | Faturas, parcelas e recorrências futuras |
| `forecast_cashflow` | Projeção de saldo dia a dia até o fim do período |
| `compare_periods` | Variação por categoria entre dois períodos |
| `create_budget` | Grava um orçamento (ação, exige confirmação) |
| `simulate_scenario` | Projeção sob premissas alteradas |

Ferramentas que gravam algo são separadas das que apenas leem, e nenhuma escrita acontece
sem confirmação explícita na interface.

## Contexto

No prompt de sistema entra apenas um resumo compacto: saldo, ritmo de gasto, compromissos
do período e as principais categorias. Dado bruto entra por ferramenta, nunca por contexto.

Motivos: custo por token, risco de o modelo somar valores por conta própria a partir de uma
lista, e privacidade — quanto menos dado pessoal transita no prompt, melhor.

## Orquestração

LangGraph. Um grafo para o chat, com roteador, e um grafo por agente. Estado explícito entre
os nós, o que torna cada execução reproduzível e auditável — condição para depurar
comportamento de agente em produção.

## Transparência na interface

Cada resposta do chat mostra quais ferramentas foram consultadas, em etiquetas discretas
acima do texto. Não é debug exposto por descuido: é o mecanismo pelo qual o usuário entende
que a resposta tem lastro nos dados dele.

## Tom

Português do Brasil, 2 a 4 frases, sem jargão, sem listas, sem markdown. Se o dado não
existe, o modelo diz que não tem a informação — nunca preenche a lacuna com estimativa.

## Degradação

Se a chamada ao modelo falhar, um respondedor local baseado em regras assume, usando
exatamente os mesmos números calculados. A resposta fica mais seca, mas nunca errada, e o
app não quebra na frente do usuário.

## Custo

Categorização em lote e fora do horário de pico. Cache de merchant que evita reprocessar o
que já foi resolvido. Modelo maior reservado ao modo planejamento, sob demanda explícita.

Consciência de custo de inferência é requisito de arquitetura, não otimização posterior.
