import { describe, expect, it } from 'vitest'
import { arredondaMoeda } from './numeros'

describe('arredondaMoeda', () => {
  it('corrige a imprecisão de ponto flutuante em somas de centavos', () => {
    expect(arredondaMoeda(0.1 + 0.2)).toBe(0.3)
  })

  it('arredonda para o centavo mais próximo', () => {
    expect(arredondaMoeda(10.005)).toBeCloseTo(10.01, 2)
    expect(arredondaMoeda(-178.4001)).toBe(-178.4)
  })
})
