import type { CompromissoRecorrente } from '../domain/tipos'

/**
 * Compromissos recorrentes fixos do cenário sintético de demonstração:
 * salário, contas fixas, assinaturas, fatura e parcela. É dado, não lógica —
 * quem decide o que ainda vai vencer é calcularCompromissosFuturos, no
 * domínio.
 */
export const RECORRENTES: CompromissoRecorrente[] = [
  { dia: 5, descricao: 'Salário', valor: 7400.0, categoria: 'receita', tipo: 'entrada' },
  { dia: 5, descricao: 'Aluguel', valor: -1850.0, categoria: 'moradia', tipo: 'fixo' },
  { dia: 8, descricao: 'Conta de luz', valor: -168.4, categoria: 'moradia', tipo: 'fixo' },
  {
    dia: 10,
    descricao: 'Plano de celular',
    valor: -59.9,
    categoria: 'assinaturas',
    tipo: 'assinatura',
  },
  {
    dia: 15,
    descricao: 'Academia SmartFit',
    valor: -129.9,
    categoria: 'saude',
    tipo: 'assinatura',
  },
  { dia: 20, descricao: 'Netflix', valor: -44.9, categoria: 'assinaturas', tipo: 'assinatura' },
  { dia: 22, descricao: 'Spotify', valor: -21.9, categoria: 'assinaturas', tipo: 'assinatura' },
  { dia: 24, descricao: 'Internet fibra', valor: -119.9, categoria: 'moradia', tipo: 'fixo' },
  { dia: 25, descricao: 'Fatura do cartão', valor: -2980.0, categoria: 'compras', tipo: 'fatura' },
  {
    dia: 28,
    descricao: 'Notebook — parcela 5/10',
    valor: -458.33,
    categoria: 'compras',
    tipo: 'parcela',
  },
]
