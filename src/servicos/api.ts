import type { Compromisso, PontoProjecao, ResumoCategoria } from '../domain/tipos'
import type { CategoriaChave, OrigemTransacao } from '../domain/tipos'

/**
 * Transação como ela chega do servidor: `data` já serializada como string
 * (o domínio usa `Date`, mas JSON não transporta esse tipo).
 */
export interface TransacaoDTO {
  id: string
  data: string
  descricao: string
  valor: number
  categoria: CategoriaChave
  recorrente: boolean
  origem: OrigemTransacao
}

export interface NovaTransacaoInput {
  data: string // AAAA-MM-DD
  descricao: string
  valor: number
  categoria: CategoriaChave
  recorrente?: boolean
  origem?: OrigemTransacao
}

export interface ResumoDTO {
  ano: number
  mes: number
  dia: number
  saldoHoje: number
  mediaDiaria: number
  livre: number
  livrePorDia: number
  compromissosFuturos: Compromisso[]
  totalCompromissos: number
  projecao: PontoProjecao[]
  categorias: ResumoCategoria[]
}

export interface ParametrosResumo {
  ano?: number
  mes?: number
  dia?: number
  saldoHoje?: number
  corte?: number
  mesesReferencia?: number
}

export interface RespostaChat {
  resposta: string
  modelo: boolean
}

export interface ParametrosPergunta {
  ano?: number
  mes?: number
  dia?: number
  saldoHoje?: number
  corte?: number
}

/** Erro de rede: a requisição não chegou a sair (offline, DNS, servidor fora do ar). */
export interface ErroDeRede {
  tipo: 'rede'
  mensagem: string
}

/** Erro reportado pelo próprio servidor (4xx/5xx), com o status HTTP original. */
export interface ErroDoServidor {
  tipo: 'servidor'
  status: number
  mensagem: string
}

export type ErroApi = ErroDeRede | ErroDoServidor

export type ResultadoApi<T> = { ok: true; dados: T } | { ok: false; erro: ErroApi }

async function extraiMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => null)
  if (corpo && typeof corpo === 'object' && 'erro' in corpo && typeof corpo.erro === 'string') {
    return corpo.erro
  }
  return `Erro do servidor (${resposta.status}).`
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<ResultadoApi<T>> {
  let resposta: Response
  try {
    resposta = await fetch(caminho, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    return {
      ok: false,
      erro: { tipo: 'rede', mensagem: 'Não foi possível conectar ao servidor.' },
    }
  }

  if (!resposta.ok) {
    return {
      ok: false,
      erro: {
        tipo: 'servidor',
        status: resposta.status,
        mensagem: await extraiMensagemDeErro(resposta),
      },
    }
  }

  if (resposta.status === 204) {
    return { ok: true, dados: undefined as T }
  }

  return { ok: true, dados: (await resposta.json()) as T }
}

function paraQueryString(parametros: Record<string, unknown>): string {
  const query = new URLSearchParams()
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined) query.set(chave, String(valor))
  }
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

export function listarTransacoes(ano: number, mes: number): Promise<ResultadoApi<TransacaoDTO[]>> {
  return requisitar<TransacaoDTO[]>(`/api/transacoes${paraQueryString({ ano, mes })}`)
}

export function criarTransacao(nova: NovaTransacaoInput): Promise<ResultadoApi<TransacaoDTO>> {
  return requisitar<TransacaoDTO>('/api/transacoes', {
    method: 'POST',
    body: JSON.stringify(nova),
  })
}

export function removerTransacao(id: string): Promise<ResultadoApi<undefined>> {
  return requisitar<undefined>(`/api/transacoes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function buscarResumo(parametros: ParametrosResumo = {}): Promise<ResultadoApi<ResumoDTO>> {
  return requisitar<ResumoDTO>(
    `/api/resumo${paraQueryString(parametros as Record<string, unknown>)}`,
  )
}

export function enviarPergunta(
  pergunta: string,
  contexto: ParametrosPergunta = {},
): Promise<ResultadoApi<RespostaChat>> {
  return requisitar<RespostaChat>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ pergunta, ...contexto }),
  })
}
