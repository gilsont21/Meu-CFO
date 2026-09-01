import type { CategoriaChave } from '../domain/tipos'

/**
 * Categorias sorteáveis para transações variáveis. Moradia e assinaturas só
 * aparecem via RECORRENTES, e receita nunca é uma saída — por isso ficam de
 * fora do sorteio.
 */
export type CategoriaVariavel = Extract<
  CategoriaChave,
  'mercado' | 'comer_fora' | 'transporte' | 'lazer' | 'compras' | 'saude'
>

/** [nome do estabelecimento, valor mínimo, valor máximo] de uma compra típica, em módulo. */
type FaixaEstabelecimento = [nome: string, min: number, max: number]

/** Estabelecimentos sintéticos usados para gerar transações variáveis plausíveis, por categoria. */
export const ESTABELECIMENTOS: Record<CategoriaVariavel, FaixaEstabelecimento[]> = {
  mercado: [
    ['Supermercado Vila Nova', 70, 260],
    ['Hortifruti do Bairro', 22, 78],
    ['Atacadão', 150, 340],
  ],
  comer_fora: [
    ['iFood', 26, 92],
    ['Padaria Estrela', 11, 34],
    ['Restaurante Kiko', 32, 78],
    ['Café Girassol', 14, 32],
  ],
  transporte: [
    ['Uber', 9, 36],
    ['Posto Ipiranga', 110, 240],
    ['Bilhete Único', 5, 9],
  ],
  lazer: [
    ['Cinema Praça', 30, 62],
    ['Bar do Zé', 40, 130],
    ['Steam', 22, 95],
  ],
  compras: [
    ['Amazon', 35, 190],
    ['Renner', 60, 240],
    ['Mercado Livre', 28, 160],
  ],
  saude: [
    ['Drogasil', 18, 96],
    ['Clínica Vida', 80, 220],
  ],
}

/** Peso de sorteio de cada categoria nas transações variáveis; a soma dá 1. */
export const PESOS_CATEGORIA: [CategoriaVariavel, number][] = [
  ['comer_fora', 0.34],
  ['transporte', 0.26],
  ['mercado', 0.13],
  ['lazer', 0.11],
  ['compras', 0.1],
  ['saude', 0.06],
]

/**
 * Sorteia uma categoria de gasto variável a partir de um número em [0, 1).
 * Se os pesos não somarem 1 exatamente (arredondamento), a última categoria
 * cobre o resto da faixa.
 */
export function sorteiaCategoria(aleatorio: () => number): CategoriaVariavel {
  const x = aleatorio()
  let acumulado = 0
  for (const [categoria, peso] of PESOS_CATEGORIA) {
    acumulado += peso
    if (x <= acumulado) return categoria
  }
  return PESOS_CATEGORIA[PESOS_CATEGORIA.length - 1][0]
}
