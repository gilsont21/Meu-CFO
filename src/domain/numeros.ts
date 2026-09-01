/** Arredonda para centavos, evitando o acúmulo de imprecisão de ponto flutuante em somas de valores monetários. */
export function arredondaMoeda(valor: number): number {
  return Math.round(valor * 100) / 100
}
