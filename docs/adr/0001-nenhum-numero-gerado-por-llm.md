# ADR 0001 — Nenhum número exibido é gerado por LLM

- **Status:** aceito
- **Data:** 2026-08
- **Contexto:** chat de finanças pessoais sobre dados reais do usuário

## Contexto

O chat responde perguntas sobre dinheiro do usuário. A saída natural de um modelo de
linguagem inclui valores, somas e percentuais gerados como texto — sujeitos a erro
aritmético e a alucinação, sem nenhum sinal visível de que estão errados.

## Decisão

Todo valor numérico exibido na interface ou citado pelo chat é calculado por função
determinística sobre a camada curated. O modelo recebe os valores já prontos e só os
interpreta, prioriza e traduz.

O prompt instrui explicitamente: usar apenas os números do contexto, nunca estimar, nunca
arredondar, e declarar ausência de dado quando ele não estiver presente.

## Consequências

**Positivas**
- Um número errado passa a ser um bug reproduzível, não um comportamento estocástico.
- A camada de cálculo é testável de forma independente do modelo.
- Trocar de modelo não altera nenhum valor exibido.

**Negativas**
- Toda pergunta nova que exija um recorte inédito de dado precisa de ferramenta nova.
- O modelo às vezes precisa dizer que não tem a informação, onde um sistema mais solto
  responderia algo plausível.

O segundo custo é aceito de propósito: em produto financeiro, um "não sei" correto vale
mais que uma resposta convincente e errada.
