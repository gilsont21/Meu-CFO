import { describe, expect, it } from 'vitest'
import { calcularCategoriasDoMes } from './categorias-do-mes'
import type { CategoriaChave, Transacao } from './tipos'

function tx(categoria: CategoriaChave, valor: number): Transacao {
  return {
    id: `tx-${categoria}-${valor}`,
    data: new Date(2026, 7, 10),
    descricao: 'transação de teste',
    valor,
    categoria,
    recorrente: false,
    origem: 'synthetic',
  }
}

describe('calcularCategoriasDoMes', () => {
  it('caso normal: agrega por categoria, compara com a média e ordena da maior para a menor', () => {
    const mesAtual = [tx('mercado', -300), tx('lazer', -100), tx('lazer', -50)]
    const mesAnterior1 = [tx('mercado', -200), tx('lazer', -100)]
    const mesAnterior2 = [tx('mercado', -200), tx('lazer', -50)]

    const resumo = calcularCategoriasDoMes(mesAtual, [mesAnterior1, mesAnterior2])

    expect(resumo.map((c) => c.chave)).toEqual(['mercado', 'lazer'])

    const mercado = resumo.find((c) => c.chave === 'mercado')!
    expect(mercado.atual).toBe(300)
    expect(mercado.media).toBe(200)
    expect(mercado.delta).toBeCloseTo(0.5, 5) // 50% acima da média

    const lazer = resumo.find((c) => c.chave === 'lazer')!
    expect(lazer.atual).toBe(150)
    expect(lazer.media).toBe(75)
    expect(lazer.delta).toBeCloseTo(1, 5) // dobrou frente à média
  })

  it('categoria sem nenhum gasto no mês atual não aparece no resultado (mês "negativo" para ela)', () => {
    const mesAtual = [tx('mercado', -100)]
    const resumo = calcularCategoriasDoMes(mesAtual, [])
    expect(resumo.some((c) => c.chave === 'saude')).toBe(false)
  })

  it('caso de borda: lista de transações do mês vazia não gera categorias', () => {
    expect(calcularCategoriasDoMes([], [])).toEqual([])
  })

  it('caso de borda: sem meses anteriores para média, delta fica em 0 mesmo com gasto', () => {
    const resumo = calcularCategoriasDoMes([tx('transporte', -80)], [])
    const transporte = resumo.find((c) => c.chave === 'transporte')!
    expect(transporte.media).toBe(0)
    expect(transporte.delta).toBe(0)
  })
})
