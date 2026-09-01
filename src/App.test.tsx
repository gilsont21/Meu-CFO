import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('renderiza a saudação inicial', () => {
    render(<App />)
    expect(screen.getByText('Hello, Meu CFO')).toBeInTheDocument()
  })
})
