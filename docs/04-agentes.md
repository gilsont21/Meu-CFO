# 04 — Agentes

## Definição

Um agente é uma rotina declarativa que observa um recorte dos dados e só procura o usuário
quando encontra algo. Cada um declara:

```
id · nome · gatilho (agendado ou por evento) · ferramentas permitidas
custo estimado · formato de saída · frequência máxima de aviso
```

Execução assíncrona em worker. A saída vai para `insight`; a execução vai para `agent_run`.
A interface nunca espera por um agente.

## Princípio de silêncio

Agente que fala demais é desinstalado. Cada um tem teto de avisos por semana, e um aviso
dispensado não volta pelo mesmo motivo. A régua: só notifica o que provocaria uma decisão
diferente hoje.

## Catálogo

### Vigia de gastos
**Gatilho:** a cada sincronização de transações.
Compara cada categoria com a média móvel de três meses e com o orçamento, se houver. Avisa
no dia, não no fechamento do mês — informação sobre gasto excessivo só tem valor enquanto
ainda dá para mudar de rota.

### Caça-assinaturas
**Gatilho:** diário.
Detecta cobrança recorrente pelo padrão de repetição, compara com o histórico de valores da
mesma recorrência e sinaliza reajuste silencioso, cobrança duplicada e serviço sem uso.
É barato de implementar e costuma ser o agente que gera o valor percebido mais imediato.

### Radar de faturas
**Gatilho:** ao fechar fatura e ao detectar parcelamento novo.
Soma parcelas e recorrências já contratadas e projeta quanto da renda dos próximos meses já
tem destino. Responde à pergunta que a fatura do cartão esconde: quanto do salário de
dezembro já foi gasto.

### Caçador de preços
**Gatilho:** diário, sobre a lista de acompanhamento do usuário.
Produtos, passagens e hotéis. Além do preço, cruza com a projeção do mês e responde não só
"baixou", mas "baixou e cabe".

Depende de origem externa. No protótipo é simulado; em produção exige API de parceiro ou
busca web, com limite de requisições por usuário.

### Planejador
**Gatilho:** sob demanda, a partir do chat.
Modelo maior, roda cenários de decisão grande — financiamento, mudança, meta de reserva — e
devolve um plano de doze meses gravado como `scenario`. Não roda em segundo plano: é caro e
só faz sentido quando a pessoa pediu.

## Controle do usuário

Todos os agentes vêm desligáveis, com o achado mais recente visível no card. Nenhum age sobre
o dinheiro: agentes leem, calculam e avisam. Qualquer ação com efeito financeiro exige
confirmação explícita na interface.

## Como se paga

Sem anúncio e sem disparo de e-mail. Os agentes básicos são parte do produto. O Planejador,
por consumir modelo maior sob demanda, é o candidato natural a plano pago — mas só quando a
base gratuita já for boa o suficiente para as pessoas ficarem sem ele.
