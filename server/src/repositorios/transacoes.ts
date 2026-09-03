import { randomUUID } from 'node:crypto'
import type { OrigemTransacao, Transacao } from '../../../src/domain/tipos.ts'
import { db } from '../db.ts'

interface LinhaTransacao {
  id: string
  data: string
  descricao: string
  valor: number
  categoria: Transacao['categoria']
  recorrente: number
  origem: OrigemTransacao
}

function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

function paraDominio(linha: LinhaTransacao): Transacao {
  return {
    id: linha.id,
    data: paraData(linha.data),
    descricao: linha.descricao,
    valor: linha.valor,
    categoria: linha.categoria,
    recorrente: Boolean(linha.recorrente),
    origem: linha.origem,
  }
}

/** AAAA-MM-DD a partir de componentes locais, sem passar por UTC. */
function paraIso(ano: number, mes: number, dia: number): string {
  const mm = String(mes).padStart(2, '0')
  const dd = String(dia).padStart(2, '0')
  return `${ano}-${mm}-${dd}`
}

export function listarEntre(inicioIso: string, fimIso: string): Transacao[] {
  const linhas = db
    .prepare<[string, string], LinhaTransacao>(
      'SELECT * FROM transacoes WHERE data BETWEEN ? AND ? ORDER BY data ASC, criado_em ASC',
    )
    .all(inicioIso, fimIso)
  return linhas.map(paraDominio)
}

export function listarDoMes(ano: number, mes1a12: number): Transacao[] {
  const diasNoMes = new Date(ano, mes1a12, 0).getDate()
  return listarEntre(paraIso(ano, mes1a12, 1), paraIso(ano, mes1a12, diasNoMes))
}

export interface NovaTransacao {
  data: string // AAAA-MM-DD
  descricao: string
  valor: number
  categoria: Transacao['categoria']
  recorrente?: boolean
  origem?: OrigemTransacao
}

export function inserir(nova: NovaTransacao): Transacao {
  const linha: LinhaTransacao = {
    id: randomUUID(),
    data: nova.data,
    descricao: nova.descricao,
    valor: nova.valor,
    categoria: nova.categoria,
    recorrente: nova.recorrente ? 1 : 0,
    origem: nova.origem ?? 'manual',
  }
  db.prepare(
    `INSERT INTO transacoes (id, data, descricao, valor, categoria, recorrente, origem)
     VALUES (@id, @data, @descricao, @valor, @categoria, @recorrente, @origem)`,
  ).run(linha)
  return paraDominio(linha)
}

export function remover(id: string): boolean {
  const resultado = db.prepare('DELETE FROM transacoes WHERE id = ?').run(id)
  return resultado.changes > 0
}

export { paraIso }
