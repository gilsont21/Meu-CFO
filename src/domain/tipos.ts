/**
 * Tipos das entidades de domínio, alinhados à camada `curated` descrita em
 * docs/02-modelo-de-dados.md. Nenhum tipo aqui depende de React ou de UI.
 */

export type CategoriaChave =
  | 'moradia'
  | 'mercado'
  | 'comer_fora'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'assinaturas'
  | 'compras'
  | 'receita'

export interface Categoria {
  chave: CategoriaChave
  nome: string
  cor: string
}

export type OrigemTransacao = 'openfinance' | 'ofx' | 'manual' | 'synthetic'

export interface Transacao {
  id: string
  data: Date
  descricao: string
  /** Com sinal: negativo é saída, positivo é entrada. */
  valor: number
  categoria: CategoriaChave
  recorrente: boolean
  origem: OrigemTransacao
}

export type TipoCompromisso = 'entrada' | 'fixo' | 'assinatura' | 'fatura' | 'parcela' | 'variável'

/** Item recorrente cadastrado (fatura, assinatura, parcela), antes de saber se ainda vai vencer. */
export interface CompromissoRecorrente {
  dia: number
  descricao: string
  /** Com sinal: negativo é saída, positivo é entrada. */
  valor: number
  categoria: CategoriaChave
  tipo: TipoCompromisso
}

/** Compromisso que ainda vai sair da conta neste mês — valor já em módulo. */
export interface Compromisso {
  dia: number
  descricao: string
  valor: number
  categoria: CategoriaChave
  tipo: TipoCompromisso
}

export interface PontoProjecao {
  dia: number
  saldo: number
}

export interface ResumoCategoria extends Categoria {
  /** Total gasto na categoria neste mês, em módulo. */
  atual: number
  /** Média de gasto na categoria nos meses anteriores usados como referência. */
  media: number
  /** Variação percentual de `atual` sobre `media` (0 quando não há referência). */
  delta: number
}
