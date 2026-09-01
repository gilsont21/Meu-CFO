/**
 * Gerador pseudoaleatório determinístico (mulberry32): a mesma seed sempre
 * produz a mesma sequência de números em [0, 1), o que torna os dados
 * sintéticos e os testes que dependem deles reproduzíveis.
 */
export function mulberry32(seed: number): () => number {
  let estado = seed
  return function proximoNumero(): number {
    estado |= 0
    estado = (estado + 0x6d2b79f5) | 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
