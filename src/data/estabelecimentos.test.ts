import { describe, expect, it } from 'vitest'
import { ESTABELECIMENTOS, PESOS_CATEGORIA, sorteiaCategoria } from './estabelecimentos'

describe('PESOS_CATEGORIA', () => {
  it('os pesos somam 1', () => {
    const soma = PESOS_CATEGORIA.reduce((s, [, peso]) => s + peso, 0)
    expect(soma).toBeCloseTo(1)
  })

  it('toda categoria sorteável tem estabelecimentos cadastrados', () => {
    for (const [categoria] of PESOS_CATEGORIA) {
      expect(ESTABELECIMENTOS[categoria].length).toBeGreaterThan(0)
    }
  })
})

describe('sorteiaCategoria', () => {
  it('caso de borda: sorteio no início da faixa cai na primeira categoria', () => {
    expect(sorteiaCategoria(() => 0)).toBe('comer_fora')
  })

  it('caso de borda: sorteio no fim da faixa cai na última categoria', () => {
    expect(sorteiaCategoria(() => 0.999999)).toBe('saude')
  })

  it('caso normal: sorteio no meio da faixa cai na categoria correspondente', () => {
    // comer_fora cobre até 0.34, transporte cobre de 0.34 até 0.60
    expect(sorteiaCategoria(() => 0.5)).toBe('transporte')
  })
})
