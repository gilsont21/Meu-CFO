import { Cabecalho, Cartao } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaHoje.module.css'

// TODO: substituir os valores de exemplo pelos dados reais assim que a tela
// for ligada a src/domain (projeta, calcularLivreParaGastar,
// calcularMediaDiaria, calcularCompromissosFuturos) e src/data.
const VEREDITO_EXEMPLO = 'Do jeito que está, você fecha agosto R$ 178 no vermelho.'

const CARTOES_EXEMPLO = [
  {
    rotulo: 'livre para gastar',
    valor: 'R$ 412',
    nota: '13 dias restantes',
    link: 'ver detalhes',
  },
  { rotulo: 'ritmo de gasto', valor: 'R$ 87/dia', nota: '+18% vs. média', link: 'ver categorias' },
  {
    rotulo: 'próximo compromisso',
    valor: 'Fatura · dia 25',
    nota: 'R$ 2.980',
    link: 'ver todos',
  },
  {
    rotulo: 'o que os agentes viram',
    valor: '2 avisos',
    nota: 'comer fora subiu',
    link: 'ver agentes',
  },
]

/** Veredito do mês corrente: frase, projeção de saldo e alavanca de corte por dia. */
export function TelaHoje() {
  return (
    <div>
      <Cabecalho eyebrow="terça, 18 de agosto" titulo="Como está o seu mês" />

      <section className={`${layout.card} ${styles.hero}`}>
        <div className={styles.rotuloHero}>veredito do mês</div>
        <p className={styles.frase}>{VEREDITO_EXEMPLO}</p>
        <div
          className={styles.espacoGrafico}
          role="img"
          aria-label="Gráfico de projeção de saldo ao longo do mês"
        >
          gráfico de projeção — linha cheia até hoje, tracejada depois
        </div>
        <div className={styles.espacoAlavanca}>alavanca: segurar R$ ___ por dia</div>
      </section>

      <div className={layout.grid}>
        {CARTOES_EXEMPLO.map((cartao) => (
          <Cartao key={cartao.rotulo} {...cartao} />
        ))}
      </div>

      <h2 className={layout.blocoTitulo}>Para onde foi o dinheiro</h2>
      <div className={layout.card}>
        <p className={layout.placeholder}>lista de categorias com barra de proporção</p>
      </div>
    </div>
  )
}
