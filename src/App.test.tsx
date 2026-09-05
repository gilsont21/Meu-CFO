import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('abre em Hoje por padrão', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Como está o seu mês' })).toBeInTheDocument()
  })

  it.each([
    ['Visão geral', 'Como você está indo ao longo do tempo'],
    ['Transações', 'Transações'],
    ['Metas', 'Metas e objetivos'],
    ['Agentes', 'Agentes'],
    ['CFO', 'Converse com o seu CFO'],
  ])('navega para %s ao clicar no item do rail', (itemRail, tituloEsperado) => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: itemRail }))
    expect(screen.getByRole('heading', { name: tituloEsperado })).toBeInTheDocument()
  })

  it('abre a Ajuda ao clicar no ícone de Ajuda, no lugar do conteúdo principal', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    expect(screen.getByRole('heading', { name: 'Aproveite melhor o Meu CFO' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Como está o seu mês' })).not.toBeInTheDocument()
  })

  it('fecha a Ajuda e volta a mostrar a tela em que o usuário estava', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Metas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    fireEvent.click(screen.getByRole('button', { name: /fechar/ }))

    expect(screen.getByRole('heading', { name: 'Metas e objetivos' })).toBeInTheDocument()
  })

  it('navegar para outro item do rail fecha a Ajuda automaticamente', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    fireEvent.click(screen.getByRole('button', { name: 'Agentes' }))

    expect(screen.getByRole('heading', { name: 'Agentes' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Aproveite melhor o Meu CFO' }),
    ).not.toBeInTheDocument()
  })
})
