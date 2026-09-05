# Meu CFO

Plataforma de gestão financeira pessoal com IA. Conecta-se ao Open Finance, organiza
entradas, saídas e compromissos futuros, e responde em português claro à única pergunta
que a pessoa realmente faz: **posso gastar ou não?**

> Status: protótipo v0 concluído. Em migração para aplicação real.

---

## O problema

Aplicativos financeiros abrem com saldo. Saldo não é resposta — ele ignora o aluguel que
vence amanhã e a fatura que fecha dia 25. A pessoa olha, não entende o que fazer com
aquilo, e abandona o app em duas semanas.

## A aposta

Três decisões definem este produto:

1. **A tela inicial é uma frase, não um relatório.** "Do jeito que está, você fecha agosto
   R$ 178,40 no vermelho — o aperto começa no dia 25."
2. **A previsão é uma alavanca, não um veredito.** Um controle deslizante deixa a pessoa
   testar o efeito de segurar um pouco por dia e ver a linha do gráfico subir.
3. **A IA nunca escreve um número.** Todo valor vem de função determinística sobre o banco;
   o modelo apenas interpreta. Ver [ADR 0001](docs/adr/0001-nenhum-numero-gerado-por-llm.md).

## Documentação

| Documento | Conteúdo |
|---|---|
| [Visão de produto](docs/01-visao-produto.md) | Público, proposta de valor, tese de interface |
| [Modelo de dados](docs/02-modelo-de-dados.md) | Camadas raw → staging → curated, entidades, categorização |
| [Arquitetura de IA](docs/03-arquitetura-ia.md) | Orquestração, ferramentas determinísticas, contexto |
| [Agentes](docs/04-agentes.md) | Catálogo, gatilhos, execução assíncrona |
| [Decisões (ADR)](docs/adr) | Registro das decisões de arquitetura |

## Stack

| Camada | Escolha |
|---|---|
| Interface | React + TypeScript + Vite |
| Gráficos | SVG próprio (controle total sobre a linguagem visual) |
| Ícones | lucide-react |
| Backend | FastAPI + PostgreSQL + Redis (a partir do v1) |
| Fila | Celery ou RQ, para execução dos agentes |
| IA | LangGraph com ferramentas SQL tipadas |
| Open Finance | Pluggy (sandbox), com fallback OFX/CSV e gerador sintético |

## Estrutura

```
src/
├── domain/      TypeScript puro: projeção, categorização, agregações. Testado.
├── data/        Gerador sintético e adaptadores de origem (OFX, Pluggy)
├── features/    Uma pasta por tela: hoje, transacoes, compromissos, cfo, agentes
└── ui/          Tokens de design e componentes base
```

O domínio não importa nada da interface. É essa fronteira que permite trocar a origem dos
dados ou a camada visual sem reescrever a lógica financeira.

## Rodando o projeto

```bash
npm install
npm run dev
```

## Instalando como app (PWA)

O front-end é um PWA instalável (manifest + service worker, via `vite-plugin-pwa`). Depois
de rodar `npm run build` e subir o servidor (`server/`, que serve o `dist/` gerado):

- **Desktop (Chrome/Edge)**: abra o endereço do servidor no navegador e clique no ícone de
  instalar que aparece na barra de endereço.
- **Android**: abra o endereço no Chrome, toque no menu (⋮) e escolha "Adicionar à tela
  inicial".

Os ícones em `public/pwa-192x192.png` e `public/pwa-512x512.png` são placeholders (as letras
"CFO" sobre fundo escuro) — trocar por um ícone definitivo quando o visual for fechado.

## Roadmap

- **v0** — protótipo de interface com dados sintéticos ✅
- **v1** — domínio extraído e testado, importação OFX/CSV, categorização em cascata
- **v2** — backend, Pluggy sandbox, agentes em worker, modo planejamento

## Licença

MIT
