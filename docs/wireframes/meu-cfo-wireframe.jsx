import React, { useState } from "react";

/* ------------------------------------------------------------------ *
 *  WIREFRAME v2 — arquitetura de navegação do Meu CFO
 *  Sem decisão de cor ou tipografia. Só estrutura e hierarquia.
 *
 *  Novidades desta versão:
 *  - "Visão geral" (tendência ao longo do tempo) separada de "Hoje"
 *    (veredito do mês corrente) — perguntas diferentes, telas diferentes.
 *  - "Metas" como área própria.
 *  - "Ajuda" como ícone separado no rodapé do rail, não competindo
 *    com as áreas de dado real — é conteúdo educativo, não trabalho.
 * ------------------------------------------------------------------ */

const NAV = [
  { id: "hoje", label: "Hoje", glyph: "◐" },
  { id: "visao", label: "Visão geral", glyph: "▤" },
  { id: "tx", label: "Transações", glyph: "≡" },
  { id: "metas", label: "Metas", glyph: "◎" },
  { id: "agentes", label: "Agentes", glyph: "◇" },
  { id: "cfo", label: "CFO", glyph: "◆" },
];

export default function Wireframe() {
  const [aba, setAba] = useState("hoje");
  const [railExpandido, setRailExpandido] = useState(false);
  const [subaba, setSubaba] = useState("visaogeral");
  const [ajudaAberta, setAjudaAberta] = useState(false);

  const chatCheio = aba === "cfo";

  return (
    <div style={S.app}>
      {/* ---------------- RAIL LATERAL ---------------- */}
      <nav
        style={{ ...S.rail, width: railExpandido ? 180 : 64 }}
        onMouseEnter={() => setRailExpandido(true)}
        onMouseLeave={() => setRailExpandido(false)}
      >
        <div style={S.railTopo}>
          <div style={S.marca}>₵</div>
        </div>

        <div style={S.railItens}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => { setAba(n.id); setAjudaAberta(false); }}
              style={{
                ...S.railItem,
                ...(aba === n.id && !ajudaAberta ? S.railItemAtivo : {}),
                justifyContent: railExpandido ? "flex-start" : "center",
              }}
              title={n.label}
            >
              <span style={S.railGlyph}>{n.glyph}</span>
              {railExpandido && <span style={S.railLabel}>{n.label}</span>}
            </button>
          ))}
        </div>

        <div style={S.railRodape}>
          <button
            onClick={() => setAjudaAberta(true)}
            style={{
              ...S.railItem,
              ...(ajudaAberta ? S.railItemAtivo : {}),
              justifyContent: railExpandido ? "flex-start" : "center",
              marginBottom: 4,
            }}
            title="Ajuda"
          >
            <span style={S.railGlyph}>?</span>
            {railExpandido && <span style={S.railLabel}>Ajuda</span>}
          </button>
          <div style={S.contaLinha}>
            <div style={{ ...S.avatar, margin: railExpandido ? "0" : "0 auto" }}>G</div>
            {railExpandido && <span style={S.railLabelSub}>Gilson</span>}
          </div>
        </div>
      </nav>

      {/* ---------------- CONTEÚDO ---------------- */}
      <main style={{ ...S.main, padding: chatCheio && !ajudaAberta ? 0 : undefined }}>
        {ajudaAberta ? (
          <TelaAjuda onFechar={() => setAjudaAberta(false)} />
        ) : (
          <>
            {aba === "hoje" && <TelaHoje />}
            {aba === "visao" && <TelaVisaoGeral />}
            {aba === "tx" && <TelaSubabas subaba={subaba} setSubaba={setSubaba} />}
            {aba === "metas" && <TelaMetas />}
            {aba === "agentes" && <TelaAgentes />}
            {aba === "cfo" && <TelaChat />}
          </>
        )}
      </main>

      <div style={S.legenda}>
        wireframe — sem cor/tipografia definitivas · "?" no rodapé do rail abre a Ajuda
      </div>
    </div>
  );
}

/* ================= HOJE — grid de cartões (veredito do mês) ================= */

