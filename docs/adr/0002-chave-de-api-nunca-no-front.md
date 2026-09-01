# ADR 0002 — Chamada ao modelo sempre por rota de servidor

- **Status:** aceito
- **Data:** 2026-08

## Contexto

O protótipo v0 chamava a API do modelo direto do navegador, porque o ambiente de execução
do protótipo cuidava da autenticação. Fora daquele ambiente, isso exigiria a chave de API no
código de front-end, onde qualquer visitante pode lê-la.

## Decisão

O cliente nunca fala com o provedor de modelo. Toda chamada passa por rota de servidor
própria, que:

1. autentica a sessão do usuário;
2. monta o contexto financeiro a partir do banco, e não a partir do que o cliente enviou;
3. chama o provedor com a chave guardada em variável de ambiente;
4. aplica limite de requisições por usuário e registra custo em `agent_run`.

## Consequências

- Deploy só de front-end deixa de ser suficiente. Passa a existir servidor desde o v1.
- O cliente não consegue forjar o contexto financeiro, o que fecha uma via de manipulação.
- Custo por usuário fica medível e limitável.
