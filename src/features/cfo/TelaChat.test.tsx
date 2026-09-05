import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../../servicos/api'
import { TelaChat } from './TelaChat'

describe('TelaChat', () => {
  it('renderiza a saudação, os chips de sugestão e a caixa de entrada', () => {
    render(<TelaChat />)

    expect(screen.getByRole('heading', { name: 'Converse com o seu CFO' })).toBeInTheDocument()
    expect(screen.getByText('Onde eu mais gastei?')).toBeInTheDocument()
    expect(screen.getByLabelText('Pergunte ao seu CFO')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('envia a pergunta digitada para o servidor e mostra a resposta real', async () => {
    const enviarSpy = vi.spyOn(api, 'enviarPergunta').mockResolvedValue({
      ok: true,
      dados: { resposta: 'Você gastou mais em mercado.', modelo: true },
    })

    render(<TelaChat />)

    fireEvent.change(screen.getByLabelText('Pergunte ao seu CFO'), {
      target: { value: 'Onde eu mais gastei?' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Você gastou mais em mercado.')).toBeInTheDocument()
    expect(screen.getByText('Onde eu mais gastei?')).toBeInTheDocument()
    expect(enviarSpy).toHaveBeenCalledWith('Onde eu mais gastei?')
  })

  it('mostra mensagem de conexão quando o servidor não responde', async () => {
    vi.spyOn(api, 'enviarPergunta').mockResolvedValue({
      ok: false,
      erro: { tipo: 'rede', mensagem: 'falhou' },
    })

    render(<TelaChat />)

    fireEvent.change(screen.getByLabelText('Pergunte ao seu CFO'), { target: { value: 'oi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(/não consegui falar com o servidor/)).toBeInTheDocument()
  })

  it('envia a pergunta ao clicar em um chip de sugestão', async () => {
    const enviarSpy = vi
      .spyOn(api, 'enviarPergunta')
      .mockResolvedValue({ ok: true, dados: { resposta: 'Sim, com tranquilidade.', modelo: true } })

    render(<TelaChat />)
    fireEvent.click(screen.getByText('Posso pedir delivery hoje?'))

    expect(await screen.findByText('Sim, com tranquilidade.')).toBeInTheDocument()
    expect(enviarSpy).toHaveBeenCalledWith('Posso pedir delivery hoje?')
  })
})
