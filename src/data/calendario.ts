export interface CalendarioMes {
  ano: number
  mes: number
  diaHoje: number
  diasNoMes: number
}

/**
 * Deriva o calendário do mês corrente a partir de uma data de referência.
 * Recebe `hoje` como parâmetro, com valor padrão `new Date()`, em vez de
 * depender de uma constante fixa: em produção o sistema usa a data real
 * automaticamente, e em testes e demonstrações dá para fixar um cenário
 * específico passando a data desejada.
 */
export function calcularCalendarioDoMes(hoje: Date = new Date()): CalendarioMes {
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const diaHoje = hoje.getDate()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  return { ano, mes, diaHoje, diasNoMes }
}
