import { Router } from 'express'
import { montaResumo } from '../servicos/resumo.ts'

export const rotaResumo = Router()

function numeroOuPadrao(valor: unknown, padrao: number): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : padrao
}

rotaResumo.get('/', (req, res) => {
  const hoje = new Date()
  const ano = numeroOuPadrao(req.query.ano, hoje.getFullYear())
  const mes = numeroOuPadrao(req.query.mes, hoje.getMonth() + 1) // 1-12
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const diaPadrao =
    ano === hoje.getFullYear() && mes === hoje.getMonth() + 1 ? hoje.getDate() : diasNoMes
  const dia = numeroOuPadrao(req.query.dia, diaPadrao)
  const saldoHoje = numeroOuPadrao(req.query.saldoHoje, 0)
  const cortePorDia = numeroOuPadrao(req.query.corte, 0)
  const mesesReferencia = numeroOuPadrao(req.query.mesesReferencia, 3)

  if (mes < 1 || mes > 12) {
    res.status(400).json({ erro: '"mes" deve estar entre 1 e 12.' })
    return
  }
  if (dia < 1 || dia > diasNoMes) {
    res.status(400).json({ erro: `"dia" deve estar entre 1 e ${diasNoMes} para o mês informado.` })
    return
  }

  res.json(montaResumo({ ano, mes, dia, saldoHoje, cortePorDia, mesesReferencia }))
})
