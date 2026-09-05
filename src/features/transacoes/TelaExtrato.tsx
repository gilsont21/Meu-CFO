import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CATEGORIAS, CATEGORIAS_DE_GASTO } from '../../domain/categorias'
import { formatarMoeda } from '../../domain/numeros'
import type { CategoriaChave } from '../../domain/tipos'
import {
  criarTransacao,
  listarTransacoes,
  removerTransacao,
  type TransacaoDTO,
} from '../../servicos/api'
import layout from '../../ui/layout.module.css'
import styles from './TelaExtrato.module.css'

const CATEGORIAS_DO_FORMULARIO: CategoriaChave[] = [...CATEGORIAS_DE_GASTO, 'receita']

type Estado =
  | { situacao: 'carregando' }
  | { situacao: 'erro'; mensagem: string }
  | { situacao: 'pronto'; transacoes: TransacaoDTO[] }

function mesAtual(): { ano: number; mes: number } {
  const hoje = new Date()
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 }
}

function mensagemDoErro(erro: { tipo: 'rede' | 'servidor'; mensagem: string }): string {
  return erro.tipo === 'rede'
    ? 'não consegui falar com o servidor — confira sua conexão'
    : erro.mensagem
}

/** Extrato do mês corrente: lista real de transações, com formulário de lançamento manual. */
export function TelaExtrato() {
  const { ano, mes } = mesAtual()
  const [estado, setEstado] = useState<Estado>({ situacao: 'carregando' })
  const [enviando, setEnviando] = useState(false)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  const buscarEAtualizarLista = useCallback(() => {
    return listarTransacoes(ano, mes).then((resultado) => {
      if (!resultado.ok) {
        setEstado({ situacao: 'erro', mensagem: mensagemDoErro(resultado.erro) })
        return
      }
      setEstado({ situacao: 'pronto', transacoes: resultado.dados })
    })
  }, [ano, mes])

  useEffect(() => {
    buscarEAtualizarLista()
  }, [buscarEAtualizarLista])

  function carregar() {
    setEstado({ situacao: 'carregando' })
    buscarEAtualizarLista()
  }

  async function aoEnviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)

    setErroAcao(null)
    setEnviando(true)
    const resultado = await criarTransacao({
      data: String(dados.get('data') ?? ''),
      descricao: String(dados.get('descricao') ?? ''),
      valor: Number(dados.get('valor')),
      categoria: dados.get('categoria') as CategoriaChave,
    })
    setEnviando(false)

    if (!resultado.ok) {
      setErroAcao(mensagemDoErro(resultado.erro))
      return
    }

    formulario.reset()
    carregar()
  }

  async function aoRemover(id: string) {
    setErroAcao(null)
    const resultado = await removerTransacao(id)
    if (!resultado.ok) {
      setErroAcao(mensagemDoErro(resultado.erro))
      return
    }
    carregar()
  }

  return (
    <div className={styles.extrato}>
      <form className={styles.formulario} onSubmit={aoEnviarFormulario}>
        <input name="data" type="date" required aria-label="Data" />
        <input
          name="descricao"
          type="text"
          placeholder="Descrição"
          required
          aria-label="Descrição"
        />
        <input
          name="valor"
          type="number"
          step="0.01"
          placeholder="Valor (negativo p/ saída)"
          required
          aria-label="Valor"
        />
        <select name="categoria" required aria-label="Categoria" defaultValue="">
          <option value="" disabled>
            Categoria
          </option>
          {CATEGORIAS_DO_FORMULARIO.map((chave) => (
            <option key={chave} value={chave}>
              {CATEGORIAS[chave].nome}
            </option>
          ))}
        </select>
        <button type="submit" disabled={enviando}>
          {enviando ? 'salvando…' : 'adicionar'}
        </button>
      </form>

      {erroAcao && <p className={styles.erro}>{erroAcao}</p>}

      {estado.situacao === 'carregando' && <p className={layout.placeholder}>carregando…</p>}
      {estado.situacao === 'erro' && <p className={styles.erro}>{estado.mensagem}</p>}
      {estado.situacao === 'pronto' &&
        (estado.transacoes.length === 0 ? (
          <p className={layout.placeholder}>nenhuma transação neste mês ainda</p>
        ) : (
          <ul className={styles.lista}>
            {estado.transacoes.map((transacao) => (
              <li key={transacao.id} className={styles.item}>
                <span className={styles.data}>{transacao.data.slice(0, 10)}</span>
                <span className={styles.descricao}>{transacao.descricao}</span>
                <span className={styles.valor}>{formatarMoeda(transacao.valor)}</span>
                <button
                  type="button"
                  className={styles.remover}
                  aria-label={`Remover ${transacao.descricao}`}
                  onClick={() => aoRemover(transacao.id)}
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
