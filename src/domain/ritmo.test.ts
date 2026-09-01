import { describe, expect, it } from 'vitest'
import { calcularLivreParaGastar, calcularMediaDiaria } from './ritmo'
import type { Transacao } from './tipos'

function tx(valor: number, recorrente = false): Transacao {
  return {
    id: `tx-${valor}-${recorrente}`,
    data: new Date(2026, 7, 10),
    descricao: 'transação de teste',
    valor,
    categoria: 'compras',
    recorrente,
    origem: 'synthetic',
  }
}

describe('calcularMediaDiaria', () => {
  it('soma apenas as transações não recorrentes e divide pela janela', () => {
    const transacoes = [tx(-100), tx(-50), tx(-9999, true)]
    expect(calcularMediaDiaria(transacoes, 30)).toBe(5) // (100 + 50) / 30 = 5
  })

  it('retorna 0 quando não há transações (lista vazia)', () => {
    expect(calcularMediaDiaria([], 30)).toBe(0)
  })
})

describe('calcularLivreParaGastar', () => {
  it('caso normal: saldo positivo folgado', () => {
    const { livre, livrePorDia } = calcularLivreParaGastar(5000, 2000, 10)
    expect(livre).toBe(3000)
    expect(livrePorDia).toBe(300)
  })

  it('mês fecha negativo: compromissos superam o saldo de hoje', () => {
    const { livre, livrePorDia } = calcularLivreParaGastar(1000, 2000, 10)
    expect(livre).toBe(-1000)
    expect(livrePorDia).toBe(-100)
  })

  it('caso de borda: sem dias restantes, não divide por zero', () => {
    const { livre, livrePorDia } = calcularLivreParaGastar(1000, 400, 0)
    expect(livre).toBe(600)
    expect(livrePorDia).toBe(0)
  })
})
