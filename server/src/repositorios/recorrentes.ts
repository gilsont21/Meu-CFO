import type { CompromissoRecorrente } from '../../../src/domain/tipos.ts'
import { db } from '../db.ts'

export function listar(): CompromissoRecorrente[] {
  return db
    .prepare('SELECT dia, descricao, valor, categoria, tipo FROM itens_recorrentes ORDER BY dia ASC')
    .all() as unknown as CompromissoRecorrente[]
}
