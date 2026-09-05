import { describe, expect, it } from 'vitest'
import { arredondaMoeda, formatarMoeda } from './numeros'

describe('arredondaMoeda', () => {
  it('corrige a imprecisão de ponto flutuante em somas de centavos', () => {
    expect(arredondaMoeda(0.1 + 0.2)).toBe(0.3)
  })

  it('arredonda para o centavo mais próximo', () => {
    expect(arredondaMoeda(10.005)).toBeCloseTo(10.01, 2)
    expect(arredondaMoeda(-178.4001)).toBe(-178.4)
  })
})

describe('formatarMoeda', () => {
  it('formata em reais com separador de milhar e vírgula decimal', () => {
    expect(formatarMoeda(1234.5)).toBe('R$ 1.234,50')
  })

  it('mantém o sinal de negativo para valores no vermelho', () => {
    expect(formatarMoeda(-178.4)).toBe('-R$ 178,40')
  })
})
