import { Router } from 'express'
import { montaResumo } from '../servicos/resumo.ts'
import { perguntarAoModelo } from '../servicos/anthropic.ts'
import { respostaFallback } from '../servicos/respostaFallback.ts'

export const rotaChat = Router()

function numeroOuPadrao(valor: unknown, padrao: number): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : padrao
}

rotaChat.post('/', async (req, res) => {
  const { pergunta, ano, mes, dia, saldoHoje, corte } = req.body ?? {}

  if (typeof pergunta !== 'string' || pergunta.trim() === '') {
    res.status(400).json({ erro: '"pergunta" é obrigatória.' })
    return
  }

  const hoje = new Date()
  const resumo = montaResumo({
    ano: numeroOuPadrao(ano, hoje.getFullYear()),
    mes: numeroOuPadrao(mes, hoje.getMonth() + 1),
    dia: numeroOuPadrao(dia, hoje.getDate()),
    saldoHoje: numeroOuPadrao(saldoHoje, 0),
    cortePorDia: numeroOuPadrao(corte, 0),
  })

  if (!process.env.ANTHROPIC_API_KEY) {
    res.json({ resposta: respostaFallback(resumo), modelo: false })
    return
  }

  try {
    const resposta = await perguntarAoModelo(pergunta, resumo)
    res.json({ resposta, modelo: true })
  } catch (erro) {
    console.error('[chat] Falha ao chamar o modelo, usando resposta degradada:', erro)
    res.json({ resposta: respostaFallback(resumo), modelo: false })
  }
})
