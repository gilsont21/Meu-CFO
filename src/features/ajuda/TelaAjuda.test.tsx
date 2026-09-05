import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TelaAjuda } from './TelaAjuda'

describe('TelaAjuda', () => {
  it('abre na seção "Como conversar com o CFO" por padrão', () => {
    render(<TelaAjuda onFechar={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Aproveite melhor o Meu CFO' })).toBeInTheDocument()
    expect(screen.getByText('Seja específico sobre o recorte')).toBeInTheDocument()
  })

  it('troca para a seção "Como criar um agente"', () => {
    render(<TelaAjuda onFechar={vi.fn()} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Como criar um agente' }))
    expect(screen.getByText('1. Diga o que você quer acompanhar')).toBeInTheDocument()
  })

  it('troca para "Trilhas por objetivo" e lista as 4 trilhas', () => {
    render(<TelaAjuda onFechar={vi.fn()} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Trilhas por objetivo' }))
    expect(screen.getByText('Sair do vermelho')).toBeInTheDocument()
    expect(screen.getByText('Planejar uma compra grande')).toBeInTheDocument()
    expect(screen.getByText('Criar uma reserva de emergência')).toBeInTheDocument()
    expect(screen.getByText('Entender para onde vai seu dinheiro')).toBeInTheDocument()
  })

  it('chama onFechar ao clicar em fechar', () => {
    const onFechar = vi.fn()
    render(<TelaAjuda onFechar={onFechar} />)

    fireEvent.click(screen.getByRole('button', { name: /fechar/ }))
    expect(onFechar).toHaveBeenCalledTimes(1)
  })
})
