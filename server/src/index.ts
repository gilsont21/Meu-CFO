import 'dotenv/config'
import { criaApp } from './app.ts'
import './db.ts' // abre o banco e garante o schema antes de subir o servidor

const PORTA = Number(process.env.PORT) || 3000

const app = criaApp()
app.listen(PORTA, () => {
  console.log(`Meu CFO (servidor caseiro) rodando em http://localhost:${PORTA}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY não definida — /api/chat vai responder no modo degradado (sem modelo).')
  }
})
