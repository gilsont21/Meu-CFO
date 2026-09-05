import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaChat } from './TelaChat'

describe('TelaChat', () => {
  it('renderiza a saudação, os chips de sugestão e a caixa de entrada', () => {
    render(<TelaChat />)

    expect(screen.getByRole('heading', { name: 'Converse com o seu CFO' })).toBeInTheDocument()
    expect(screen.getByText('Onde eu mais gastei?')).toBeInTheDocument()
    expect(screen.getByLabelText('Pergunte ao seu CFO')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })
})
