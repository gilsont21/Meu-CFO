import { Cabecalho } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaAgentes.module.css'

interface AgenteExemplo {
  nome: string
  status: 'ativo' | 'inativo' | 'sob demanda'
  achado: string
}

// TODO: substituir pelo catálogo real de agentes (docs/04-agentes.md) quando
// os agentes passarem a escrever achados em `insight`.
const AGENTES_EXEMPLO: AgenteExemplo[] = [
  { nome: 'Vigia de gastos', status: 'ativo', achado: 'Comer fora 28% acima da média' },
  { nome: 'Caça-assinaturas', status: 'ativo', achado: '5 assinaturas, R$ 256/mês' },
  { nome: 'Radar de faturas', status: 'ativo', achado: 'R$ 5.418 comprometidos' },
  { nome: 'Caçador de preços', status: 'inativo', achado: '—' },
  { nome: 'Planejador', status: 'sob demanda', achado: '—' },
]

/** Catálogo de agentes com status e achado mais recente. */
export function TelaAgentes() {
  return (
    <div>
      <Cabecalho eyebrow="trabalham em segundo plano" titulo="Agentes" />
      <div className={layout.grid}>
        {AGENTES_EXEMPLO.map((agente) => (
          <div key={agente.nome} className={layout.card}>
            <div className={styles.cabecalhoAgente}>
              <span className={styles.nome}>{agente.nome}</span>
              <span className={styles.pill}>{agente.status}</span>
            </div>
            <p className={layout.placeholder}>{agente.achado}</p>
          </div>
        ))}
        <button type="button" className={layout.cardNovoItem}>
          + Criar agente personalizado
        </button>
      </div>
    </div>
  )
}
