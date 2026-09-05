import { Cabecalho, Cartao } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaVisaoGeral.module.css'

// TODO: substituir pelos dados agregados de src/domain quando existir uma
// série histórica multi-mês (patrimônio, taxa de poupança, entradas/saídas).
const CARTOES_EXEMPLO = [
  {
    rotulo: 'patrimônio líquido',
    valor: 'R$ 8.240',
    nota: '+R$ 1.100 em 6 meses',
    link: 'ver evolução',
  },
  { rotulo: 'taxa de poupança', valor: '9%', nota: 'meta pessoal: 15%', link: 'ajustar meta' },
  {
    rotulo: 'mês mais apertado',
    valor: 'Junho',
    nota: 'fechou R$ 340 no vermelho',
    link: 'ver o que houve',
  },
]

/** Tendência ao longo do tempo — complementa o veredito do mês corrente de Hoje. */
export function TelaVisaoGeral() {
  return (
    <div>
      <Cabecalho eyebrow="últimos 6 meses" titulo="Como você está indo ao longo do tempo" />

      <div className={layout.grid}>
        {CARTOES_EXEMPLO.map((cartao) => (
          <Cartao key={cartao.rotulo} {...cartao} />
        ))}
      </div>

      <h2 className={layout.blocoTitulo}>Entradas x saídas por mês</h2>
      <div className={layout.card}>
        <div
          className={styles.espacoGrafico}
          role="img"
          aria-label="Gráfico de barras de entradas e saídas por mês"
        >
          gráfico de barras — entradas e saídas lado a lado, 6 meses
        </div>
      </div>

      <h2 className={layout.blocoTitulo}>Categorias que mais cresceram</h2>
      <div className={layout.card}>
        <p className={layout.placeholder}>ranking de categorias por variação % no período</p>
      </div>
    </div>
  )
}
