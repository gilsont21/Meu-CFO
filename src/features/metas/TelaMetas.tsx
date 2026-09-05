import { Cabecalho } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaMetas.module.css'

interface MetaExemplo {
  nome: string
  alvo: number
  atual: number
  prazo: string
}

// TODO: substituir por metas reais quando o domínio de metas existir.
const METAS_EXEMPLO: MetaExemplo[] = [
  { nome: 'Reserva de emergência', alvo: 15000, atual: 6200, prazo: 'dez/2026' },
  { nome: 'Viagem para o Chile', alvo: 4500, atual: 1800, prazo: 'jul/2027' },
  { nome: 'Troca de notebook', alvo: 6000, atual: 5100, prazo: 'out/2026' },
]

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

/** Grid de metas com progresso, valor atual/alvo e prazo. */
export function TelaMetas() {
  return (
    <div>
      <Cabecalho eyebrow={`${METAS_EXEMPLO.length} metas ativas`} titulo="Metas e objetivos" />

      <div className={layout.grid}>
        {METAS_EXEMPLO.map((meta) => {
          const percentual = Math.round((meta.atual / meta.alvo) * 100)
          return (
            <div key={meta.nome} className={layout.card}>
              <div className={styles.cabecalhoMeta}>
                <span className={layout.blocoTitulo}>{meta.nome}</span>
                <span className={styles.prazo}>até {meta.prazo}</span>
              </div>
              <div className={styles.barraFundo}>
                <div className={styles.barraPreenchida} style={{ width: `${percentual}%` }} />
              </div>
              <div className={styles.rodapeMeta}>
                <span>
                  {formatoMoeda.format(meta.atual)} de {formatoMoeda.format(meta.alvo)}
                </span>
                <span>{percentual}%</span>
              </div>
              <div className={layout.link}>ajustar aporte mensal →</div>
            </div>
          )
        })}

        <button type="button" className={layout.cardNovoItem}>
          + Nova meta
        </button>
      </div>
    </div>
  )
}
