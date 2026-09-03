import type { Resumo } from './resumo.ts'

function brl(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Responde sem modelo, só com os números já calculados por src/domain — é o
 * modo degradado exigido em docs/03-arquitetura-ia.md quando a chamada ao
 * modelo falha: nunca inventa número, só reformula o que já foi computado.
 */
export function respostaFallback(resumo: Resumo): string {
  const posicao = resumo.livre >= 0 ? 'ainda dá para gastar' : 'já passou do limite do mês'
  const categoriaTopo = resumo.categorias[0]

  let texto = `Sem conexão com o modelo agora, mas os números seguem confiáveis: você ${posicao}, com ${brl(resumo.livre)} livres até o fim do mês (${brl(resumo.livrePorDia)} por dia). Seu ritmo de gasto variável está em ${brl(resumo.mediaDiaria)} por dia.`

  if (categoriaTopo) {
    texto += ` A categoria com maior gasto até agora é ${categoriaTopo.nome.toLowerCase()}, com ${brl(categoriaTopo.atual)}.`
  }

  return texto
}
