import { CATEGORIAS, CATEGORIAS_DE_GASTO } from './categorias'
import { arredondaMoeda } from './numeros'
import type { CategoriaChave, ResumoCategoria, Transacao } from './tipos'

function totalAbsolutoPorCategoria(transacoes: Transacao[], categoria: CategoriaChave): number {
  return transacoes
    .filter((t) => t.categoria === categoria)
    .reduce((soma, t) => soma + Math.abs(t.valor), 0)
}

/**
 * Agrega o gasto do mês por categoria e compara com a média dos meses
 * anteriores informados. Categorias sem gasto no mês atual não aparecem no
 * resultado; o restante vem ordenado da maior para a menor.
 */
export function calcularCategoriasDoMes(
  transacoesDoMes: Transacao[],
  mesesAnterioresParaMedia: Transacao[][] = [],
  categorias: CategoriaChave[] = CATEGORIAS_DE_GASTO,
): ResumoCategoria[] {
  return categorias
    .map((chave) => {
      const atual = arredondaMoeda(totalAbsolutoPorCategoria(transacoesDoMes, chave))
      const totaisAnteriores = mesesAnterioresParaMedia.map((mes) =>
        totalAbsolutoPorCategoria(mes, chave),
      )
      const media =
        totaisAnteriores.length > 0
          ? arredondaMoeda(
              totaisAnteriores.reduce((soma, v) => soma + v, 0) / totaisAnteriores.length,
            )
          : 0
      const delta = media > 0 ? (atual - media) / media : 0
      return { ...CATEGORIAS[chave], atual, media, delta }
    })
    .filter((c) => c.atual > 0)
    .sort((a, b) => b.atual - a.atual)
}
