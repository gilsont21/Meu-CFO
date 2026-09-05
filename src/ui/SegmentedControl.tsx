import styles from './SegmentedControl.module.css'

export interface OpcaoSegmentada<T extends string> {
  id: T
  rotulo: string
}

interface SegmentedControlProps<T extends string> {
  opcoes: OpcaoSegmentada<T>[]
  selecionado: T
  onSelecionar: (id: T) => void
  ariaLabel: string
}

/** Segmented control genérico e reutilizável — troca de seção dentro de uma mesma tela. */
export function SegmentedControl<T extends string>({
  opcoes,
  selecionado,
  onSelecionar,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.segmented} role="tablist" aria-label={ariaLabel}>
      {opcoes.map((opcao) => {
        const ativo = opcao.id === selecionado
        return (
          <button
            key={opcao.id}
            type="button"
            role="tab"
            aria-selected={ativo}
            className={`${styles.item} ${ativo ? styles.itemAtivo : ''}`}
            onClick={() => onSelecionar(opcao.id)}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
