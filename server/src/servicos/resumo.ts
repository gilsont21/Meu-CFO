import {
  calcularCategoriasDoMes,
  calcularCompromissosFuturos,
  calcularLivreParaGastar,
  calcularMediaDiaria,
  calcularTotalCompromissos,
  projeta,
} from '../../../src/domain/index.ts'
import * as recorrentesRepo from '../repositorios/recorrentes.ts'
import { listarEntre, listarDoMes, paraIso } from '../repositorios/transacoes.ts'

export interface ParametrosResumo {
  ano: number
  mes: number // 1-12
  dia: number // dia do mês considerado "hoje"
  /**
   * Saldo em conta hoje. Este MVP de servidor caseiro ainda não tem uma
   * entidade `account` (docs/02-modelo-de-dados.md é do plano de nuvem, com
   * Open Finance) — por ora o saldo vem informado pelo chamador.
   */
  saldoHoje: number
  cortePorDia?: number
  mesesReferencia?: number
}

/**
 * Monta o resumo financeiro do mês (projeção, ritmo e categorias) reusando
 * exclusivamente as funções puras de src/domain — o servidor só busca dados
 * no SQLite e monta os parâmetros, nunca recalcula a lógica financeira.
 */
export function montaResumo(params: ParametrosResumo) {
  const { ano, mes, dia, saldoHoje, cortePorDia = 0, mesesReferencia = 3 } = params

  const diasNoMes = new Date(ano, mes, 0).getDate()
  const transacoesDoMes = listarEntre(paraIso(ano, mes, 1), paraIso(ano, mes, dia))

  const janelaFim = new Date(ano, mes - 1, dia)
  const janelaInicio = new Date(janelaFim)
  janelaInicio.setDate(janelaInicio.getDate() - 29)
  const transacoesJanela30Dias = listarEntre(
    paraIso(janelaInicio.getFullYear(), janelaInicio.getMonth() + 1, janelaInicio.getDate()),
    paraIso(ano, mes, dia),
  )
  const mediaDiaria = calcularMediaDiaria(transacoesJanela30Dias)

  const mesesAnterioresParaMedia: ReturnType<typeof listarDoMes>[] = []
  for (let i = 1; i <= mesesReferencia; i++) {
    const dataReferencia = new Date(ano, mes - 1 - i, 1)
    mesesAnterioresParaMedia.push(
      listarDoMes(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1),
    )
  }

  const recorrentes = recorrentesRepo.listar()
  const compromissosFuturos = calcularCompromissosFuturos(recorrentes, dia)
  const totalCompromissos = calcularTotalCompromissos(compromissosFuturos)
  const diasRestantes = diasNoMes - dia
  const { livre, livrePorDia } = calcularLivreParaGastar(saldoHoje, totalCompromissos, diasRestantes)

  const projecao = projeta({
    transacoesDoMes,
    compromissosFuturos,
    saldoHoje,
    mediaDiaria,
    diaHoje: dia,
    diasNoMes,
    cortePorDia,
  })

  const categorias = calcularCategoriasDoMes(transacoesDoMes, mesesAnterioresParaMedia)

  return {
    ano,
    mes,
    dia,
    saldoHoje,
    mediaDiaria,
    livre,
    livrePorDia,
    compromissosFuturos,
    totalCompromissos,
    projecao,
    categorias,
  }
}

export type Resumo = ReturnType<typeof montaResumo>
