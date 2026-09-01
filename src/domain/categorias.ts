import type { Categoria, CategoriaChave } from './tipos'

/**
 * Taxonomia fixa do produto (docs/02-modelo-de-dados.md). As cores vêm das
 * cédulas do real — referência do próprio assunto, não uma paleta genérica.
 */
export const CATEGORIAS: Record<CategoriaChave, Categoria> = {
  moradia: { chave: 'moradia', nome: 'Moradia', cor: '#17457E' },
  mercado: { chave: 'mercado', nome: 'Mercado', cor: '#2E7D5B' },
  comer_fora: { chave: 'comer_fora', nome: 'Comer fora', cor: '#C05621' },
  transporte: { chave: 'transporte', nome: 'Transporte', cor: '#A8811B' },
  saude: { chave: 'saude', nome: 'Saúde', cor: '#6A4B9C' },
  lazer: { chave: 'lazer', nome: 'Lazer', cor: '#B23A32' },
  assinaturas: { chave: 'assinaturas', nome: 'Assinaturas', cor: '#3E7F8C' },
  compras: { chave: 'compras', nome: 'Compras', cor: '#7C6A57' },
  receita: { chave: 'receita', nome: 'Entrada', cor: '#2E7D5B' },
}

/** As 8 categorias de gasto, sem `receita` — usadas nas agregações do mês. */
export const CATEGORIAS_DE_GASTO: CategoriaChave[] = [
  'moradia',
  'mercado',
  'comer_fora',
  'transporte',
  'saude',
  'lazer',
  'assinaturas',
  'compras',
]
