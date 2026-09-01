# 01 — Visão de produto

## Para quem

Adulto brasileiro com renda mensal e conta em banco, que já tentou usar planilha ou
aplicativo de finanças e desistiu. Duas pontas do mesmo público:

- **Quem não tem repertório financeiro.** Não sabe o que é fluxo de caixa e não deveria
  precisar saber. Quer saber se pode pedir delivery hoje.
- **Quem tem repertório.** Já usa planilha, conhece os próprios números, e vai embora se o
  app for raso ou não deixar ele chegar ao dado bruto.

O produto precisa servir os dois na mesma tela. A saída não é ter dois modos: é ter uma
camada de resposta em linguagem comum na frente, e o dado completo a um clique de distância.

## O trabalho que o produto faz

A pessoa não quer "gerenciar finanças". Ela quer parar de sentir a ansiedade difusa de não
saber se está tudo bem. O produto entrega três coisas, nesta ordem de importância:

1. **Um veredito.** Uma frase que responde "estou bem?" sem exigir interpretação.
2. **Uma alavanca.** O que fazer, em termos de ação concreta e pequena.
3. **A prova.** O dado que sustenta o veredito, para quem quiser conferir.

## Tese de interface

> Uma ideia excelente com interface difícil é abandonada na primeira semana. A qualidade da
> interação humano-computador não é acabamento deste produto — é o produto.

Princípios que valem para toda tela:

**Resposta antes de dado.** A frase em português vem primeiro, no maior corpo tipográfico
da tela. Os números vêm depois, em hierarquia decrescente. Nenhuma tela abre com uma tabela.

**Um número acionável, não o número óbvio.** Saldo é informação; "livre para gastar até dia
31" é decisão. A tela inicial mostra o segundo.

**Previsão manipulável.** Mostrar que a pessoa vai fechar o mês no vermelho sem oferecer o
que fazer produz culpa, não mudança. O controle deslizante transforma o diagnóstico em
experimento: arrasta e vê a linha subir.

**Correção vira aprendizado visível.** Quando o usuário troca a categoria de uma transação,
o app responde "vou classificar assim da próxima vez". O sistema aprende e diz que aprendeu.

**Uma só caixa de entrada.** O campo "Pergunte ao seu CFO" acompanha todas as telas. A
pessoa não precisa aprender onde cada função mora.

**Transparência sobre a IA.** Cada resposta do chat mostra quais consultas foram feitas aos
dados. Em produto financeiro, confiança se constrói mostrando o caminho, não escondendo.

## Divisão da plataforma

| Aba | Trabalho que faz |
|---|---|
| Hoje | Veredito do mês, projeção de saldo, alavanca, avisos dos agentes, gastos por categoria |
| Transações | Extrato unificado, busca, filtro, modo planilha, correção de categoria |
| Compromissos | Faturas, parcelas e assinaturas que ainda vão sair |
| CFO | Conversa com a IA sobre os próprios dados |
| Agentes | Catálogo de agentes, ligar e desligar, últimos achados |

O modo planejamento não é aba: é um estado do chat que produz um plano salvo em
Compromissos.

## Linguagem

Sentence case em toda a interface. Verbos ativos: "Ver transações", não "Visualização de
transações". Nada de jargão — "o que ainda vai sair", não "obrigações vincendas". O botão
que diz "Salvar" produz uma confirmação que diz "Salvo".

Tela vazia é convite à ação, não decoração. Erro explica o que aconteceu e como resolver,
sem pedir desculpas.

## O que este produto não é

- Não é rede social de finanças. Não há comparação com outras pessoas.
- Não vive de anúncio nem de disparo de e-mail. Se o produto for bom, ele é usado.
- Não dá recomendação de investimento. Organiza, projeta e explica — não aconselha aplicação.
