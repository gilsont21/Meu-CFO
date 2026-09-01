import { arredondaMoeda } from './numeros'
import type { Transacao } from './tipos'

const JANELA_PADRAO_DIAS = 30

/**
 * Ritmo de gasto variável: soma o valor absoluto das transações não
 * recorrentes recebidas e divide pela janela de dias informada. O chamador
 * é responsável por passar a janela de transações certa (ex.: os últimos 30
 * dias, cruzando mês atual e anterior), já que essa reconstrução depende de
 * como os dados estão organizados fora do domínio.
 */
export function calcularMediaDiaria(
  transacoesVariaveis: Transacao[],
  janelaDias: number = JANELA_PADRAO_DIAS,
): number {
  const gastoTotal = transacoesVariaveis
    .filter((t) => !t.recorrente)
    .reduce((soma, t) => soma + Math.abs(t.valor), 0)
  return arredondaMoeda(gastoTotal / janelaDias)
}

export interface LivreParaGastar {
  /** Quanto ainda pode ser gasto até o fim do período, depois de reservar os compromissos. */
  livre: number
  /** `livre` dividido pelos dias restantes; 0 quando não há dias restantes. */
  livrePorDia: number
}

export function calcularLivreParaGastar(
  saldoHoje: number,
  totalCompromissos: number,
  diasRestantes: number,
): LivreParaGastar {
  const livre = arredondaMoeda(saldoHoje - totalCompromissos)
  const livrePorDia = diasRestantes > 0 ? arredondaMoeda(livre / diasRestantes) : 0
  return { livre, livrePorDia }
}
