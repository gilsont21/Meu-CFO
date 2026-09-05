import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../../servicos/api'
import { TelaExtrato } from './TelaExtrato'

const TRANSACAO_EXEMPLO = {
  id: 'tx-1',
  data: '2026-08-10',
  descricao: 'Mercado do bairro',
  valor: -120.5,
  categoria: 'mercado' as const,
  recorrente: false,
  origem: 'manual' as const,
}

describe('TelaExtrato', () => {
  it('mostra estado de carregamento e depois a lista real de transações', async () => {
    vi.spyOn(api, 'listarTransacoes').mockResolvedValue({ ok: true, dados: [TRANSACAO_EXEMPLO] })

    render(<TelaExtrato />)

    expect(screen.getByText('carregando…')).toBeInTheDocument()
    expect(await screen.findByText('Mercado do bairro')).toBeInTheDocument()
  })

  it('mostra mensagem de conexão quando a listagem falha por erro de rede', async () => {
    vi.spyOn(api, 'listarTransacoes').mockResolvedValue({
      ok: false,
      erro: { tipo: 'rede', mensagem: 'falhou' },
    })

    render(<TelaExtrato />)

    expect(await screen.findByText(/não consegui falar com o servidor/)).toBeInTheDocument()
  })

  it('recarrega a lista do servidor após criar uma transação', async () => {
    vi.spyOn(api, 'listarTransacoes')
      .mockResolvedValueOnce({ ok: true, dados: [] })
      .mockResolvedValueOnce({ ok: true, dados: [TRANSACAO_EXEMPLO] })
    const criarSpy = vi
      .spyOn(api, 'criarTransacao')
      .mockResolvedValue({ ok: true, dados: TRANSACAO_EXEMPLO })

    render(<TelaExtrato />)
    expect(await screen.findByText('nenhuma transação neste mês ainda')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Mercado do bairro' } })
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '-120.5' } })
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'mercado' } })
    fireEvent.click(screen.getByRole('button', { name: 'adicionar' }))

    await waitFor(() =>
      expect(criarSpy).toHaveBeenCalledWith({
        data: '2026-08-10',
        descricao: 'Mercado do bairro',
        valor: -120.5,
        categoria: 'mercado',
      }),
    )
    expect(await screen.findByText('Mercado do bairro')).toBeInTheDocument()
    expect(api.listarTransacoes).toHaveBeenCalledTimes(2)
  })

  it('recarrega a lista do servidor após remover uma transação', async () => {
    vi.spyOn(api, 'listarTransacoes')
      .mockResolvedValueOnce({ ok: true, dados: [TRANSACAO_EXEMPLO] })
      .mockResolvedValueOnce({ ok: true, dados: [] })
    const removerSpy = vi
      .spyOn(api, 'removerTransacao')
      .mockResolvedValue({ ok: true, dados: undefined })

    render(<TelaExtrato />)
    expect(await screen.findByText('Mercado do bairro')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remover Mercado do bairro' }))

    await waitFor(() => expect(removerSpy).toHaveBeenCalledWith('tx-1'))
    expect(await screen.findByText('nenhuma transação neste mês ainda')).toBeInTheDocument()
  })
})
