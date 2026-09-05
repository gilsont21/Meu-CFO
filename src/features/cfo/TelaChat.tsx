import { useState, type FormEvent } from 'react'
import { enviarPergunta } from '../../servicos/api'
import styles from './TelaChat.module.css'

const SUGESTOES = ['Onde eu mais gastei?', 'Posso pedir delivery hoje?', 'O que vence essa semana?']

interface Mensagem {
  autor: 'usuario' | 'cfo'
  texto: string
}

/** CFO em tela cheia: saudação centralizada, chips de sugestão, entrada ancorada embaixo. */
export function TelaChat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [campo, setCampo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function perguntar(pergunta: string) {
    const perguntaLimpa = pergunta.trim()
    if (perguntaLimpa === '' || enviando) return

    setErro(null)
    setCampo('')
    setMensagens((atual) => [...atual, { autor: 'usuario', texto: perguntaLimpa }])
    setEnviando(true)

    const resultado = await enviarPergunta(perguntaLimpa)

    setEnviando(false)
    if (!resultado.ok) {
      setErro(
        resultado.erro.tipo === 'rede'
          ? 'não consegui falar com o servidor — confira sua conexão'
          : resultado.erro.mensagem,
      )
      return
    }
    setMensagens((atual) => [...atual, { autor: 'cfo', texto: resultado.dados.resposta }])
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    perguntar(campo)
  }

  const semConversa = mensagens.length === 0

  return (
    <div className={styles.wrap}>
      {semConversa ? (
        <div className={styles.corpo}>
          <h1 className={styles.saudacao}>Converse com o seu CFO</h1>
          <p className={styles.subtitulo}>
            Pergunte qualquer coisa sobre o seu dinheiro. Nenhum número aqui é chutado.
          </p>
          <div className={styles.chips}>
            {SUGESTOES.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                className={styles.chip}
                disabled={enviando}
                onClick={() => perguntar(sugestao)}
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.corpo}>
          <ul className={styles.mensagens}>
            {mensagens.map((mensagem, indice) => (
              <li
                key={indice}
                className={
                  mensagem.autor === 'usuario' ? styles.mensagemUsuario : styles.mensagemCfo
                }
              >
                {mensagem.texto}
              </li>
            ))}
          </ul>
          {enviando && <p className={styles.digitando}>digitando…</p>}
        </div>
      )}

      {erro && <p className={styles.erro}>{erro}</p>}

      <form className={styles.entrada} onSubmit={aoEnviar}>
        <input
          type="text"
          className={styles.campo}
          placeholder="Pergunte ao seu CFO"
          aria-label="Pergunte ao seu CFO"
          value={campo}
          onChange={(evento) => setCampo(evento.target.value)}
          disabled={enviando}
        />
        <button type="submit" className={styles.enviar} aria-label="Enviar" disabled={enviando}>
          ↑
        </button>
      </form>
    </div>
  )
}
