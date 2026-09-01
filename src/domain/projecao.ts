import { arredondaMoeda } from './numeros'
import type { Compromisso, PontoProjecao, Transacao } from './tipos'

export interface ProjetaParams {
  /** Transações do mês sendo projetado, usadas para reconstruir o passado. */
  transacoesDoMes: Transacao[]
  /** Compromissos que ainda vão vencer, usados para descontar o futuro. */
  compromissosFuturos: Compromisso[]
  saldoHoje: number
  mediaDiaria: number
  diaHoje: number
  diasNoMes: number
  /** Quanto a pessoa está testando segurar por dia no gasto variável (alavanca da tela Hoje). */
  cortePorDia?: number
}

/**
 * Projeta o saldo dia a dia ao longo do mês: reconstrói o passado a partir do
 * saldo de hoje e das transações já realizadas, e projeta o futuro a partir
 * do ritmo de gasto e dos compromissos que ainda vão vencer.
 */
export function projeta(params: ProjetaParams): PontoProjecao[] {
  const {
    transacoesDoMes,
    compromissosFuturos,
    saldoHoje,
    mediaDiaria,
    diaHoje,
    diasNoMes,
    cortePorDia = 0,
  } = params

  const netDoDia = (dia: number): number =>
    transacoesDoMes.filter((t) => t.data.getDate() === dia).reduce((soma, t) => soma + t.valor, 0)

  const passado: PontoProjecao[] = [{ dia: diaHoje, saldo: saldoHoje }]
  let saldoPassado = saldoHoje
  for (let dia = diaHoje; dia > 1; dia--) {
    saldoPassado -= netDoDia(dia)
    passado.unshift({ dia: dia - 1, saldo: arredondaMoeda(saldoPassado) })
  }

  const futuro: PontoProjecao[] = []
  let saldoFuturo = saldoHoje
  for (let dia = diaHoje + 1; dia <= diasNoMes; dia++) {
    saldoFuturo -= Math.max(0, mediaDiaria - cortePorDia)
    const compromissosDoDia = compromissosFuturos
      .filter((c) => c.dia === dia)
      .reduce((soma, c) => soma + c.valor, 0)
    saldoFuturo -= compromissosDoDia
    futuro.push({ dia, saldo: arredondaMoeda(saldoFuturo) })
  }

  return [...passado, ...futuro]
}
