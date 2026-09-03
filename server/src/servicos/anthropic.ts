import Anthropic from '@anthropic-ai/sdk'
import type { Resumo } from './resumo.ts'

let cliente: Anthropic | null = null

function getCliente(): Anthropic {
  if (!cliente) {
    cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return cliente
}

const SYSTEM_PROMPT = `Você é o CFO pessoal do usuário, dentro do app Meu CFO.
Responda em português do Brasil, em 2 a 4 frases, sem jargão, sem listas, sem markdown.
Você nunca calcula nem estima números: use apenas os valores já computados no
JSON de contexto financeiro fornecido a seguir. Se a pergunta pedir algo que
não está no contexto, diga que esse dado não está disponível em vez de estimar.`

/**
 * Chama o modelo do lado do servidor (ADR 0002 — a chave nunca vai ao
 * front-end). O contexto financeiro vem inteiramente do banco via
 * src/domain, nunca do que o cliente enviou (rule #1 do CLAUDE.md: o modelo
 * só interpreta números, nunca os gera).
 */
export async function perguntarAoModelo(pergunta: string, resumo: Resumo): Promise<string> {
  const client = getCliente()

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4096,
    output_config: { effort: 'medium' },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Contexto financeiro (JSON, já calculado — não recalcule nada):\n${JSON.stringify(resumo)}\n\nPergunta do usuário: ${pergunta}`,
      },
    ],
  })

  const bloco = response.content.find((b) => b.type === 'text')
  if (!bloco || bloco.type !== 'text') {
    throw new Error('Resposta do modelo sem bloco de texto.')
  }
  return bloco.text
}
