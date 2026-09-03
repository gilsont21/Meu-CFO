import { Router } from 'express'
import { CATEGORIAS_DE_GASTO } from '../../../src/domain/categorias.ts'
import type { CategoriaChave, OrigemTransacao } from '../../../src/domain/tipos.ts'
import * as transacoesRepo from '../repositorios/transacoes.ts'

export const rotaTransacoes = Router()

const CATEGORIAS_VALIDAS = new Set<CategoriaChave>([...CATEGORIAS_DE_GASTO, 'receita'])
const ORIGENS_VALIDAS = new Set<OrigemTransacao>(['openfinance', 'ofx', 'manual', 'synthetic'])
const REGEX_DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

rotaTransacoes.get('/', (req, res) => {
  const ano = Number(req.query.ano)
  const mes = Number(req.query.mes) // 1-12

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    res.status(400).json({ erro: 'Informe "ano" e "mes" (1-12) como query params.' })
    return
  }

  res.json(transacoesRepo.listarDoMes(ano, mes))
})

rotaTransacoes.post('/', (req, res) => {
  const { data, descricao, valor, categoria, recorrente, origem } = req.body ?? {}

  if (typeof data !== 'string' || !REGEX_DATA_ISO.test(data)) {
    res.status(400).json({ erro: '"data" deve estar no formato AAAA-MM-DD.' })
    return
  }
  if (typeof descricao !== 'string' || descricao.trim() === '') {
    res.status(400).json({ erro: '"descricao" é obrigatória.' })
    return
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    res.status(400).json({ erro: '"valor" deve ser um número (negativo para saída).' })
    return
  }
  if (!CATEGORIAS_VALIDAS.has(categoria)) {
    res.status(400).json({ erro: `"categoria" inválida. Use uma de: ${[...CATEGORIAS_VALIDAS].join(', ')}` })
    return
  }
  if (origem !== undefined && !ORIGENS_VALIDAS.has(origem)) {
    res.status(400).json({ erro: `"origem" inválida. Use uma de: ${[...ORIGENS_VALIDAS].join(', ')}` })
    return
  }

  const criada = transacoesRepo.inserir({
    data,
    descricao,
    valor,
    categoria,
    recorrente: Boolean(recorrente),
    origem,
  })
  res.status(201).json(criada)
})

rotaTransacoes.delete('/:id', (req, res) => {
  const removida = transacoesRepo.remover(req.params.id)
  if (!removida) {
    res.status(404).json({ erro: 'Transação não encontrada.' })
    return
  }
  res.status(204).end()
})
