import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// `test.globals` está desligado (os testes importam describe/it/expect
// explicitamente de 'vitest'), então o auto-cleanup do Testing Library não se
// registra sozinho — sem isso, o DOM de um `render()` vaza para o próximo
// teste do mesmo arquivo.
afterEach(cleanup)

// Sem isso, um `vi.spyOn` num módulo (ex.: src/servicos/api) feito em um
// teste continua mockado e acumulando chamadas nos testes seguintes do mesmo
// arquivo, já que `vi.spyOn` reaproveita o spy existente em vez de recriar.
afterEach(() => {
  vi.restoreAllMocks()
})
