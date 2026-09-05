import styles from './Cabecalho.module.css'

interface CabecalhoProps {
  eyebrow: string
  titulo: string
}

/** Cabeçalho padrão de tela: rótulo de contexto acima do título principal. */
export function Cabecalho({ eyebrow, titulo }: CabecalhoProps) {
  return (
    <header className={styles.cabecalho}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.titulo}>{titulo}</h1>
    </header>
  )
}
