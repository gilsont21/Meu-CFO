import styles from './TelaChat.module.css'

// TODO: ligar ao histórico de conversa e ao endpoint server-side do chat
// (docs/03-arquitetura-ia.md) — o cliente nunca fala com o provedor de LLM
// diretamente.
const SUGESTOES_EXEMPLO = [
  'Onde eu mais gastei?',
  'Posso pedir delivery hoje?',
  'O que vence essa semana?',
]

/** CFO em tela cheia: saudação centralizada, chips de sugestão, entrada ancorada embaixo. */
export function TelaChat() {
  return (
    <div className={styles.wrap}>
      <div className={styles.corpo}>
        <h1 className={styles.saudacao}>Converse com o seu CFO</h1>
        <p className={styles.subtitulo}>
          Pergunte qualquer coisa sobre o seu dinheiro. Nenhum número aqui é chutado.
        </p>
        <div className={styles.chips}>
          {SUGESTOES_EXEMPLO.map((sugestao) => (
            <button key={sugestao} type="button" className={styles.chip}>
              {sugestao}
            </button>
          ))}
        </div>
      </div>
      <form
        className={styles.entrada}
        onSubmit={(evento) => {
          evento.preventDefault()
        }}
      >
        <input
          type="text"
          className={styles.campo}
          placeholder="Pergunte ao seu CFO"
          aria-label="Pergunte ao seu CFO"
        />
        <button type="submit" className={styles.enviar} aria-label="Enviar">
          ↑
        </button>
      </form>
    </div>
  )
}
