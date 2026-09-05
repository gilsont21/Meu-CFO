import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaVisaoGeral } from './TelaVisaoGeral'

describe('TelaVisaoGeral', () => {
  it('renderiza o título, os cartões de tendência e os blocos de gráfico e ranking', () => {
    render(<TelaVisaoGeral />)

    expect(
      screen.getByRole('heading', { name: 'Como você está indo ao longo do tempo' }),
    ).toBeInTheDocument()
    expect(screen.getByText('patrimônio líquido')).toBeInTheDocument()
    expect(screen.getByText('taxa de poupança')).toBeInTheDocument()
    expect(screen.getByText('mês mais apertado')).toBeInTheDocument()
    expect(screen.getByText('Entradas x saídas por mês')).toBeInTheDocument()
    expect(screen.getByText('Categorias que mais cresceram')).toBeInTheDocument()
  })
})
