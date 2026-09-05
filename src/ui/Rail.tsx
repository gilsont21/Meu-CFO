import { useState } from 'react'
import styles from './Rail.module.css'

export type NavId = 'hoje' | 'visao' | 'tx' | 'metas' | 'agentes' | 'cfo'

interface ItemNav {
  id: NavId
  rotulo: string
  glifo: string
}

const ITENS_NAV: ItemNav[] = [
  { id: 'hoje', rotulo: 'Hoje', glifo: '◐' },
  { id: 'visao', rotulo: 'Visão geral', glifo: '▤' },
  { id: 'tx', rotulo: 'Transações', glifo: '≡' },
  { id: 'metas', rotulo: 'Metas', glifo: '◎' },
  { id: 'agentes', rotulo: 'Agentes', glifo: '◇' },
  { id: 'cfo', rotulo: 'CFO', glifo: '◆' },
]

interface RailProps {
  atual: NavId
  ajudaAberta: boolean
  onNavegar: (id: NavId) => void
  onAjudaClick: () => void
}

/**
 * Rail lateral fino que expande ao passar o mouse, revelando os rótulos dos
 * itens. O ícone de Ajuda fica isolado no rodapé, visualmente distinto dos
 * itens de trabalho, porque é conteúdo educativo — não uma área de dados.
 */
export function Rail({ atual, ajudaAberta, onNavegar, onAjudaClick }: RailProps) {
  const [expandido, setExpandido] = useState(false)

  return (
    <nav
      className={`${styles.rail} ${expandido ? styles.expandido : ''}`}
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      aria-label="Navegação principal"
    >
      <div className={styles.topo}>
        <div className={styles.marca} aria-hidden="true">
          ₵
        </div>
      </div>

      <div className={styles.itens}>
        {ITENS_NAV.map((item) => {
          const ativo = atual === item.id && !ajudaAberta
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${ativo ? styles.itemAtivo : ''}`}
              onClick={() => onNavegar(item.id)}
              title={item.rotulo}
              aria-label={item.rotulo}
              aria-current={ativo ? 'page' : undefined}
            >
              <span className={styles.glifo} aria-hidden="true">
                {item.glifo}
              </span>
              {expandido && <span className={styles.rotulo}>{item.rotulo}</span>}
            </button>
          )
        })}
      </div>

      <div className={styles.rodape}>
        <button
          type="button"
          className={`${styles.item} ${styles.itemAjuda} ${ajudaAberta ? styles.itemAtivo : ''}`}
          onClick={onAjudaClick}
          title="Ajuda"
          aria-label="Ajuda"
          aria-current={ajudaAberta ? 'page' : undefined}
        >
          <span className={styles.glifo} aria-hidden="true">
            ?
          </span>
          {expandido && <span className={styles.rotulo}>Ajuda</span>}
        </button>
        <div className={styles.conta}>
          <div className={styles.avatar} aria-hidden="true">
            G
          </div>
          {expandido && <span className={styles.contaNome}>Gilson</span>}
        </div>
      </div>
    </nav>
  )
}
