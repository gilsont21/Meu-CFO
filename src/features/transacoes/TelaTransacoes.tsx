import { useState } from 'react'
import { TelaCompromissos } from '../compromissos'
import { Cabecalho, SegmentedControl, type OpcaoSegmentada } from '../../ui'
import layout from '../../ui/layout.module.css'

type SegmentoTransacoes = 'visao-geral' | 'extrato' | 'compromissos' | 'assinaturas' | 'categorias'

const SEGMENTOS: OpcaoSegmentada<SegmentoTransacoes>[] = [
  { id: 'visao-geral', rotulo: 'Visão geral' },
  { id: 'extrato', rotulo: 'Extrato' },
  { id: 'compromissos', rotulo: 'Compromissos' },
  { id: 'assinaturas', rotulo: 'Assinaturas' },
  { id: 'categorias', rotulo: 'Categorias' },
]

function ConteudoSegmento({ segmento }: { segmento: SegmentoTransacoes }) {
  if (segmento === 'compromissos') return <TelaCompromissos />
  const rotulo = SEGMENTOS.find((s) => s.id === segmento)?.rotulo ?? ''
  return <p className={layout.placeholder}>conteúdo de “{rotulo}”</p>
}

/**
 * Extrato unificado, busca, filtro e correção de categoria — organizados em
 * segmentos em vez de telas separadas.
 */
export function TelaTransacoes() {
  const [segmento, setSegmento] = useState<SegmentoTransacoes>('visao-geral')

  return (
    <div>
      <Cabecalho eyebrow="agosto de 2026" titulo="Transações" />
      <SegmentedControl
        opcoes={SEGMENTOS}
        selecionado={segmento}
        onSelecionar={setSegmento}
        ariaLabel="Seção de transações"
      />
      <div className={layout.card}>
        <ConteudoSegmento segmento={segmento} />
      </div>
    </div>
  )
}
