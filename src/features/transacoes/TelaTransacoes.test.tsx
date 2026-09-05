import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaTransacoes } from './TelaTransacoes'

describe('TelaTransacoes', () => {
  it('renderiza o título, os 5 segmentos, e "Visão geral" como segmento inicial', () => {
    render(<TelaTransacoes />)

    expect(screen.getByRole('heading', { name: 'Transações' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Visão geral' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    ;['Extrato', 'Compromissos', 'Assinaturas', 'Categorias'].forEach((rotulo) => {
      expect(screen.getByRole('tab', { name: rotulo })).toBeInTheDocument()
    })
    expect(screen.getByText('conteúdo de “Visão geral”')).toBeInTheDocument()
  })

  it('troca o conteúdo ao selecionar outro segmento', () => {
    render(<TelaTransacoes />)

    fireEvent.click(screen.getByRole('tab', { name: 'Extrato' }))
    expect(screen.getByRole('tab', { name: 'Extrato' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('conteúdo de “Extrato”')).toBeInTheDocument()
  })

  it('mostra a tela de Compromissos ao selecionar o segmento Compromissos', () => {
    render(<TelaTransacoes />)

    fireEvent.click(screen.getByRole('tab', { name: 'Compromissos' }))
    expect(screen.getByText(/compromissos futuros/)).toBeInTheDocument()
  })
})