function TelaHoje() {
  return (
    <div style={S.conteudo}>
      <Cabecalho eyebrow="terça, 18 de agosto" titulo="Como está o seu mês" />

      <div style={{ ...S.card, ...S.cardHero }}>
        <div style={S.rotulo}>veredito do mês</div>
        <div style={S.heroFrase}>
          "Do jeito que está, você fecha agosto R$ 178 no vermelho."
        </div>
        <div style={S.heroGrafico}>[ gráfico de projeção — linha cheia até hoje, tracejada depois ]</div>
        <div style={S.heroAlavanca}>[ alavanca: segurar R$ ___ por dia ]</div>
      </div>

      <div style={S.grid}>
        <Cartao rotulo="livre para gastar" valor="R$ 412" nota="13 dias restantes" link="ver detalhes" />
        <Cartao rotulo="ritmo de gasto" valor="R$ 87/dia" nota="+18% vs. média" link="ver categorias" />
        <Cartao rotulo="próximo compromisso" valor="Fatura · dia 25" nota="R$ 2.980" link="ver todos" />
        <Cartao rotulo="o que os agentes viram" valor="2 avisos" nota="comer fora subiu" link="ver agentes" />
      </div>

      <div style={S.blocoTitulo}>Para onde foi o dinheiro</div>
      <div style={S.card}>
        <div style={S.placeholder}>[ lista de categorias com barra de proporção ]</div>
      </div>
    </div>
  );
}

/* ================= VISÃO GERAL — tendência ao longo do tempo ================= */

function TelaVisaoGeral() {
  return (
    <div style={S.conteudo}>
      <Cabecalho eyebrow="últimos 6 meses" titulo="Como você está indo ao longo do tempo" />

      <div style={S.grid}>
        <Cartao rotulo="patrimônio líquido" valor="R$ 8.240" nota="+R$ 1.100 em 6 meses" link="ver evolução" />
        <Cartao rotulo="taxa de poupança" valor="9%" nota="meta pessoal: 15%" link="ajustar meta" />
        <Cartao rotulo="mês mais apertado" valor="Junho" nota="fechou R$ 340 no vermelho" link="ver o que houve" />
      </div>

      <div style={S.blocoTitulo}>Entradas x saídas por mês</div>
      <div style={S.card}>
        <div style={S.heroGrafico}>[ gráfico de barras — entradas e saídas lado a lado, 6 meses ]</div>
      </div>

      <div style={S.blocoTitulo}>Categorias que mais cresceram</div>
      <div style={S.card}>
        <div style={S.placeholder}>[ ranking de categorias por variação % no período ]</div>
      </div>
    </div>
  );
}

/* ============ TRANSAÇÕES/COMPROMISSOS — segmented control ============ */

