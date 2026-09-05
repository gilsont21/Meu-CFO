import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// `test.globals` está desligado (os testes importam describe/it/expect
// explicitamente de 'vitest'), então o auto-cleanup do Testing Library não se
// registra sozinho — sem isso, o DOM de um `render()` vaza para o próximo
// teste do mesmo arquivo.
afterEach(cleanup)
