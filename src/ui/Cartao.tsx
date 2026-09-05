import styles from './Cartao.module.css'

export interface CartaoProps {
  rotulo: string
  valor: string
  nota: string
  link: string
}

/** Cartão de estatística reutilizado nos grids de Hoje e Visão geral. */
export function Cartao({ rotulo, valor, nota, link }: CartaoProps) {
  return (
    <div className={styles.cartao}>
      <div className={styles.rotulo}>{rotulo}</div>
      <div className={styles.valor}>{valor}</div>
      <div className={styles.nota}>{nota}</div>
      <div className={styles.link}>{link} →</div>
    </div>
  )
}
