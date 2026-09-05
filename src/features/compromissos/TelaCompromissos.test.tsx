import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TelaCompromissos } from './TelaCompromissos'

describe('TelaCompromissos', () => {
  it('renderiza o placeholder de compromissos futuros', () => {
    render(<TelaCompromissos />)
    expect(screen.getByText(/compromissos futuros/)).toBeInTheDocument()
  })
})
