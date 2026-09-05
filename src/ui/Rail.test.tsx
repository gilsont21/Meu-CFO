import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Rail } from './Rail'

describe('Rail', () => {
  it('caso normal: marca o item atual como ativo e não mostra rótulos antes de expandir', () => {
    render(<Rail atual="hoje" ajudaAberta={false} onNavegar={vi.fn()} onAjudaClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Transações')).not.toBeInTheDocument()
  })

  it('expande ao passar o mouse, revelando os rótulos, e recolhe ao tirar o mouse', () => {
    render(<Rail atual="hoje" ajudaAberta={false} onNavegar={vi.fn()} onAjudaClick={vi.fn()} />)

    fireEvent.mouseEnter(screen.getByRole('navigation'))
    expect(screen.getByText('Transações')).toBeInTheDocument()

    fireEvent.mouseLeave(screen.getByRole('navigation'))
    expect(screen.queryByText('Transações')).not.toBeInTheDocument()
  })

  it('chama onNavegar com o id do item clicado', () => {
    const onNavegar = vi.fn()
    render(<Rail atual="hoje" ajudaAberta={false} onNavegar={onNavegar} onAjudaClick={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Metas' }))
    expect(onNavegar).toHaveBeenCalledWith('metas')
  })

  it('chama onAjudaClick ao clicar no ícone de Ajuda, distinto dos itens principais', () => {
    const onAjudaClick = vi.fn()
    render(
      <Rail atual="hoje" ajudaAberta={false} onNavegar={vi.fn()} onAjudaClick={onAjudaClick} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ajuda' }))
    expect(onAjudaClick).toHaveBeenCalledTimes(1)
  })

  it('caso de borda: com a ajuda aberta, nenhum item principal fica marcado como ativo', () => {
    render(<Rail atual="hoje" ajudaAberta={true} onNavegar={vi.fn()} onAjudaClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Hoje' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: 'Ajuda' })).toHaveAttribute('aria-current', 'page')
  })
})
