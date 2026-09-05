import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const OPCOES = [
  { id: 'a', rotulo: 'Opção A' },
  { id: 'b', rotulo: 'Opção B' },
] as const

describe('SegmentedControl', () => {
  it('caso normal: marca a opção selecionada e as demais não', () => {
    render(
      <SegmentedControl
        opcoes={[...OPCOES]}
        selecionado="a"
        onSelecionar={vi.fn()}
        ariaLabel="teste"
      />,
    )

    expect(screen.getByRole('tab', { name: 'Opção A' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Opção B' })).toHaveAttribute('aria-selected', 'false')
  })

  it('chama onSelecionar com o id da opção clicada', () => {
    const onSelecionar = vi.fn()
    render(
      <SegmentedControl
        opcoes={[...OPCOES]}
        selecionado="a"
        onSelecionar={onSelecionar}
        ariaLabel="teste"
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Opção B' }))
    expect(onSelecionar).toHaveBeenCalledWith('b')
  })
})
