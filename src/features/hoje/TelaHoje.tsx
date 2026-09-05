import { useEffect, useState } from 'react'
import { formatarMoeda } from '../../domain/numeros'
import { buscarResumo, type ResumoDTO } from '../../servicos/api'
import { Cabecalho, Cartao } from '../../ui'
import layout from '../../ui/layout.module.css'
import styles from './TelaHoje.module.css'

const NOMES_DOS_MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

type Estado =
  | { situacao: 'carregando' }
  | { situacao: 'erro'; mensagem: string }
  | { situacao: 'pronto'; resumo: ResumoDTO }

function montaVeredito(resumo: ResumoDTO): string {
  const nomeMes = NOMES_DOS_MESES[resumo.mes - 1]
  const saldoFinal = resumo.projecao.at(-1)?.saldo ?? resumo.saldoHoje
  if (saldoFinal >= 0) {
    return `Do jeito que está, você fecha ${nomeMes} com ${formatarMoeda(saldoFinal)} sobrando.`
  }
  return `Do jeito que está, você fecha ${nomeMes} ${formatarMoeda(Math.abs(saldoFinal))} no vermelho.`
}

function montaCartoes(resumo: ResumoDTO) {
  const diasNoMes = new Date(resumo.ano, resumo.mes, 0).getDate()
  const diasRestantes = diasNoMes - resumo.dia
  const proximoCompromisso = [...resumo.compromissosFuturos].sort((a, b) => a.dia - b.dia)[0]

  return [
    {
      rotulo: 'livre para gastar',
      valor: formatarMoeda(resumo.livre),
      nota: `${diasRestantes} dias restantes`,
      link: 'ver detalhes',
    },
    {
      rotulo: 'ritmo de gasto',
      valor: `${formatarMoeda(resumo.mediaDiaria)}/dia`,
      nota: 'média dos últimos 30 dias',
      link: 'ver categorias',
    },
    {
      rotulo: 'próximo compromisso',
      valor: proximoCompromisso
        ? `${proximoCompromisso.descricao} · dia ${proximoCompromisso.dia}`
        : 'nenhum',
      nota: proximoCompromisso ? formatarMoeda(proximoCompromisso.valor) : 'nada agendado',
      link: 'ver todos',
    },
    {
      rotulo: 'o que os agentes viram',
      valor: '—',
      nota: 'ainda sem achados',
      link: 'ver agentes',
    },
  ]
}

/** Veredito do mês corrente: frase, projeção de saldo e alavanca de corte por dia. */
export function TelaHoje() {
  const [estado, setEstado] = useState<Estado>({ situacao: 'carregando' })

  useEffect(() => {
    let cancelado = false

    buscarResumo().then((resultado) => {
      if (cancelado) return
      if (!resultado.ok) {
        const mensagem =
          resultado.erro.tipo === 'rede'
            ? 'não consegui falar com o servidor — confira sua conexão'
            : resultado.erro.mensagem
        setEstado({ situacao: 'erro', mensagem })
        return
      }
      setEstado({ situacao: 'pronto', resumo: resultado.dados })
    })

    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div>
      <Cabecalho eyebrow="hoje" titulo="Como está o seu mês" />

      <section className={`${layout.card} ${styles.hero}`}>
        <div className={styles.rotuloHero}>veredito do mês</div>
        {estado.situacao === 'carregando' && <p className={styles.frase}>carregando…</p>}
        {estado.situacao === 'erro' && <p className={styles.frase}>{estado.mensagem}</p>}
        {estado.situacao === 'pronto' && (
          <p className={styles.frase}>{montaVeredito(estado.resumo)}</p>
        )}
        <div
          className={styles.espacoGrafico}
          role="img"
          aria-label="Gráfico de projeção de saldo ao longo do mês"
        >
          gráfico de projeção — linha cheia até hoje, tracejada depois
        </div>
        <div className={styles.espacoAlavanca}>alavanca: segurar R$ ___ por dia</div>
      </section>

      {estado.situacao === 'pronto' && (
        <>
          <div className={layout.grid}>
            {montaCartoes(estado.resumo).map((cartao) => (
              <Cartao key={cartao.rotulo} {...cartao} />
            ))}
          </div>

          <h2 className={layout.blocoTitulo}>Para onde foi o dinheiro</h2>
          <div className={layout.card}>
            {estado.resumo.categorias.length === 0 ? (
              <p className={layout.placeholder}>nenhum gasto categorizado neste mês ainda</p>
            ) : (
              <ul className={styles.listaCategorias}>
                {estado.resumo.categorias.map((categoria) => (
                  <li key={categoria.chave} className={styles.itemCategoria}>
                    <span>{categoria.nome}</span>
                    <span>{formatarMoeda(categoria.atual)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
