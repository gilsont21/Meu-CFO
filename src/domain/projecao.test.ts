import { describe, expect, it } from 'vitest'
import { projeta } from './projecao'
import type { Compromisso, Transacao } from './tipos'

function tx(dia: number, valor: number): Transacao {
  return {
    id: `tx-dia${dia}`,
    data: new Date(2026, 7, dia),
    descricao: 'transação de teste',
    valor,
    categoria: 'compras',
    recorrente: false,
    origem: 'synthetic',
  }
}

function compromisso(dia: number, valor: number): Compromisso {
  return { dia, descricao: 'compromisso de teste', valor, categoria: 'moradia', tipo: 'fixo' }
}

describe('projeta', () => {
  it('caso normal: reconstrói o passado e projeta o futuro dia a dia', () => {
    const pontos = projeta({
      transacoesDoMes: [tx(2, -20), tx(3, -5)],
      compromissosFuturos: [compromisso(5, 15)],
      saldoHoje: 100,
      mediaDiaria: 10,
      diaHoje: 3,
      diasNoMes: 5,
    })

    expect(pontos).toEqual([
      { dia: 1, saldo: 125 },
      { dia: 2, saldo: 105 },
      { dia: 3, saldo: 100 },
      { dia: 4, saldo: 90 },
      { dia: 5, saldo: 65 },
    ])
  })

  it('mês fecha negativo: o ritmo e os compromissos futuros consomem o saldo', () => {
    const pontos = projeta({
      transacoesDoMes: [],
      compromissosFuturos: [compromisso(3, 80)],
      saldoHoje: 100,
      mediaDiaria: 50,
      diaHoje: 2,
      diasNoMes: 3,
    })

    expect(pontos).toEqual([
      { dia: 1, saldo: 100 },
      { dia: 2, saldo: 100 },
      { dia: 3, saldo: -30 },
    ])
    expect(pontos[pontos.length - 1].saldo).toBeLessThan(0)
  })

  it('caso de borda: dia 1 do mês não tem passado para reconstruir', () => {
    const pontos = projeta({
      transacoesDoMes: [tx(1, -999)], // não deve afetar o passado: já é o primeiro dia
      compromissosFuturos: [],
      saldoHoje: 200,
      mediaDiaria: 20,
      diaHoje: 1,
      diasNoMes: 3,
    })

    expect(pontos).toEqual([
      { dia: 1, saldo: 200 },
      { dia: 2, saldo: 180 },
      { dia: 3, saldo: 160 },
    ])
  })

  it('caso de borda: lista de transações vazia mantém o passado igual ao saldo de hoje', () => {
    const pontos = projeta({
      transacoesDoMes: [],
      compromissosFuturos: [],
      saldoHoje: 50,
      mediaDiaria: 5,
      diaHoje: 4,
      diasNoMes: 4,
    })

    expect(pontos).toEqual([
      { dia: 1, saldo: 50 },
      { dia: 2, saldo: 50 },
      { dia: 3, saldo: 50 },
      { dia: 4, saldo: 50 },
    ])
  })

  it('a alavanca de corte por dia reduz o consumo do saldo futuro', () => {
    const semCorte = projeta({
      transacoesDoMes: [],
      compromissosFuturos: [],
      saldoHoje: 100,
      mediaDiaria: 20,
      diaHoje: 1,
      diasNoMes: 2,
    })
    const comCorte = projeta({
      transacoesDoMes: [],
      compromissosFuturos: [],
      saldoHoje: 100,
      mediaDiaria: 20,
      diaHoje: 1,
      diasNoMes: 2,
      cortePorDia: 15,
    })

    expect(semCorte[1].saldo).toBe(80)
    expect(comCorte[1].saldo).toBe(95)
  })
})
