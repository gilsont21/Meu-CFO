import type { Transacao } from '../domain/tipos'
import { ESTABELECIMENTOS, sorteiaCategoria } from './estabelecimentos'
import { mulberry32 } from './mulberry32'
import { RECORRENTES } from './recorrentes'

export interface GeraTransacoesMesParams {
  ano: number
  mes: number
  /** Gera transações do dia 1 até este dia, inclusive. */
  ateDia: number
  /** Mesma seed sempre gera as mesmas transações — é o que torna o cenário reproduzível. */
  seed: number
}

/**
 * Gera as transações sintéticas de um mês: os compromissos recorrentes que já
 * venceram até `ateDia`, mais de 1 a 3 transações variáveis por dia,
 * sorteadas por categoria e estabelecimento a partir da seed informada.
 */
export function geraTransacoesMes(params: GeraTransacoesMesParams): Transacao[] {
  const { ano, mes, ateDia, seed } = params
  const aleatorio = mulberry32(seed)
  const transacoes: Transacao[] = []
  let indice = 0
  const proximoId = (): string => `${seed}-${indice++}`

  for (const recorrente of RECORRENTES) {
    if (recorrente.dia <= ateDia) {
      transacoes.push({
        id: proximoId(),
        data: new Date(ano, mes, recorrente.dia),
        descricao: recorrente.descricao,
        valor: recorrente.valor,
        categoria: recorrente.categoria,
        recorrente: true,
        origem: 'synthetic',
      })
    }
  }

  for (let dia = 1; dia <= ateDia; dia++) {
    const transacoesNoDia = 1 + Math.floor(aleatorio() * 2.6)
    for (let i = 0; i < transacoesNoDia; i++) {
      const categoria = sorteiaCategoria(aleatorio)
      const lojas = ESTABELECIMENTOS[categoria]
      const [nome, min, max] = lojas[Math.floor(aleatorio() * lojas.length)]
      const valor = -Math.round((min + aleatorio() * (max - min)) * 100) / 100
      transacoes.push({
        id: proximoId(),
        data: new Date(ano, mes, dia),
        descricao: nome,
        valor,
        categoria,
        recorrente: false,
        origem: 'synthetic',
      })
    }
  }

  return transacoes
}
