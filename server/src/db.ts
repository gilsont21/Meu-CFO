import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { CATEGORIAS } from '../../src/domain/categorias.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CAMINHO_DB = process.env.DB_PATH ?? join(__dirname, '..', 'data', 'meucfo.db')

export const db = new Database(CAMINHO_DB)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8')
db.exec(schema)

const inserirCategoria = db.prepare(
  'INSERT OR IGNORE INTO categorias (chave, nome, cor) VALUES (@chave, @nome, @cor)',
)
const transacaoSeedCategorias = db.transaction(() => {
  for (const categoria of Object.values(CATEGORIAS)) {
    inserirCategoria.run(categoria)
  }
})
transacaoSeedCategorias()
