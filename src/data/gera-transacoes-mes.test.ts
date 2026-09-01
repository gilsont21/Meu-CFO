import { describe, expect, it } from 'vitest'
import { geraTransacoesMes } from './gera-transacoes-mes'

describe('geraTransacoesMes', () => {
  it('caso normal: a mesma seed produz sempre o mesmo resultado', () => {
    const params = { ano: 2026, mes: 7, ateDia: 18, seed: 20260818 }
    expect(geraTransacoesMes(params)).toEqual(geraTransacoesMes(params))
  })

  it('seeds diferentes produzem resultados diferentes', () => {
    const a = geraTransacoesMes({ ano: 2026, mes: 7, ateDia: 18, seed: 1 })
    const b = geraTransacoesMes({ ano: 2026, mes: 7, ateDia: 18, seed: 2 })
    expect(a).not.toEqual(b)
  })

  it('o total de transações geradas é consistente com o número de dias pedido', () => {
    const ateDia = 18
    const transacoes = geraTransacoesMes({ ano: 2026, mes: 7, ateDia, seed: 42 })
    const variaveis = transacoes.filter((t) => !t.recorrente)

    // geraTransacoesMes soma 1 a 3 transações variáveis por dia gerado.
    expect(variaveis.length).toBeGreaterThanOrEqual(ateDia)
    expect(variaveis.length).toBeLessThanOrEqual(ateDia * 3)
    for (const t of transacoes) {
      expect(t.data.getDate()).toBeLessThanOrEqual(ateDia)
    }
  })

  it('caso de borda: ateDia = 0 não gera nenhuma transação', () => {
    expect(geraTransacoesMes({ ano: 2026, mes: 7, ateDia: 0, seed: 1 })).toEqual([])
  })

  it('as transações geradas usam o ano e o mês informados', () => {
    const transacoes = geraTransacoesMes({ ano: 2025, mes: 3, ateDia: 5, seed: 7 })
    expect(transacoes.length).toBeGreaterThan(0)
    for (const t of transacoes) {
      expect(t.data.getFullYear()).toBe(2025)
      expect(t.data.getMonth()).toBe(3)
    }
  })

  it('inclui os compromissos recorrentes que já venceram até ateDia, e só esses', () => {
    const transacoes = geraTransacoesMes({ ano: 2026, mes: 7, ateDia: 20, seed: 1 })
    const recorrentes = transacoes.filter((t) => t.recorrente)
    // Até o dia 20: Salário (5), Aluguel (5), Conta de luz (8), Plano de celular (10), Academia (15), Netflix (20).
    expect(recorrentes).toHaveLength(6)
    expect(recorrentes.every((t) => t.origem === 'synthetic')).toBe(true)
  })
})
