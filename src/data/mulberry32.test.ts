import { describe, expect, it } from 'vitest'
import { mulberry32 } from './mulberry32'

describe('mulberry32', () => {
  it('caso normal: a mesma seed produz sempre a mesma sequência', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('seeds diferentes produzem sequências diferentes', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    expect(a()).not.toBe(b())
  })

  it('caso de borda: todo valor gerado fica no intervalo [0, 1)', () => {
    const aleatorio = mulberry32(123)
    for (let i = 0; i < 50; i++) {
      const v = aleatorio()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
