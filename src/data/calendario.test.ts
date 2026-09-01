import { describe, expect, it } from 'vitest'
import { calcularCalendarioDoMes } from './calendario'

describe('calcularCalendarioDoMes', () => {
  it('caso normal: deriva ano, mês, dia de hoje e dias do mês a partir da data informada', () => {
    expect(calcularCalendarioDoMes(new Date(2026, 7, 18))).toEqual({
      ano: 2026,
      mes: 7,
      diaHoje: 18,
      diasNoMes: 31,
    })
  })

  it('datas diferentes produzem calendários diferentes', () => {
    const agosto = calcularCalendarioDoMes(new Date(2026, 7, 18))
    const fevereiro = calcularCalendarioDoMes(new Date(2026, 1, 10))
    expect(fevereiro).toEqual({ ano: 2026, mes: 1, diaHoje: 10, diasNoMes: 28 })
    expect(fevereiro).not.toEqual(agosto)
  })

  it('caso de borda: sem argumento, usa a data atual do sistema', () => {
    const agora = new Date()
    const calendario = calcularCalendarioDoMes()
    expect(calendario.ano).toBe(agora.getFullYear())
    expect(calendario.mes).toBe(agora.getMonth())
    expect(calendario.diaHoje).toBe(agora.getDate())
  })
})
