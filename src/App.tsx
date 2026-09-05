import { useState } from 'react'
import styles from './App.module.css'
import { TelaAgentes } from './features/agentes'
import { TelaAjuda } from './features/ajuda'
import { TelaChat } from './features/cfo'
import { TelaHoje } from './features/hoje'
import { TelaMetas } from './features/metas'
import { TelaTransacoes } from './features/transacoes'
import { TelaVisaoGeral } from './features/visao-geral'
import { Rail, type NavId } from './ui'

function App() {
  const [aba, setAba] = useState<NavId>('hoje')
  const [ajudaAberta, setAjudaAberta] = useState(false)

  const navegarPara = (id: NavId): void => {
    setAba(id)
    setAjudaAberta(false)
  }

  const chatCheio = aba === 'cfo' && !ajudaAberta

  return (
    <div className={styles.app}>
      <Rail
        atual={aba}
        ajudaAberta={ajudaAberta}
        onNavegar={navegarPara}
        onAjudaClick={() => setAjudaAberta(true)}
      />

      <main className={chatCheio ? styles.mainCheio : styles.main}>
        {ajudaAberta ? (
          <TelaAjuda onFechar={() => setAjudaAberta(false)} />
        ) : (
          <>
            {aba === 'hoje' && <TelaHoje />}
            {aba === 'visao' && <TelaVisaoGeral />}
            {aba === 'tx' && <TelaTransacoes />}
            {aba === 'metas' && <TelaMetas />}
            {aba === 'agentes' && <TelaAgentes />}
            {aba === 'cfo' && <TelaChat />}
          </>
        )}
      </main>
    </div>
  )
}

export default App
