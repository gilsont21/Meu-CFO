import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoApi, ResumoDTO } from '../../servicos/api'
import * as api from '../../servicos/api'
import { TelaHoje } from './TelaHoje'

const RESUMO_EXEMPLO: ResumoDTO = {
  ano: 2026,
  mes: 8,
  dia: 18,
  saldoHoje: 1200,
  mediaDiaria: 87,
  livre: 412,
  livrePorDia: 31.7,
  compromissosFuturos: [
    { dia: 25, descricao: 'Fatura', valor: 2980, categoria: 'compras', tipo: 'fatura' },
  ],
  totalCompromissos: 2980,
  projecao: [
    { dia: 1, saldo: 1200 },
    { dia: 31, saldo: -178.4 },
  ],
  categorias: [
    { chave: 'mercado', nome: 'Mercado', cor: '#2E7D5B', atual: 500, media: 420, delta: 0.19 },
  ],
}

describe('TelaHoje', () => {
  it('mostra um estado de carregamento antes da resposta do servidor', () => {
    vi.spyOn(api, 'buscarResumo').mockReturnValue(new Promise(() => {}))

    render(<TelaHoje />)

    expect(screen.getByRole('heading', { name: 'Como está o seu mês' })).toBeInTheDocument()
    expect(screen.getByText('carregando…')).toBeInTheDocument()
  })

  it('renderiza o veredito, os cartões e as categorias a partir do resumo real', async () => {
    vi.spyOn(api, 'buscarResumo').mockResolvedValue({ ok: true, dados: RESUMO_EXEMPLO })

    render(<TelaHoje />)

    expect(await screen.findByText(/fecha agosto/)).toBeInTheDocument()
    expect(screen.getByText(/no vermelho/)).toBeInTheDocument()
    expect(screen.getByText('livre para gastar')).toBeInTheDocument()
    expect(screen.getByText('ritmo de gasto')).toBeInTheDocument()
    expect(screen.getByText('próximo compromisso')).toBeInTheDocument()
    expect(screen.getByText('o que os agentes viram')).toBeInTheDocument()
    expect(screen.getByText('Para onde foi o dinheiro')).toBeInTheDocument()
    expect(screen.getByText('Mercado')).toBeInTheDocument()
  })

  it('mostra mensagem de conexão quando a chamada falha por erro de rede', async () => {
    const erro: ResultadoApi<ResumoDTO> = { ok: false, erro: { tipo: 'rede', mensagem: 'falhou' } }
    vi.spyOn(api, 'buscarResumo').mockResolvedValue(erro)

    render(<TelaHoje />)

    await waitFor(() => {
      expect(screen.getByText(/não consegui falar com o servidor/)).toBeInTheDocument()
    })
  })
})
