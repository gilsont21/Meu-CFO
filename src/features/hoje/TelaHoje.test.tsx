import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaHoje } from './TelaHoje'

describe('TelaHoje', () => {
  it('renderiza o título, o veredito do mês e os cartões de apoio', () => {
    render(<TelaHoje />)

    expect(screen.getByRole('heading', { name: 'Como está o seu mês' })).toBeInTheDocument()
    expect(screen.getByText(/fecha agosto/)).toBeInTheDocument()
    expect(screen.getByText('livre para gastar')).toBeInTheDocument()
    expect(screen.getByText('ritmo de gasto')).toBeInTheDocument()
    expect(screen.getByText('próximo compromisso')).toBeInTheDocument()
    expect(screen.getByText('o que os agentes viram')).toBeInTheDocument()
    expect(screen.getByText('Para onde foi o dinheiro')).toBeInTheDocument()
  })
})
