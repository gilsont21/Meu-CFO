import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaMetas } from './TelaMetas'

describe('TelaMetas', () => {
  it('renderiza o título, as metas de exemplo com o progresso calculado, e o cartão de nova meta', () => {
    render(<TelaMetas />)

    expect(screen.getByRole('heading', { name: 'Metas e objetivos' })).toBeInTheDocument()
    expect(screen.getByText('Reserva de emergência')).toBeInTheDocument()
    expect(screen.getByText('Viagem para o Chile')).toBeInTheDocument()
    expect(screen.getByText('Troca de notebook')).toBeInTheDocument()
    // 6200 / 15000 = 41.33% arredondado para 41%
    expect(screen.getByText('41%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Nova meta' })).toBeInTheDocument()
  })
})
