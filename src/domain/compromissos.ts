import { arredondaMoeda } from './numeros'
import type { Compromisso, CompromissoRecorrente } from './tipos'

/**
 * Seleciona, entre os itens recorrentes cadastrados, os que ainda vão sair da
 * conta neste mês — dia posterior a hoje e valor de saída — e devolve o
 * valor em módulo, pronto para exibição.
 */
export function calcularCompromissosFuturos(
  recorrentes: CompromissoRecorrente[],
  diaHoje: number,
): Compromisso[] {
  return recorrentes
    .filter((r) => r.dia > diaHoje && r.valor < 0)
    .map((r) => ({ ...r, valor: Math.abs(r.valor) }))
}

export function calcularTotalCompromissos(compromissos: Compromisso[]): number {
  return arredondaMoeda(compromissos.reduce((soma, c) => soma + c.valor, 0))
}
