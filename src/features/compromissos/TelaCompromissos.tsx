import layout from '../../ui/layout.module.css'

// TODO: consumir calcularCompromissosFuturos / calcularTotalCompromissos de
// src/domain, com os recorrentes de src/data, para listar o que ainda vai sair.
/** Conteúdo do segmento "Compromissos" dentro de Transações: o que ainda vai sair. */
export function TelaCompromissos() {
  return (
    <p className={layout.placeholder}>
      lista de compromissos futuros: faturas, parcelas e assinaturas que ainda vão sair
    </p>
  )
}
