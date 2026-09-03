import { geraTransacoesMes } from '../../src/data/gera-transacoes-mes.ts'
import { RECORRENTES } from '../../src/data/recorrentes.ts'
import { db, transacao } from './db.ts' // garante schema + categorias antes de semear o resto
import { paraIso } from './repositorios/transacoes.ts'

/**
 * Popula itens_recorrentes com os compromissos fixos do cenário de
 * demonstração e gera transações sintéticas do mês corrente até hoje —
 * mesma lógica de src/data, só para ter dado para testar as rotas.
 */

const jaTemRecorrentes = db.prepare('SELECT COUNT(*) AS n FROM itens_recorrentes').get() as
  | { n: number }
  | undefined
if (!jaTemRecorrentes || jaTemRecorrentes.n === 0) {
  const inserirRecorrente = db.prepare(
    `INSERT INTO itens_recorrentes (dia, descricao, valor, categoria, tipo)
     VALUES (@dia, @descricao, @valor, @categoria, @tipo)`,
  )
  transacao(() => {
    for (const r of RECORRENTES) inserirRecorrente.run(r as unknown as Record<string, string | number>)
  })
  console.log(`Semeados ${RECORRENTES.length} itens_recorrentes.`)
} else {
  console.log('itens_recorrentes já tem dados — pulando.')
}

const jaTemTransacoes = db.prepare('SELECT COUNT(*) AS n FROM transacoes').get() as
  | { n: number }
  | undefined
if (!jaTemTransacoes || jaTemTransacoes.n === 0) {
  const hoje = new Date()
  const transacoes = geraTransacoesMes({
    ano: hoje.getFullYear(),
    mes: hoje.getMonth(),
    ateDia: hoje.getDate(),
    seed: 42,
  })

  const inserirTransacao = db.prepare(
    `INSERT INTO transacoes (id, data, descricao, valor, categoria, recorrente, origem)
     VALUES (@id, @data, @descricao, @valor, @categoria, @recorrente, @origem)`,
  )
  transacao(() => {
    for (const t of transacoes) {
      inserirTransacao.run({
        id: t.id,
        data: paraIso(t.data.getFullYear(), t.data.getMonth() + 1, t.data.getDate()),
        descricao: t.descricao,
        valor: t.valor,
        categoria: t.categoria,
        recorrente: t.recorrente ? 1 : 0,
        origem: t.origem,
      })
    }
  })
  console.log(`Semeadas ${transacoes.length} transações sintéticas do mês corrente.`)
} else {
  console.log('transacoes já tem dados — pulando.')
}
