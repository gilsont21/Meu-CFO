import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../../servicos/api'
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

    fireEvent.click(screen.getByRole('tab', { name: 'Categorias' }))
    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('conteúdo de “Categorias”')).toBeInTheDocument()
  })

  it('mostra a tela de Compromissos ao selecionar o segmento Compromissos', () => {
    render(<TelaTransacoes />)

    fireEvent.click(screen.getByRole('tab', { name: 'Compromissos' }))
    expect(screen.getByText(/compromissos futuros/)).toBeInTheDocument()
  })

  it('lista as transações reais do servidor ao selecionar o segmento Extrato', async () => {
    vi.spyOn(api, 'listarTransacoes').mockResolvedValue({
      ok: true,
      dados: [
        {
          id: 'tx-1',
          data: '2026-08-10',
          descricao: 'Mercado do bairro',
          valor: -120.5,
          categoria: 'mercado',
          recorrente: false,
          origem: 'manual',
        },
      ],
    })

    render(<TelaTransacoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Extrato' }))

    expect(await screen.findByText('Mercado do bairro')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover Mercado do bairro' })).toBeInTheDocument()
  })
})
