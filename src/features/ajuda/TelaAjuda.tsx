import { useState } from 'react'
import { Cabecalho, SegmentedControl, type OpcaoSegmentada } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaAjuda.module.css'

type SecaoAjuda = 'prompts' | 'agentes' | 'trilhas'

const SECOES: OpcaoSegmentada<SecaoAjuda>[] = [
  { id: 'prompts', rotulo: 'Como conversar com o CFO' },
  { id: 'agentes', rotulo: 'Como criar um agente' },
  { id: 'trilhas', rotulo: 'Trilhas por objetivo' },
]

interface TrilhaExemplo {
  titulo: string
  passos: string[]
}

const TRILHAS_EXEMPLO: TrilhaExemplo[] = [
  {
    titulo: 'Sair do vermelho',
    passos: [
      'Ver o dia em que o aperto começa',
      'Arrastar a alavanca até fechar no azul',
      'Ativar o Vigia de gastos na categoria que mais pesa',
    ],
  },
  {
    titulo: 'Planejar uma compra grande',
    passos: [
      'Abrir o modo planejamento no CFO',
      'Descrever a compra e a forma de pagamento',
      'Comparar o plano com sua projeção atual',
    ],
  },
  {
    titulo: 'Criar uma reserva de emergência',
    passos: [
      'Criar uma meta em Metas',
      'Definir o aporte mensal sugerido',
      'Acompanhar o progresso em Visão geral',
    ],
  },
  {
    titulo: 'Entender para onde vai seu dinheiro',
    passos: [
      'Abrir Visão geral e ver os 6 meses',
      'Identificar a categoria que mais cresceu',
      'Perguntar ao CFO o motivo do aumento',
    ],
  },
]

interface TelaAjudaProps {
  onFechar: () => void
}

/** Central de ajuda: como conversar com o CFO, como criar um agente, trilhas por objetivo. */
export function TelaAjuda({ onFechar }: TelaAjudaProps) {
  const [secao, setSecao] = useState<SecaoAjuda>('prompts')

  return (
    <div>
      <div className={styles.topo}>
        <Cabecalho eyebrow="central de ajuda" titulo="Aproveite melhor o Meu CFO" />
        <button type="button" className={styles.fechar} onClick={onFechar}>
          fechar ✕
        </button>
      </div>

      <SegmentedControl
        opcoes={SECOES}
        selecionado={secao}
        onSelecionar={setSecao}
        ariaLabel="Seção da ajuda"
      />

      {secao === 'prompts' && (
        <div className={styles.lista}>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>Seja específico sobre o recorte</h2>
            <p className={styles.exemploRuim}>✗ &quot;como estão meus gastos?&quot;</p>
            <p className={styles.exemploBom}>
              ✓ &quot;quanto gastei com comer fora nas últimas 2 semanas comparado ao mês
              passado?&quot;
            </p>
          </div>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>Peça o plano, não só o diagnóstico</h2>
            <p className={styles.exemploRuim}>✗ &quot;estou gastando demais&quot;</p>
            <p className={styles.exemploBom}>
              ✓ &quot;quanto eu preciso cortar por dia para fechar o mês no azul?&quot;
            </p>
          </div>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>Use o modo planejamento para decisões grandes</h2>
            <p className={layout.placeholder}>
              exemplo: &quot;e se eu financiar um carro de R$ 90 mil em 48x?&quot; → aciona o
              Planejador
            </p>
          </div>
        </div>
      )}

      {secao === 'agentes' && (
        <div className={styles.lista}>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>1. Diga o que você quer acompanhar</h2>
            <p className={layout.placeholder}>
              &quot;avise se eu gastar mais de R$ 300 em delivery no mês&quot;
            </p>
          </div>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>2. Escolha a frequência</h2>
            <p className={layout.placeholder}>diário · semanal · ao detectar o evento</p>
          </div>
          <div className={layout.card}>
            <h2 className={layout.blocoTitulo}>3. Revise antes de ativar</h2>
            <p className={layout.placeholder}>prévia de como e quando o agente vai te avisar</p>
          </div>
        </div>
      )}

      {secao === 'trilhas' && (
        <div className={layout.grid}>
          {TRILHAS_EXEMPLO.map((trilha) => (
            <div key={trilha.titulo} className={layout.card}>
              <h2 className={layout.blocoTitulo}>{trilha.titulo}</h2>
              <ol className={styles.passos}>
                {trilha.passos.map((passo) => (
                  <li key={passo} className={styles.passoItem}>
                    {passo}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
