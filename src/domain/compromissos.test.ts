import { describe, expect, it } from 'vitest'
import { calcularCompromissosFuturos, calcularTotalCompromissos } from './compromissos'
import type { CompromissoRecorrente } from './tipos'

const RECORRENTES: CompromissoRecorrente[] = [
  { dia: 5, descricao: 'Salário', valor: 7400, categoria: 'receita', tipo: 'entrada' },
  { dia: 5, descricao: 'Aluguel', valor: -1850, categoria: 'moradia', tipo: 'fixo' },
  { dia: 20, descricao: 'Netflix', valor: -44.9, categoria: 'assinaturas', tipo: 'assinatura' },
  { dia: 25, descricao: 'Fatura do cartão', valor: -2980, categoria: 'compras', tipo: 'fatura' },
]

describe('calcularCompromissosFuturos', () => {
  it('caso normal: mantém só saídas futuras a hoje, com valor em módulo', () => {
    const compromissos = calcularCompromissosFuturos(RECORRENTES, 18)
    expect(compromissos).toEqual([
      { dia: 20, descricao: 'Netflix', valor: 44.9, categoria: 'assinaturas', tipo: 'assinatura' },
      {
        dia: 25,
        descricao: 'Fatura do cartão',
        valor: 2980,
        categoria: 'compras',
        tipo: 'fatura',
      },
    ])
  })

  it('caso de borda: hoje é o último dia com compromisso, não sobra nenhum', () => {
    expect(calcularCompromissosFuturos(RECORRENTES, 25)).toEqual([])
  })

  it('caso de borda: lista de recorrentes vazia', () => {
    expect(calcularCompromissosFuturos([], 1)).toEqual([])
  })
})

describe('calcularTotalCompromissos', () => {
  it('soma o valor (já em módulo) dos compromissos futuros', () => {
    const compromissos = calcularCompromissosFuturos(RECORRENTES, 18)
    expect(calcularTotalCompromissos(compromissos)).toBe(3024.9)
  })

  it('caso de borda: sem compromissos, o total é 0', () => {
    expect(calcularTotalCompromissos([])).toBe(0)
  })
})
