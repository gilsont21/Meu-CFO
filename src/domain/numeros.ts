/** Arredonda para centavos, evitando o acúmulo de imprecisão de ponto flutuante em somas de valores monetários. */
export function arredondaMoeda(valor: number): number {
  return Math.round(valor * 100) / 100
}

const FORMATADOR_MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Formata um valor em reais (ex.: 1234.5 → "R$ 1.234,50"). */
export function formatarMoeda(valor: number): string {
  return FORMATADOR_MOEDA.format(valor)
}
