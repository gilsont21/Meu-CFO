import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaAgentes } from './TelaAgentes'

describe('TelaAgentes', () => {
  it('renderiza o título, os 5 agentes de exemplo com status, e o cartão de criar agente', () => {
    render(<TelaAgentes />)

    expect(screen.getByRole('heading', { name: 'Agentes' })).toBeInTheDocument()
    expect(screen.getByText('Vigia de gastos')).toBeInTheDocument()
    expect(screen.getByText('Comer fora 28% acima da média')).toBeInTheDocument()
    expect(screen.getAllByText('ativo')).toHaveLength(3)
    expect(screen.getByText('inativo')).toBeInTheDocument()
    expect(screen.getByText('sob demanda')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Criar agente personalizado' })).toBeInTheDocument()
  })
})
