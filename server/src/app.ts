import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { type Express } from 'express'
import { rotaChat } from './rotas/chat.ts'
import { rotaResumo } from './rotas/resumo.ts'
import { rotaTransacoes } from './rotas/transacoes.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CAMINHO_DIST = join(__dirname, '..', '..', 'dist')

export function criaApp(): Express {
  const app = express()

  app.use(express.json())

  app.use('/api/transacoes', rotaTransacoes)
  app.use('/api/resumo', rotaResumo)
  app.use('/api/chat', rotaChat)

  // Serve o front-end buildado (npm run build no projeto raiz) — celular
  // expõe uma porta só, API e SPA juntos.
  app.use(express.static(CAMINHO_DIST))
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next()
      return
    }
    res.sendFile(join(CAMINHO_DIST, 'index.html'), (erro) => {
      if (erro) next(erro)
    })
  })

  return app
}