function TelaSubabas({ subaba, setSubaba }) {
  const subs = [
    { id: "visaogeral", label: "Visão geral" },
    { id: "extrato", label: "Extrato" },
    { id: "compromissos", label: "Compromissos" },
    { id: "assinaturas", label: "Assinaturas" },
    { id: "categorias", label: "Categorias" },
  ];
  return (
    <div style={S.conteudo}>
      <Cabecalho eyebrow="agosto de 2026" titulo="Transações" />
      <div style={S.segmented}>
        {subs.map((s) => (
          <button
            key={s.id}
            onClick={() => setSubaba(s.id)}
            style={{ ...S.segItem, ...(subaba === s.id ? S.segItemAtivo : {}) }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.placeholder}>
          [ conteúdo de "{subs.find((s) => s.id === subaba)?.label}" ]
        </div>
      </div>
    </div>
  );
}

/* ================= METAS ================= */

function TelaMetas() {
  const metas = [
    { nome: "Reserva de emergência", alvo: 15000, atual: 6200, prazo: "dez/2026" },
    { nome: "Viagem para o Chile", alvo: 4500, atual: 1800, prazo: "jul/2027" },
    { nome: "Troca de notebook", alvo: 6000, atual: 5100, prazo: "out/2026" },
  ];
  return (
    <div style={S.conteudo}>
      <Cabecalho eyebrow="3 metas ativas" titulo="Metas e objetivos" />

      <div style={S.gridMetas}>
        {metas.map((m) => {
          const pct = Math.round((m.atual / m.alvo) * 100);
          return (
            <div key={m.nome} style={S.card}>
              <div style={S.metaCab}>
                <span style={S.blocoTitulo}>{m.nome}</span>
                <span style={S.rotulo}>até {m.prazo}</span>
              </div>
              <div style={S.barraFundo}>
                <div style={{ ...S.barraPreench, width: `${pct}%` }} />
              </div>
              <div style={S.metaRodape}>
                <span>R$ {m.atual.toLocaleString("pt-BR")} de R$ {m.alvo.toLocaleString("pt-BR")}</span>
                <span>{pct}%</span>
              </div>
              <div style={S.cartaoLink}>ajustar aporte mensal →</div>
            </div>
          );
        })}

        <button style={S.cardNovaMeta}>+ Nova meta</button>
      </div>
    </div>
  );
}

/* ================= AGENTES ================= */

function TelaAgentes() {
  const agentes = [
    { nome: "Vigia de gastos", status: "ativo", achado: "Comer fora 28% acima da média" },
    { nome: "Caça-assinaturas", status: "ativo", achado: "5 assinaturas, R$ 256/mês" },
    { nome: "Radar de faturas", status: "ativo", achado: "R$ 5.418 comprometidos" },
    { nome: "Caçador de preços", status: "inativo", achado: "—" },
    { nome: "Planejador", status: "sob demanda", achado: "—" },
  ];
  return (
    <div style={S.conteudo}>
      <Cabecalho eyebrow="trabalham em segundo plano" titulo="Agentes" />
      <div style={S.grid}>
        {agentes.map((a) => (
          <div key={a.nome} style={S.card}>
            <div style={S.agenteCab}>
              <span style={S.rotulo}>{a.nome}</span>
              <span style={S.pill}>{a.status}</span>
            </div>
            <div style={S.placeholder}>{a.achado}</div>
          </div>
        ))}
        <button style={S.cardNovaMeta}>+ Criar agente personalizado</button>
      </div>
    </div>
  );
}

/* ================= CFO — tela cheia ================= */

function TelaChat() {
  return (
    <div style={S.chatWrap}>
      <div style={S.chatCorpo}>
        <div style={S.chatSaudacao}>Converse com o seu CFO</div>
        <div style={S.chatSub}>
          Pergunte qualquer coisa sobre o seu dinheiro. Nenhum número aqui é chutado.
        </div>
        <div style={S.chips}>
          <span style={S.chip}>Onde eu mais gastei?</span>
          <span style={S.chip}>Posso pedir delivery hoje?</span>
          <span style={S.chip}>O que vence essa semana?</span>
        </div>
      </div>
      <div style={S.chatEntrada}>
        <span style={S.placeholderTexto}>Pergunte ao seu CFO</span>
        <span style={S.chatEnviar}>↑</span>
      </div>
    </div>
  );
}

/* ================= AJUDA — boas práticas, prompts, trilhas por objetivo ================= */

function TelaAjuda({ onFechar }) {
  const [secaoAberta, setSecaoAberta] = useState("prompts");

  const secoes = [
    { id: "prompts", label: "Como conversar com o CFO" },
    { id: "agentes", label: "Como criar um agente" },
    { id: "trilhas", label: "Trilhas por objetivo" },
  ];

  return (
    <div style={S.conteudo}>
      <div style={S.ajudaTopo}>
        <Cabecalho eyebrow="central de ajuda" titulo="Aproveite melhor o Meu CFO" />
        <button style={S.fechar} onClick={onFechar}>fechar ✕</button>
      </div>

      <div style={S.segmented}>
        {secoes.map((s) => (
          <button
            key={s.id}
            onClick={() => setSecaoAberta(s.id)}
            style={{ ...S.segItem, ...(secaoAberta === s.id ? S.segItemAtivo : {}) }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {secaoAberta === "prompts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={S.card}>
            <div style={S.blocoTitulo}>Seja específico sobre o recorte</div>
            <div style={S.exemploRuim}>✗ "como estão meus gastos?"</div>
            <div style={S.exemploBom}>✓ "quanto gastei com comer fora nas últimas 2 semanas comparado ao mês passado?"</div>
          </div>
          <div style={S.card}>
            <div style={S.blocoTitulo}>Peça o plano, não só o diagnóstico</div>
            <div style={S.exemploRuim}>✗ "estou gastando demais"</div>
            <div style={S.exemploBom}>✓ "quanto eu preciso cortar por dia para fechar o mês no azul?"</div>
          </div>
          <div style={S.card}>
            <div style={S.blocoTitulo}>Use o modo planejamento para decisões grandes</div>
            <div style={S.placeholder}>
              [ exemplo: "e se eu financiar um carro de R$ 90 mil em 48x?" → aciona o Planejador ]
            </div>
          </div>
        </div>
      )}

      {secaoAberta === "agentes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={S.card}>
            <div style={S.blocoTitulo}>1. Diga o que você quer acompanhar</div>
            <div style={S.placeholder}>"avise se eu gastar mais de R$ 300 em delivery no mês"</div>
          </div>
          <div style={S.card}>
            <div style={S.blocoTitulo}>2. Escolha a frequência</div>
            <div style={S.placeholder}>[ diário · semanal · ao detectar o evento ]</div>
          </div>
          <div style={S.card}>
            <div style={S.blocoTitulo}>3. Revise antes de ativar</div>
            <div style={S.placeholder}>[ prévia de como e quando o agente vai te avisar ]</div>
          </div>
        </div>
      )}

      {secaoAberta === "trilhas" && (
        <div style={S.grid}>
          <TrilhaCard titulo="Sair do vermelho" passos={["Ver o dia em que o aperto começa", "Arrastar a alavanca até fechar no azul", "Ativar o Vigia de gastos na categoria que mais pesa"]} />
          <TrilhaCard titulo="Planejar uma compra grande" passos={["Abrir o modo planejamento no CFO", "Descrever a compra e a forma de pagamento", "Comparar o plano com sua projeção atual"]} />
          <TrilhaCard titulo="Criar uma reserva de emergência" passos={["Criar uma meta em Metas", "Definir o aporte mensal sugerido", "Acompanhar o progresso em Visão geral"]} />
          <TrilhaCard titulo="Entender para onde vai seu dinheiro" passos={["Abrir Visão geral e ver os 6 meses", "Identificar a categoria que mais cresceu", "Perguntar ao CFO o motivo do aumento"]} />
        </div>
      )}
    </div>
  );
}

function TrilhaCard({ titulo, passos }) {
  return (
    <div style={S.card}>
      <div style={S.blocoTitulo}>{titulo}</div>
      <ol style={S.listaPassos}>
        {passos.map((p, i) => (
          <li key={i} style={S.passoItem}>{p}</li>
        ))}
      </ol>
    </div>
  );
}

/* ================= compartilhados ================= */

function Cabecalho({ eyebrow, titulo }) {
  return (
    <div style={S.cabecalho}>
      <div style={S.rotulo}>{eyebrow}</div>
      <h1 style={S.titulo}>{titulo}</h1>
    </div>
  );
}

function Cartao({ rotulo, valor, nota, link }) {
  return (
    <div style={S.card}>
      <div style={S.rotulo}>{rotulo}</div>
      <div style={S.cartaoValor}>{valor}</div>
      <div style={S.cartaoNota}>{nota}</div>
      <div style={S.cartaoLink}>{link} →</div>
    </div>
  );
}

/* ================= estilos (wireframe — cinza puro) ================= */

const S = {
  app: {
    display: "flex", minHeight: "100vh", background: "#EDEDED", color: "#1A1A1A",
    fontFamily: "system-ui, sans-serif", position: "relative",
  },
  rail: {
    flex: "0 0 auto", background: "#FFFFFF", borderRight: "1px solid #D4D4D4",
    display: "flex", flexDirection: "column", padding: "16px 10px", gap: 20,
    transition: "width .15s ease", overflow: "hidden", position: "sticky", top: 0, height: "100vh",
  },
  railTopo: { display: "flex", justifyContent: "center", padding: "4px 0 8px" },
  marca: {
    width: 32, height: 32, borderRadius: 8, background: "#1A1A1A", color: "#fff",
    display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16, flex: "0 0 auto",
  },
  railItens: { display: "flex", flexDirection: "column", gap: 4 },
  railItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
    borderRadius: 8, border: 0, background: "transparent", color: "#555",
    fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap", width: "100%",
  },
  railItemAtivo: { background: "#1A1A1A", color: "#fff" },
  railGlyph: { fontSize: 15, flex: "0 0 auto", width: 18, textAlign: "center" },
  railLabel: { fontSize: 13.5 },
  railRodape: { marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 },
  contaLinha: { display: "flex", alignItems: "center", gap: 8, padding: "6px 2px 0" },
  avatar: {
    width: 28, height: 28, borderRadius: "50%", background: "#D4D4D4",
    display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, flex: "0 0 auto",
  },
  railLabelSub: { fontSize: 12.5, color: "#777" },

  main: { flex: 1, padding: "32px 40px", maxWidth: 900, margin: "0 auto", width: "100%" },
  conteudo: {},

  ajudaTopo: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  fechar: { border: "1px solid #D4D4D4", background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, color: "#666", cursor: "pointer", height: "fit-content" },

  cabecalho: { marginBottom: 20 },
  rotulo: { fontSize: 11, letterSpacing: ".04em", color: "#888", fontFamily: "ui-monospace, monospace", marginBottom: 4 },
  titulo: { fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-.01em" },

  card: { background: "#FFFFFF", border: "1px solid #D4D4D4", borderRadius: 10, padding: 18 },
  cardHero: { marginBottom: 22, display: "flex", flexDirection: "column", gap: 14 },
  heroFrase: { fontSize: 19, fontWeight: 500, lineHeight: 1.35, maxWidth: "34ch" },
  heroGrafico: { height: 90, border: "1px dashed #C4C4C4", borderRadius: 8, display: "grid", placeItems: "center", color: "#999", fontSize: 12.5 },
  heroAlavanca: { height: 40, border: "1px dashed #C4C4C4", borderRadius: 8, display: "grid", placeItems: "center", color: "#999", fontSize: 12.5 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginBottom: 26 },
  gridMetas: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 },
  cartaoValor: { fontSize: 22, fontWeight: 700, margin: "6px 0 2px" },
  cartaoNota: { fontSize: 12.5, color: "#888", marginBottom: 10 },
  cartaoLink: { fontSize: 12.5, color: "#1A1A1A", fontWeight: 500, marginTop: 8 },

  blocoTitulo: { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  placeholder: { color: "#999", fontSize: 13, fontStyle: "italic" },

  segmented: { display: "inline-flex", gap: 2, background: "#E2E2E2", padding: 3, borderRadius: 10, marginBottom: 18, flexWrap: "wrap" },
  segItem: { border: 0, background: "transparent", padding: "7px 14px", borderRadius: 8, fontSize: 13, color: "#666", cursor: "pointer" },
  segItemAtivo: { background: "#fff", color: "#1A1A1A", fontWeight: 600, boxShadow: "0 1px 2px rgba(0,0,0,.08)" },

  agenteCab: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pill: { fontSize: 10.5, border: "1px solid #D4D4D4", borderRadius: 20, padding: "2px 8px", color: "#777" },

  metaCab: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  barraFundo: { height: 8, background: "#E8E8E8", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  barraPreench: { height: "100%", background: "#1A1A1A", borderRadius: 4 },
  metaRodape: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#666" },

  cardNovaMeta: {
    border: "1px dashed #C4C4C4", background: "transparent", borderRadius: 10,
    display: "grid", placeItems: "center", color: "#888", fontSize: 13.5, cursor: "pointer", minHeight: 100,
  },

  listaPassos: { margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 },
  passoItem: { fontSize: 13, color: "#444" },

  exemploRuim: { fontSize: 13, color: "#888", marginBottom: 4 },
  exemploBom: { fontSize: 13, color: "#1A1A1A", fontWeight: 500 },

  chatWrap: { display: "flex", flexDirection: "column", height: "100vh", padding: "0 0 24px", alignItems: "center", justifyContent: "flex-end" },
  chatCorpo: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8, padding: "0 24px" },
  chatSaudacao: { fontSize: 26, fontWeight: 700 },
  chatSub: { fontSize: 14, color: "#777", maxWidth: "40ch" },
  chips: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" },
  chip: { border: "1px solid #D4D4D4", borderRadius: 20, padding: "7px 13px", fontSize: 12.5, color: "#666", background: "#fff" },
  chatEntrada: { width: "min(600px, 90%)", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #D4D4D4", borderRadius: 14, padding: "12px 16px", background: "#fff" },
  placeholderTexto: { color: "#999", fontSize: 14 },
  chatEnviar: { width: 30, height: 30, borderRadius: 8, background: "#1A1A1A", color: "#fff", display: "grid", placeItems: "center", fontSize: 14 },

  legenda: {
    position: "fixed", bottom: 10, left: "50%", transform: "translateX(-50%)",
    fontSize: 11, color: "#999", fontFamily: "ui-monospace, monospace",
    background: "#fff", border: "1px solid #D4D4D4", borderRadius: 20, padding: "4px 12px",
  },
};
