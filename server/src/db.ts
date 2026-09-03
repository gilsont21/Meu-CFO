import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { CATEGORIAS } from '../../src/domain/categorias.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CAMINHO_DB = process.env.DB_PATH ?? join(__dirname, '..', 'data', 'meucfo.db')

export const db = new DatabaseSync(CAMINHO_DB, { enableForeignKeyConstraints: true })
db.exec('PRAGMA journal_mode = WAL')

const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8')
db.exec(schema)

/**
 * node:sqlite não tem um helper de transação como o `db.transaction()` do
 * better-sqlite3 — envolve manualmente com BEGIN/COMMIT/ROLLBACK.
 */
export function transacao<T>(fn: () => T): T {
  db.exec('BEGIN')
  try {
    const resultado = fn()
    db.exec('COMMIT')
    return resultado
  } catch (erro) {
    db.exec('ROLLBACK')
    throw erro
  }
}

const inserirCategoria = db.prepare(
  'INSERT OR IGNORE INTO categorias (chave, nome, cor) VALUES (@chave, @nome, @cor)',
)
transacao(() => {
  for (const categoria of Object.values(CATEGORIAS)) {
    // node:sqlite exige Record<string, SQLInputValue> — nossos tipos de domínio não têm
    // índice de assinatura, então o cast é só para satisfazer o TS; os campos já são
    // string/number, valores válidos para bind.
    inserirCategoria.run(categoria as unknown as Record<string, string>)
  }
})
