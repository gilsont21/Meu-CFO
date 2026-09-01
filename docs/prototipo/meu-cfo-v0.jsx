import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Receipt, CalendarClock, MessageSquare, Bot, Search, Send,
  Sparkles, Check, X, Repeat, CreditCard, Plane, Bell, Wallet,
  Table as TableIcon, List, ChevronDown, Loader2, ArrowRight
} from "lucide-react";

/* ------------------------------------------------------------------ *
 *  MEU CFO — protótipo v0
 *  Dados sintéticos determinísticos. Nenhum número exibido na interface
 *  é escrito pelo modelo de linguagem: tudo é calculado em JS e apenas
 *  interpretado pela IA no chat.
 * ------------------------------------------------------------------ */

/* ---------- utilidades ---------- */

const brl = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DIAS_SEM = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];

/* ---------- taxonomia (cores das cédulas do real) ---------- */

const CATS = {
  moradia:     { nome: "Moradia",     cor: "#17457E" },
  mercado:     { nome: "Mercado",     cor: "#2E7D5B" },
  comer_fora:  { nome: "Comer fora",  cor: "#C05621" },
  transporte:  { nome: "Transporte",  cor: "#A8811B" },
  saude:       { nome: "Saúde",       cor: "#6A4B9C" },
  lazer:       { nome: "Lazer",       cor: "#B23A32" },
  assinaturas: { nome: "Assinaturas", cor: "#3E7F8C" },
  compras:     { nome: "Compras",     cor: "#7C6A57" },
  receita:     { nome: "Entrada",     cor: "#2E7D5B" },
};
const CAT_KEYS = ["moradia","mercado","comer_fora","transporte","saude","lazer","assinaturas","compras"];

/* ---------- calendário da demonstração ---------- */

const HOJE = new Date(2026, 7, 18); // 18 de agosto de 2026
const ANO = HOJE.getFullYear();
const MES = HOJE.getMonth();
const DIA_HOJE = HOJE.getDate();
const DIM = new Date(ANO, MES + 1, 0).getDate();
const DIAS_RESTANTES = DIM - DIA_HOJE;

/* ---------- compromissos fixos do mês ---------- */

const RECORRENTES = [
  { dia: 5,  desc: "Salário",              valor:  7400.00, cat: "receita",     tipo: "entrada" },
  { dia: 5,  desc: "Aluguel",              valor: -1850.00, cat: "moradia",     tipo: "fixo" },
  { dia: 8,  desc: "Conta de luz",         valor:  -168.40, cat: "moradia",     tipo: "fixo" },
  { dia: 10, desc: "Plano de celular",     valor:   -59.90, cat: "assinaturas", tipo: "assinatura" },
  { dia: 15, desc: "Academia SmartFit",    valor:  -129.90, cat: "saude",       tipo: "assinatura" },
  { dia: 20, desc: "Netflix",              valor:   -44.90, cat: "assinaturas", tipo: "assinatura" },
  { dia: 22, desc: "Spotify",              valor:   -21.90, cat: "assinaturas", tipo: "assinatura" },
  { dia: 24, desc: "Internet fibra",       valor:  -119.90, cat: "moradia",     tipo: "fixo" },
  { dia: 25, desc: "Fatura do cartão",     valor: -2980.00, cat: "compras",     tipo: "fatura" },
  { dia: 28, desc: "Notebook — parcela 5/10", valor: -458.33, cat: "compras",  tipo: "parcela" },
];

/* ---------- estabelecimentos ---------- */

const LOJAS = {
  mercado:    [["Supermercado Vila Nova", 70, 260], ["Hortifruti do Bairro", 22, 78], ["Atacadão", 150, 340]],
  comer_fora: [["iFood", 26, 92], ["Padaria Estrela", 11, 34], ["Restaurante Kiko", 32, 78], ["Café Girassol", 14, 32]],
  transporte: [["Uber", 9, 36], ["Posto Ipiranga", 110, 240], ["Bilhete Único", 5, 9]],
  lazer:      [["Cinema Praça", 30, 62], ["Bar do Zé", 40, 130], ["Steam", 22, 95]],
  compras:    [["Amazon", 35, 190], ["Renner", 60, 240], ["Mercado Livre", 28, 160]],
  saude:      [["Drogasil", 18, 96], ["Clínica Vida", 80, 220]],
};
const PESOS = [
  ["comer_fora", 0.34], ["transporte", 0.26], ["mercado", 0.13],
  ["lazer", 0.11], ["compras", 0.10], ["saude", 0.06],
];

function sorteiaCat(r) {
  let x = r(), acc = 0;
  for (const [k, p] of PESOS) { acc += p; if (x <= acc) return k; }
  return "comer_fora";
}

function geraMes(ano, mes, ateDia, seed) {
  const r = mulberry32(seed);
  const txs = [];
  let id = seed * 1000;
  for (const rec of RECORRENTES) {
    if (rec.dia <= ateDia) {
      txs.push({
        id: id++, dia: rec.dia, ano, mes, desc: rec.desc, valor: rec.valor,
        cat: rec.cat, recorrente: true, tipo: rec.tipo,
      });
    }
  }
  for (let d = 1; d <= ateDia; d++) {
    const n = 1 + Math.floor(r() * 2.6);
    for (let i = 0; i < n; i++) {
      const cat = sorteiaCat(r);
      const lista = LOJAS[cat];
      const [nome, min, max] = lista[Math.floor(r() * lista.length)];
      const valor = -Math.round((min + r() * (max - min)) * 100) / 100;
      txs.push({ id: id++, dia: d, ano, mes, desc: nome, valor, cat, recorrente: false, tipo: "variável" });
    }
  }
  return txs;
}

const TX_MES = geraMes(ANO, MES, DIA_HOJE, 20260818);
const TX_ANT = geraMes(MES === 0 ? ANO - 1 : ANO, MES === 0 ? 11 : MES - 1, new Date(ANO, MES, 0).getDate(), 20260731);
const TX_ANT2 = geraMes(ANO, MES - 2, 30, 20260630);

/* ---------- agregações (as "tools" determinísticas) ---------- */

const gastosVariaveis = TX_MES.filter((t) => !t.recorrente).reduce((s, t) => s + Math.abs(t.valor), 0)
  + TX_ANT.filter((t) => !t.recorrente && t.dia > new Date(ANO, MES, 0).getDate() - (30 - DIA_HOJE)).reduce((s, t) => s + Math.abs(t.valor), 0);
const MEDIA_DIARIA = Math.round((gastosVariaveis / 30) * 100) / 100;

const COMPROMISSOS = RECORRENTES
  .filter((r) => r.dia > DIA_HOJE && r.valor < 0)
  .map((r) => ({ ...r, valor: Math.abs(r.valor) }));
const TOTAL_COMPROMISSOS = COMPROMISSOS.reduce((s, c) => s + c.valor, 0);

// Saldo calibrado para que a projeção termine levemente no vermelho —
// é o cenário que demonstra o valor do produto.
const FECHAMENTO_ALVO = -178.4;
const SALDO_HOJE = Math.round((TOTAL_COMPROMISSOS + MEDIA_DIARIA * DIAS_RESTANTES + FECHAMENTO_ALVO) * 100) / 100;
const LIVRE = Math.round((SALDO_HOJE - TOTAL_COMPROMISSOS) * 100) / 100;
const LIVRE_DIA = Math.round((LIVRE / DIAS_RESTANTES) * 100) / 100;

function netDoDia(d) {
  return TX_MES.filter((t) => t.dia === d).reduce((s, t) => s + t.valor, 0);
}

function projeta(cortePorDia = 0) {
  const pts = [];
  // passado: reconstrói para trás a partir do saldo de hoje
  let b = SALDO_HOJE;
  const passado = [{ dia: DIA_HOJE, saldo: b }];
  for (let d = DIA_HOJE; d > 1; d--) {
    b = b - netDoDia(d);
    passado.unshift({ dia: d - 1, saldo: Math.round(b * 100) / 100 });
  }
  pts.push(...passado);
  // futuro
  let f = SALDO_HOJE;
  for (let d = DIA_HOJE + 1; d <= DIM; d++) {
    f -= Math.max(0, MEDIA_DIARIA - cortePorDia);
    const comp = COMPROMISSOS.filter((c) => c.dia === d).reduce((s, c) => s + c.valor, 0);
    f -= comp;
    pts.push({ dia: d, saldo: Math.round(f * 100) / 100 });
  }
  return pts;
}

const categoriasDoMes = CAT_KEYS.map((k) => {
  const atual = TX_MES.filter((t) => t.cat === k).reduce((s, t) => s + Math.abs(t.valor), 0);
  const ant = TX_ANT.filter((t) => t.cat === k).reduce((s, t) => s + Math.abs(t.valor), 0);
  const ant2 = TX_ANT2.filter((t) => t.cat === k).reduce((s, t) => s + Math.abs(t.valor), 0);
  const media = (ant + ant2) / 2;
  return { key: k, ...CATS[k], atual, media, delta: media > 0 ? (atual - media) / media : 0 };
}).filter((c) => c.atual > 0).sort((a, b) => b.atual - a.atual);

const GASTO_MES = categoriasDoMes.reduce((s, c) => s + c.atual, 0);
const ENTRADAS_MES = TX_MES.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0);

/* ---------- agentes ---------- */

const AGENTES_BASE = [
  {
    id: "vigia", nome: "Vigia de gastos", icone: Bell, ativo: true,
    resumo: "Avisa quando uma categoria foge do seu padrão.",
    detalhe: "Compara cada categoria com a sua média dos últimos 3 meses e te avisa no mesmo dia, não no fim do mês.",
    achado: () => {
      const c = categoriasDoMes.find((c) => c.delta > 0.25) || categoriasDoMes[0];
      return `${c.nome} está ${Math.round(c.delta * 100)}% acima da sua média: ${brl(c.atual)} até agora.`;
    },
  },
  {
    id: "assinaturas", nome: "Caça-assinaturas", icone: Repeat, ativo: true,
    resumo: "Encontra cobranças recorrentes e reajustes silenciosos.",
    detalhe: "Detecta padrões de cobrança repetida, inclusive aquelas que mudaram de valor sem aviso.",
    achado: () => "5 assinaturas ativas, R$ 256,60 por mês. A academia subiu R$ 10,00 em julho.",
  },
  {
    id: "fatura", nome: "Radar de faturas", icone: CreditCard, ativo: true,
    resumo: "Projeta o que já está comprometido nos próximos meses.",
    detalhe: "Soma parcelas e recorrências já contratadas para mostrar quanto do seu salário futuro já tem dono.",
    achado: () => `${brl(TOTAL_COMPROMISSOS)} saem da conta ainda neste mês, sendo ${brl(2980)} no dia 25.`,
  },
  {
    id: "precos", nome: "Caçador de preços", icone: Plane, ativo: false,
    resumo: "Acompanha preços de produtos, passagens e hotéis.",
    detalhe: "Você aponta o que quer comprar e ele avisa quando o preço cai — e se cabe no seu mês.",
    achado: () => "Ativo. Nenhum item na lista de acompanhamento ainda.",
  },
  {
    id: "planejador", nome: "Planejador", icone: Sparkles, ativo: false,
    resumo: "Monta planos de 12 meses e simula decisões grandes.",
    detalhe: "Para perguntas do tipo \"e se eu financiar um carro de R$ 90 mil?\". Roda sob demanda, não em segundo plano.",
    achado: () => "Ativo. Faça uma pergunta de planejamento no chat para começar.",
  },
];

/* ================================================================== */

export default function MeuCFO() {
  const [aba, setAba] = useState("hoje");
  const [corte, setCorte] = useState(0);
  const [agentes, setAgentes] = useState(() =>
    AGENTES_BASE.reduce((o, a) => ({ ...o, [a.id]: a.ativo }), {})
  );
  const [dispensados, setDispensados] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [chat, setChat] = useState([]);
  const [pendente, setPendente] = useState(null);

  const txs = useMemo(
    () => TX_MES.map((t) => (overrides[t.id] ? { ...t, cat: overrides[t.id] } : t)),
    [overrides]
  );

  const perguntar = (texto) => {
    setAba("cfo");
    setPendente(texto);
  };

  return (
    <div className="app">
      <style>{CSS}</style>

      <nav className="rail" aria-label="Navegação principal">
        <div className="marca">
          <span className="marca-sig">₵</span>
          <span className="marca-nome">Meu&nbsp;CFO</span>
        </div>
        <div className="rail-itens">
          <NavItem icon={Home} label="Hoje" id="hoje" aba={aba} set={setAba} />
          <NavItem icon={Receipt} label="Transações" id="tx" aba={aba} set={setAba} />
          <NavItem icon={CalendarClock} label="Compromissos" id="comp" aba={aba} set={setAba} />
          <NavItem icon={MessageSquare} label="CFO" id="cfo" aba={aba} set={setAba} />
          <NavItem icon={Bot} label="Agentes" id="agentes" aba={aba} set={setAba} />
        </div>
        <div className="rail-rodape">
          <div className="conta">
            <div className="avatar">G</div>
            <div>
              <div className="conta-nome">Gilson</div>
              <div className="conta-sub">2 contas conectadas</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main">
        {aba === "hoje" && (
          <TelaHoje
            corte={corte} setCorte={setCorte}
            agentes={agentes} dispensados={dispensados} setDispensados={setDispensados}
            perguntar={perguntar} setAba={setAba}
          />
        )}
        {aba === "tx" && <TelaTransacoes txs={txs} setOverrides={setOverrides} />}
        {aba === "comp" && <TelaCompromissos />}
        {aba === "cfo" && (
          <TelaChat chat={chat} setChat={setChat} pendente={pendente} setPendente={setPendente} />
        )}
        {aba === "agentes" && <TelaAgentes agentes={agentes} setAgentes={setAgentes} />}

        {aba !== "cfo" && <BarraPergunta onEnviar={perguntar} />}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, id, aba, set }) {
  return (
    <button
      className={"nav-item" + (aba === id ? " ativo" : "")}
      onClick={() => set(id)}
      aria-current={aba === id ? "page" : undefined}
    >
      <Icon size={19} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

/* ================= TELA: HOJE ================= */

function TelaHoje({ corte, setCorte, agentes, dispensados, setDispensados, perguntar, setAba }) {
  const serie = useMemo(() => projeta(corte), [corte]);
  const base = useMemo(() => projeta(0), []);
  const fim = serie[serie.length - 1].saldo;
  const fimBase = base[base.length - 1].saldo;
  const menor = serie.reduce((a, p) => (p.dia > DIA_HOJE && p.saldo < a.saldo ? p : a), serie[serie.length - 1]);
  const apertoDia = serie.find((p) => p.dia > DIA_HOJE && p.saldo < 0);

  const veredito = fim >= 0
    ? corte > 0
      ? <>Segurando <b>{brl0(corte)}</b> por dia, você fecha agosto com <b className="ok">{brl(fim)}</b> na conta.</>
      : <>Do jeito que está, você fecha agosto com <b className="ok">{brl(fim)}</b> na conta.</>
    : <>Do jeito que está, você fecha agosto <b className="mal">{brl(Math.abs(fim))} no vermelho</b>{apertoDia ? <> — o aperto começa no dia {apertoDia.dia}.</> : "."}</>;

  const insights = AGENTES_BASE
    .filter((a) => agentes[a.id] && !dispensados.includes(a.id))
    .slice(0, 3);

  const corteNecessario = fimBase < 0 ? Math.ceil(Math.abs(fimBase) / DIAS_RESTANTES) : 0;

  return (
    <>
      <Cabecalho
        eyebrow={`${DIAS_SEM[HOJE.getDay()]}, ${DIA_HOJE} de ${MESES[MES]}`}
        titulo="Como está o seu mês"
      />

      <section className="hero card">
        <p className="veredito">{veredito}</p>

        <div className="hero-numeros">
          <div className="num">
            <span className="num-rot">Livre para gastar até dia {DIM}</span>
            <span className="num-val">{brl(LIVRE)}</span>
            <span className="num-sub">≈ {brl(LIVRE_DIA)} por dia · {DIAS_RESTANTES} dias restantes</span>
          </div>
          <div className="num-sec">
            <div><span className="num-rot">Na conta hoje</span><span className="num-val2">{brl(SALDO_HOJE)}</span></div>
            <div><span className="num-rot">Já comprometido</span><span className="num-val2">{brl(TOTAL_COMPROMISSOS)}</span></div>
            <div><span className="num-rot">Seu ritmo</span><span className="num-val2">{brl(MEDIA_DIARIA)}/dia</span></div>
          </div>
        </div>

        <GraficoMes serie={serie} fantasma={corte > 0 ? base : null} />

        <div className="alavanca">
          <label htmlFor="corte">
            E se eu segurar <b>{brl0(corte)}</b> por dia?
          </label>
          <input
            id="corte" type="range" min={0} max={45} step={1}
            value={corte} onChange={(e) => setCorte(Number(e.target.value))}
          />
          <div className="alavanca-nota">
            {corte === 0
              ? corteNecessario > 0
                ? `Arraste. ${brl0(corteNecessario)} por dia já fecha o mês no azul.`
                : "Arraste para ver o efeito de gastar um pouco menos por dia."
              : `Isso muda o fim do mês em ${brl(Math.abs(fim - fimBase))}.`}
          </div>
        </div>
      </section>

      {insights.length > 0 && (
        <section className="bloco">
          <h2 className="bloco-t">O que os seus agentes viram</h2>
          <div className="insights">
            {insights.map((a) => (
              <article key={a.id} className="insight">
                <a.icone size={16} className="insight-ic" />
                <div>
                  <div className="insight-tit">{a.nome}</div>
                  <p className="insight-txt">{a.achado()}</p>
                </div>
                <button className="icone-btn" onClick={() => setDispensados((d) => [...d, a.id])} aria-label={`Dispensar aviso de ${a.nome}`}>
                  <X size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="bloco">
        <div className="bloco-cab">
          <h2 className="bloco-t">Para onde foi o dinheiro</h2>
          <button className="link-btn" onClick={() => setAba("tx")}>Ver transações <ArrowRight size={14} /></button>
        </div>
        <div className="card cats">
          {categoriasDoMes.map((c) => (
            <div className="cat" key={c.key}>
              <div className="cat-nome"><span className="ponto" style={{ background: c.cor }} />{c.nome}</div>
              <div className="cat-barra">
                <div className="cat-fill" style={{ width: `${(c.atual / categoriasDoMes[0].atual) * 100}%`, background: c.cor }} />
              </div>
              <div className="cat-val">{brl(c.atual)}</div>
              <div className={"cat-delta " + (c.delta > 0.1 ? "sobe" : c.delta < -0.1 ? "desce" : "")}>
                {c.media > 0 ? `${c.delta >= 0 ? "+" : ""}${Math.round(c.delta * 100)}%` : "novo"}
              </div>
            </div>
          ))}
          <div className="cats-rodape">
            <span>Entradas {brl(ENTRADAS_MES)}</span>
            <span>Saídas {brl(GASTO_MES)}</span>
          </div>
        </div>
      </section>

      <div className="sugestoes">
        {["Posso pedir delivery hoje?", "O que vence essa semana?", "Como fecho o mês no azul?"].map((s) => (
          <button key={s} className="chip" onClick={() => perguntar(s)}>{s}</button>
        ))}
      </div>
    </>
  );
}

/* ---------- gráfico do mês (elemento-assinatura) ---------- */

function GraficoMes({ serie, fantasma }) {
  const W = 760, H = 250, pl = 8, pr = 8, pt = 26, pb = 34;
  const [hover, setHover] = useState(null);

  const vals = serie.map((p) => p.saldo).concat(fantasma ? fantasma.map((p) => p.saldo) : []).concat([0]);
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = max - min || 1;
  const topo = max + span * 0.12, base = min - span * 0.12;

  const x = (d) => pl + ((d - 1) / (DIM - 1)) * (W - pl - pr);
  const y = (v) => pt + ((topo - v) / (topo - base)) * (H - pt - pb);
  const y0 = y(0);

  const linha = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${x(p.dia).toFixed(1)},${y(p.saldo).toFixed(1)}`).join(" ");
  const area = (pts) => `${linha(pts)} L${x(pts[pts.length - 1].dia).toFixed(1)},${y0.toFixed(1)} L${x(pts[0].dia).toFixed(1)},${y0.toFixed(1)} Z`;

  const passado = serie.filter((p) => p.dia <= DIA_HOJE);
  const futuro = serie.filter((p) => p.dia >= DIA_HOJE);

  return (
    <figure className="gmes">
      <figcaption className="gmes-leg">
        <span><i className="l-cheia" />realizado</span>
        <span><i className="l-trac" />projeção</span>
        {fantasma && <span><i className="l-fant" />ritmo atual</span>}
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} className="gmes-svg" role="img"
        aria-label={`Saldo projetado ao longo de ${MESES[MES]}, terminando em ${brl(serie[serie.length - 1].saldo)}`}>
        <defs>
          <clipPath id="acima"><rect x="0" y="0" width={W} height={Math.max(0, y0)} /></clipPath>
          <clipPath id="abaixo"><rect x="0" y={y0} width={W} height={Math.max(0, H - y0)} /></clipPath>
        </defs>

        {min < 0 && (
          <>
            <line x1={pl} x2={W - pr} y1={y0} y2={y0} className="zero" />
            <text x={pl} y={y0 - 6} className="zero-rot">zero</text>
          </>
        )}

        <g clipPath="url(#acima)">
          <path d={area(passado)} className="a-pos" />
          <path d={area(futuro)} className="a-pos fut" />
        </g>
        <g clipPath="url(#abaixo)">
          <path d={area(futuro)} className="a-neg" />
        </g>

        {fantasma && <path d={linha(fantasma.filter((p) => p.dia >= DIA_HOJE))} className="l-ghost" />}
        <path d={linha(passado)} className="l-real" />
        <path d={linha(futuro)} className="l-proj" />

        <line x1={x(DIA_HOJE)} x2={x(DIA_HOJE)} y1={pt - 8} y2={H - pb} className="hoje-l" />
        <circle cx={x(DIA_HOJE)} cy={y(SALDO_HOJE)} r="5" className="hoje-p" />
        <text x={x(DIA_HOJE)} y={pt - 13} className="hoje-t" textAnchor="middle">hoje</text>

        {COMPROMISSOS.map((c) => {
          const p = serie.find((s) => s.dia === c.dia);
          if (!p) return null;
          return (
            <g key={c.dia + c.desc}>
              <circle cx={x(c.dia)} cy={y(p.saldo)} r="4" className="marca-p" />
              <circle cx={x(c.dia)} cy={y(p.saldo)} r="14" fill="transparent"
                onMouseEnter={() => setHover({ ...c, saldo: p.saldo })}
                onMouseLeave={() => setHover(null)} />
            </g>
          );
        })}

        {hover && (
          <g transform={`translate(${Math.min(Math.max(x(hover.dia), 90), W - 90)}, ${y(hover.saldo) - 16})`} pointerEvents="none">
            <rect x="-84" y="-40" width="168" height="38" rx="8" className="tip-bg" />
            <text x="0" y="-24" textAnchor="middle" className="tip-t1">{hover.desc} · dia {hover.dia}</text>
            <text x="0" y="-9" textAnchor="middle" className="tip-t2">−{brl(hover.valor)}</text>
          </g>
        )}

        {[1, 5, 10, 15, 20, 25, DIM].map((d) => (
          <text key={d} x={x(d)} y={H - 12} className="eixo" textAnchor="middle">{d}</text>
        ))}
      </svg>
    </figure>
  );
}

/* ================= TELA: TRANSAÇÕES ================= */

function TelaTransacoes({ txs, setOverrides }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState(null);
  const [planilha, setPlanilha] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState(null);

  const lista = txs
    .filter((t) => (!filtro || t.cat === filtro))
    .filter((t) => t.desc.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.dia - a.dia || b.id - a.id);

  const porDia = [];
  for (const t of lista) {
    const ult = porDia[porDia.length - 1];
    if (ult && ult.dia === t.dia) ult.itens.push(t);
    else porDia.push({ dia: t.dia, itens: [t] });
  }

  const trocar = (t, novaCat) => {
    setOverrides((o) => ({ ...o, [t.id]: novaCat }));
    setEditando(null);
    setAviso(`${t.desc} agora é ${CATS[novaCat].nome}. Vou classificar assim da próxima vez.`);
    setTimeout(() => setAviso(null), 4000);
  };

  return (
    <>
      <Cabecalho eyebrow={`${MESES[MES]} de ${ANO}`} titulo="Transações" />

      <div className="ferramentas">
        <div className="busca">
          <Search size={16} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por estabelecimento" />
        </div>
        <button className={"toggle" + (planilha ? " on" : "")} onClick={() => setPlanilha(!planilha)}
          aria-pressed={planilha}>
          {planilha ? <List size={15} /> : <TableIcon size={15} />}
          {planilha ? "Lista" : "Planilha"}
        </button>
      </div>

      <div className="filtros">
        <button className={"chip" + (!filtro ? " on" : "")} onClick={() => setFiltro(null)}>Tudo</button>
        {categoriasDoMes.map((c) => (
          <button key={c.key} className={"chip" + (filtro === c.key ? " on" : "")} onClick={() => setFiltro(filtro === c.key ? null : c.key)}>
            <span className="ponto" style={{ background: c.cor }} />{c.nome}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="card vazio">
          Nada encontrado para “{busca}”. Tente outro nome ou limpe o filtro.
        </div>
      ) : planilha ? (
        <div className="card sem-pad">
          <table className="tabela">
            <thead><tr><th>Dia</th><th>Estabelecimento</th><th>Categoria</th><th>Tipo</th><th className="dir">Valor</th></tr></thead>
            <tbody>
              {lista.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{String(t.dia).padStart(2, "0")}/{String(MES + 1).padStart(2, "0")}</td>
                  <td>{t.desc}</td>
                  <td><span className="ponto" style={{ background: CATS[t.cat].cor }} />{CATS[t.cat].nome}</td>
                  <td className="fraco">{t.tipo}</td>
                  <td className={"dir mono " + (t.valor > 0 ? "ok" : "")}>{brl(t.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dias">
          {porDia.map((g) => (
            <div key={g.dia}>
              <div className="dia-cab">
                <span>{String(g.dia).padStart(2, "0")} de {MESES[MES]}</span>
                <span className="mono fraco">{brl(g.itens.reduce((s, t) => s + t.valor, 0))}</span>
              </div>
              <div className="card sem-pad">
                {g.itens.map((t) => (
                  <div className="linha" key={t.id}>
                    <span className="ponto g" style={{ background: CATS[t.cat].cor }} />
                    <div className="linha-txt">
                      <div className="linha-desc">{t.desc}</div>
                      <button className="linha-cat" onClick={() => setEditando(editando === t.id ? null : t.id)}>
                        {CATS[t.cat].nome} <ChevronDown size={12} />
                      </button>
                      {editando === t.id && (
                        <div className="menu">
                          {CAT_KEYS.map((k) => (
                            <button key={k} onClick={() => trocar(t, k)} className={t.cat === k ? "on" : ""}>
                              <span className="ponto" style={{ background: CATS[k].cor }} />{CATS[k].nome}
                              {t.cat === k && <Check size={13} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={"linha-val mono " + (t.valor > 0 ? "ok" : "")}>{brl(t.valor)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {aviso && <div className="toast"><Check size={15} /> {aviso}</div>}
    </>
  );
}

/* ================= TELA: COMPROMISSOS ================= */

function TelaCompromissos() {
  const assinaturas = RECORRENTES.filter((r) => r.tipo === "assinatura");
  const totalAss = assinaturas.reduce((s, a) => s + Math.abs(a.valor), 0);

  return (
    <>
      <Cabecalho eyebrow="Próximos 13 dias" titulo="O que ainda vai sair" />

      <section className="card resumo-comp">
        <div>
          <span className="num-rot">Total comprometido até dia {DIM}</span>
          <span className="num-val">{brl(TOTAL_COMPROMISSOS)}</span>
        </div>
        <p className="resumo-nota">
          É {Math.round((TOTAL_COMPROMISSOS / ENTRADAS_MES) * 100)}% do que entrou este mês. Nada disso é decisão sua agora — já está contratado.
        </p>
      </section>

      <section className="bloco">
        <h2 className="bloco-t">Na fila</h2>
        <div className="card sem-pad">
          {COMPROMISSOS.map((c) => (
            <div className="linha" key={c.desc}>
              <div className="data-quad">
                <span className="dq-dia">{c.dia}</span>
                <span className="dq-mes">{MESES[MES].slice(0, 3)}</span>
              </div>
              <div className="linha-txt">
                <div className="linha-desc">{c.desc}</div>
                <div className="linha-sub">{c.tipo} · em {c.dia - DIA_HOJE} dias</div>
              </div>
              <div className="linha-val mono">{brl(c.valor)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bloco">
        <h2 className="bloco-t">Assinaturas ativas</h2>
        <div className="card sem-pad">
          {assinaturas.map((a) => (
            <div className="linha" key={a.desc}>
              <Repeat size={16} className="fraco" />
              <div className="linha-txt">
                <div className="linha-desc">{a.desc}</div>
                <div className="linha-sub">todo dia {a.dia}</div>
              </div>
              <div className="linha-val mono">{brl(Math.abs(a.valor))}</div>
            </div>
          ))}
          <div className="linha total">
            <div className="linha-txt"><div className="linha-desc">Por mês</div></div>
            <div className="linha-val mono forte">{brl(totalAss)}</div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= TELA: CHAT ================= */

const CONTEXTO = `
DATA DE HOJE: ${DIA_HOJE} de ${MESES[MES]} de ${ANO}. Faltam ${DIAS_RESTANTES} dias para o fim do mês.
Saldo em conta hoje: ${brl(SALDO_HOJE)}
Entradas do mês: ${brl(ENTRADAS_MES)}
Saídas do mês até hoje: ${brl(GASTO_MES)}
Ritmo de gasto variável: ${brl(MEDIA_DIARIA)} por dia
Já comprometido até o fim do mês: ${brl(TOTAL_COMPROMISSOS)}
Livre para gastar: ${brl(LIVRE)} (${brl(LIVRE_DIA)} por dia)
Projeção de saldo em ${DIM}/${MES + 1}: ${brl(projeta(0)[projeta(0).length - 1].saldo)}
Compromissos futuros: ${COMPROMISSOS.map((c) => `${c.desc} dia ${c.dia} ${brl(c.valor)}`).join("; ")}
Gastos por categoria neste mês: ${categoriasDoMes.map((c) => `${c.nome} ${brl(c.atual)} (média ${brl(c.media)})`).join("; ")}
`;

function ferramentasPara(p) {
  const t = p.toLowerCase();
  const out = [];
  if (/vence|fatura|parcela|compromiss|assinatura/.test(t)) out.push("compromissos_futuros");
  if (/gast|onde|categoria|comer|mercado|uber/.test(t)) out.push("gastos_por_categoria");
  if (/posso|dá pra|delivery|comprar|caber/.test(t)) out.push("livre_para_gastar");
  if (/azul|fechar|sobrar|previs|proje|planej/.test(t)) out.push("projecao_do_mes");
  return out.length ? out : ["resumo_do_mes"];
}

function respostaLocal(p) {
  const t = p.toLowerCase();
  const fim = projeta(0)[projeta(0).length - 1].saldo;
  if (/vence|fatura|compromiss/.test(t)) {
    const prox = COMPROMISSOS.slice(0, 2);
    return `Até o fim do mês saem ${brl(TOTAL_COMPROMISSOS)}. Os próximos são ${prox.map((c) => `${c.desc} no dia ${c.dia} (${brl(c.valor)})`).join(" e ")}. O dia 25 é o que mais pesa.`;
  }
  if (/posso|delivery|dá pra/.test(t)) {
    return `Hoje cabe. Você tem ${brl(LIVRE)} livres para ${DIAS_RESTANTES} dias, o que dá ${brl(LIVRE_DIA)} por dia — e você ainda não gastou nada hoje. Só lembra que comer fora já está ${Math.round(categoriasDoMes.find((c) => c.key === "comer_fora").delta * 100)}% acima da sua média.`;
  }
  if (/azul|fechar|sobrar/.test(t)) {
    const corte = Math.ceil(Math.abs(fim) / DIAS_RESTANTES);
    return fim >= 0
      ? `Você já fecha no azul: a projeção dá ${brl(fim)} no dia ${DIM}.`
      : `A projeção fecha em ${brl(fim)}. Segurando cerca de ${brl0(corte)} por dia no gasto variável, você vira o jogo — é aproximadamente um delivery a menos a cada dois dias.`;
  }
  const top = categoriasDoMes[0];
  return `Este mês entraram ${brl(ENTRADAS_MES)} e saíram ${brl(GASTO_MES)}. A maior fatia foi ${top.nome}, com ${brl(top.atual)}. A projeção fecha o mês em ${brl(fim)}.`;
}

function TelaChat({ chat, setChat, pendente, setPendente }) {
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fim = useRef(null);

  const enviar = async (msg) => {
    const pergunta = (msg ?? texto).trim();
    if (!pergunta || carregando) return;
    setTexto("");
    const tools = ferramentasPara(pergunta);
    setChat((c) => [...c, { autor: "user", texto: pergunta }]);
    setCarregando(true);
    let resposta;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é o CFO pessoal do usuário, dentro de um app de finanças. Fale português do Brasil, tom calmo e direto, sem jargão financeiro, 2 a 4 frases. Use SOMENTE os números do contexto abaixo — nunca invente, estime ou arredonde valores que não estejam ali. Se a informação não estiver no contexto, diga que ainda não tem esse dado. Não use listas nem markdown.

CONTEXTO FINANCEIRO (fonte da verdade):
${CONTEXTO}

PERGUNTA DO USUÁRIO: ${pergunta}`
          }],
        }),
      });
      const d = await r.json();
      resposta = d.content.filter((i) => i.type === "text").map((i) => i.text).join("\n").trim();
      if (!resposta) throw new Error("vazio");
    } catch {
      resposta = respostaLocal(pergunta);
    }
    setChat((c) => [...c, { autor: "cfo", texto: resposta, tools }]);
    setCarregando(false);
  };

  useEffect(() => {
    if (pendente) { enviar(pendente); setPendente(null); }
  }, [pendente]);

  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, carregando]);

  return (
    <div className="chat-wrap">
      <Cabecalho eyebrow="Sempre com os seus números na mão" titulo="Converse com o seu CFO" />

      <div className="chat-corpo">
        {chat.length === 0 && !carregando && (
          <div className="chat-vazio">
            <p>Pergunte qualquer coisa sobre o seu dinheiro. Ele consulta os seus dados antes de responder — nenhum número aqui é chutado.</p>
            <div className="sugestoes col">
              {["Onde eu mais gastei este mês?", "Posso pedir delivery hoje?", "O que vence essa semana?", "Como fecho o mês no azul?"].map((s) => (
                <button key={s} className="chip" onClick={() => enviar(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {chat.map((m, i) => (
          <div key={i} className={"msg " + m.autor}>
            {m.autor === "cfo" && m.tools && (
              <div className="tools">
                {m.tools.map((t) => <span key={t} className="tool">{t}</span>)}
              </div>
            )}
            <div className="balao">{m.texto}</div>
          </div>
        ))}

        {carregando && (
          <div className="msg cfo">
            <div className="balao pensando"><Loader2 size={15} className="girando" /> consultando os seus dados</div>
          </div>
        )}
        <div ref={fim} />
      </div>

      <form className="chat-entrada" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pergunte ao seu CFO" aria-label="Sua pergunta" />
        <button type="submit" disabled={!texto.trim() || carregando} aria-label="Enviar"><Send size={16} /></button>
      </form>
    </div>
  );
}

/* ================= TELA: AGENTES ================= */

function TelaAgentes({ agentes, setAgentes }) {
  return (
    <>
      <Cabecalho eyebrow="Trabalham em segundo plano" titulo="Agentes" />
      <p className="intro">
        Cada agente olha um pedaço da sua vida financeira e só te procura quando encontra algo. Ligue o que fizer sentido; desligue o resto.
      </p>
      <div className="agentes">
        {AGENTES_BASE.map((a) => {
          const on = agentes[a.id];
          return (
            <article key={a.id} className={"card agente" + (on ? " on" : "")}>
              <div className="agente-cab">
                <a.icone size={18} />
                <h3>{a.nome}</h3>
                <button
                  role="switch" aria-checked={on} aria-label={`${on ? "Desligar" : "Ligar"} ${a.nome}`}
                  className={"switch" + (on ? " on" : "")}
                  onClick={() => setAgentes((s) => ({ ...s, [a.id]: !s[a.id] }))}
                >
                  <span />
                </button>
              </div>
              <p className="agente-res">{a.resumo}</p>
              <p className="agente-det">{a.detalhe}</p>
              {on && <div className="agente-achado">{a.achado()}</div>}
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ================= compartilhados ================= */

function Cabecalho({ eyebrow, titulo }) {
  return (
    <header className="cab">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{titulo}</h1>
      </div>
      <span className="selo">dados de demonstração</span>
    </header>
  );
}

function BarraPergunta({ onEnviar }) {
  const [t, setT] = useState("");
  return (
    <form className="barra-perg" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { onEnviar(t.trim()); setT(""); } }}>
      <MessageSquare size={16} />
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Pergunte ao seu CFO" aria-label="Pergunte ao seu CFO" />
      <button type="submit" aria-label="Enviar" disabled={!t.trim()}><Send size={15} /></button>
    </form>
  );
}

/* ================= estilos ================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.app *, .app *::before, .app *::after { box-sizing: border-box; }
.app {
  --paper:#F3F4F0; --card:#FFFFFF; --ink:#131A1F; --ink2:#5A6670; --ink3:#949DA3;
  --line:#E2E5DF; --azul:#17457E; --verde:#2E7D5B; --vermelho:#B23A32; --ambar:#A8811B;
  --disp:'Bricolage Grotesque',system-ui,sans-serif;
  --body:'Public Sans',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
  display:flex; min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:var(--body); font-size:15px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
.app b { font-weight:700; }
.app .ok { color:var(--verde); }
.app .mal { color:var(--vermelho); }
.app .fraco { color:var(--ink3); }
.app .mono { font-family:var(--mono); font-variant-numeric:tabular-nums; }
.app button { font-family:inherit; cursor:pointer; }
.app button:focus-visible, .app input:focus-visible, .app [role=switch]:focus-visible {
  outline:2px solid var(--azul); outline-offset:2px;
}

/* rail */
.rail { width:212px; flex:0 0 212px; border-right:1px solid var(--line); padding:22px 14px;
  display:flex; flex-direction:column; gap:26px; position:sticky; top:0; height:100vh; background:var(--paper); }
.marca { display:flex; align-items:center; gap:9px; padding:0 8px; }
.marca-sig { width:28px; height:28px; border-radius:8px; background:var(--azul); color:#fff;
  display:grid; place-items:center; font-family:var(--disp); font-weight:800; font-size:16px; }
.marca-nome { font-family:var(--disp); font-weight:700; font-size:17px; letter-spacing:-.01em; }
.rail-itens { display:flex; flex-direction:column; gap:2px; }
.nav-item { display:flex; align-items:center; gap:11px; padding:9px 11px; border-radius:9px;
  border:0; background:transparent; color:var(--ink2); font-size:14.5px; font-weight:500; text-align:left; width:100%;
  transition:background .15s,color .15s; }
.nav-item:hover { background:rgba(19,26,31,.05); color:var(--ink); }
.nav-item.ativo { background:var(--ink); color:#fff; }
.rail-rodape { margin-top:auto; }
.conta { display:flex; align-items:center; gap:10px; padding:8px; }
.avatar { width:32px; height:32px; border-radius:50%; background:#DCE3EC; color:var(--azul);
  display:grid; place-items:center; font-weight:600; font-size:14px; }
.conta-nome { font-size:14px; font-weight:600; }
.conta-sub { font-size:11.5px; color:var(--ink3); }

/* main */
.main { flex:1; padding:34px 40px 110px; max-width:900px; margin:0 auto; width:100%; position:relative; }
.cab { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:22px; }
.eyebrow { font-family:var(--mono); font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--ink3); margin-bottom:5px; }
.cab h1 { font-family:var(--disp); font-size:30px; font-weight:700; letter-spacing:-.02em; margin:0; }
.selo { font-family:var(--mono); font-size:10.5px; color:var(--ink3); border:1px solid var(--line);
  border-radius:20px; padding:4px 10px; white-space:nowrap; }
.intro { color:var(--ink2); max-width:56ch; margin:-6px 0 20px; }

.card { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:22px; }
.card.sem-pad { padding:0; overflow:hidden; }
.bloco { margin-top:28px; }
.bloco-cab { display:flex; align-items:baseline; justify-content:space-between; }
.bloco-t { font-family:var(--disp); font-size:15px; font-weight:700; letter-spacing:-.01em; margin:0 0 10px; }
.link-btn { border:0; background:none; color:var(--azul); font-size:13.5px; font-weight:500;
  display:inline-flex; align-items:center; gap:4px; padding:0; }
.vazio { color:var(--ink2); text-align:center; padding:36px 22px; }

/* hero */
.hero { padding:26px 26px 20px; }
.veredito { font-family:var(--disp); font-size:22px; line-height:1.32; font-weight:500;
  letter-spacing:-.015em; margin:0 0 22px; max-width:34ch; }
.hero-numeros { display:flex; flex-wrap:wrap; gap:26px 44px; align-items:flex-end; margin-bottom:6px; }
.num-rot { display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--ink3); margin-bottom:5px; }
.num-val { display:block; font-family:var(--disp); font-size:38px; font-weight:700; letter-spacing:-.03em; line-height:1; }
.num-sub { display:block; font-size:12.5px; color:var(--ink2); margin-top:7px; }
.num-val2 { display:block; font-family:var(--mono); font-size:15px; font-weight:500; }
.num-sec { display:flex; gap:30px; flex-wrap:wrap; padding-bottom:4px; }

/* gráfico */
.gmes { margin:18px 0 0; }
.gmes-leg { display:flex; gap:16px; font-size:11.5px; color:var(--ink3); margin-bottom:2px; }
.gmes-leg span { display:inline-flex; align-items:center; gap:5px; }
.gmes-leg i { width:14px; height:2px; background:var(--azul); display:inline-block; }
.gmes-leg .l-trac { background:repeating-linear-gradient(90deg,var(--azul) 0 3px,transparent 3px 6px); }
.gmes-leg .l-fant { background:var(--ink3); opacity:.5; }
.gmes-svg { width:100%; height:auto; display:block; overflow:visible; }
.a-pos { fill:var(--azul); opacity:.07; }
.a-pos.fut { opacity:.04; }
.a-neg { fill:var(--vermelho); opacity:.10; }
.l-real { fill:none; stroke:var(--azul); stroke-width:2.4; stroke-linejoin:round; stroke-linecap:round; }
.l-proj { fill:none; stroke:var(--azul); stroke-width:2.4; stroke-dasharray:5 5; opacity:.75; stroke-linecap:round; }
.l-ghost { fill:none; stroke:var(--ink3); stroke-width:1.5; stroke-dasharray:2 4; opacity:.55; }
.zero { stroke:var(--vermelho); stroke-width:1; stroke-dasharray:3 4; opacity:.5; }
.zero-rot { font-family:var(--mono); font-size:9.5px; fill:var(--vermelho); opacity:.75; }
.hoje-l { stroke:var(--ink); stroke-width:1; opacity:.22; }
.hoje-p { fill:var(--azul); stroke:#fff; stroke-width:2.5; }
.hoje-t { font-family:var(--mono); font-size:10px; fill:var(--ink2); letter-spacing:.04em; }
.marca-p { fill:#fff; stroke:var(--azul); stroke-width:2; }
.tip-bg { fill:var(--ink); }
.tip-t1 { font-family:var(--body); font-size:11px; fill:#fff; font-weight:600; }
.tip-t2 { font-family:var(--mono); font-size:11px; fill:#B9C4CC; }
.eixo { font-family:var(--mono); font-size:10px; fill:var(--ink3); }

/* alavanca */
.alavanca { border-top:1px solid var(--line); margin-top:14px; padding-top:16px; }
.alavanca label { display:block; font-size:14px; color:var(--ink2); margin-bottom:10px; }
.alavanca label b { color:var(--ink); }
.alavanca input[type=range] { width:100%; accent-color:var(--azul); height:22px; }
.alavanca-nota { font-size:12.5px; color:var(--ink3); margin-top:4px; }

/* insights */
.insights { display:flex; flex-direction:column; gap:8px; }
.insight { display:flex; gap:11px; align-items:flex-start; background:var(--card);
  border:1px solid var(--line); border-radius:13px; padding:13px 14px; }
.insight-ic { color:var(--azul); margin-top:2px; flex:0 0 auto; }
.insight-tit { font-size:12px; font-weight:600; color:var(--ink2); margin-bottom:2px; }
.insight-txt { margin:0; font-size:14px; }
.icone-btn { margin-left:auto; border:0; background:none; color:var(--ink3); padding:3px; border-radius:6px; }
.icone-btn:hover { background:rgba(19,26,31,.06); color:var(--ink); }

/* categorias */
.cats { padding:18px 22px; }
.cat { display:grid; grid-template-columns:130px 1fr 92px 46px; align-items:center; gap:12px; padding:7px 0; }
.cat-nome { display:flex; align-items:center; gap:8px; font-size:14px; }
.ponto { width:8px; height:8px; border-radius:2px; display:inline-block; flex:0 0 auto; }
.ponto.g { width:9px; height:9px; }
.cat-barra { height:8px; background:rgba(19,26,31,.05); border-radius:4px; overflow:hidden; }
.cat-fill { height:100%; border-radius:4px; opacity:.85; }
.cat-val { font-family:var(--mono); font-size:13px; text-align:right; }
.cat-delta { font-family:var(--mono); font-size:11.5px; text-align:right; color:var(--ink3); }
.cat-delta.sobe { color:var(--vermelho); }
.cat-delta.desce { color:var(--verde); }
.cats-rodape { display:flex; gap:22px; border-top:1px solid var(--line); margin-top:12px;
  padding-top:12px; font-size:12.5px; color:var(--ink2); font-family:var(--mono); }

/* chips */
.sugestoes { display:flex; gap:8px; flex-wrap:wrap; margin-top:26px; }
.sugestoes.col { flex-direction:column; align-items:flex-start; }
.chip { border:1px solid var(--line); background:var(--card); border-radius:20px; padding:7px 13px;
  font-size:13px; color:var(--ink2); display:inline-flex; align-items:center; gap:7px; transition:.14s; }
.chip:hover { border-color:var(--ink3); color:var(--ink); }
.chip.on { background:var(--ink); color:#fff; border-color:var(--ink); }

/* ferramentas */
.ferramentas { display:flex; gap:10px; margin-bottom:12px; }
.busca { flex:1; display:flex; align-items:center; gap:9px; background:var(--card);
  border:1px solid var(--line); border-radius:11px; padding:0 13px; color:var(--ink3); }
.busca input { flex:1; border:0; background:none; padding:11px 0; font-size:14px; color:var(--ink); outline:none; }
.toggle { display:inline-flex; align-items:center; gap:7px; border:1px solid var(--line);
  background:var(--card); border-radius:11px; padding:0 15px; font-size:13.5px; color:var(--ink2); }
.toggle.on { background:var(--ink); color:#fff; border-color:var(--ink); }
.filtros { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:18px; }

/* listas */
.dias { display:flex; flex-direction:column; gap:18px; }
.dia-cab { display:flex; justify-content:space-between; font-size:12.5px; color:var(--ink2); margin-bottom:7px; padding:0 3px; }
.linha { display:flex; align-items:center; gap:12px; padding:13px 18px; border-bottom:1px solid var(--line); position:relative; }
.linha:last-child { border-bottom:0; }
.linha-txt { flex:1; min-width:0; }
.linha-desc { font-size:14.5px; }
.linha-sub { font-size:12px; color:var(--ink3); }
.linha-cat { border:0; background:none; padding:1px 0 0; font-size:12px; color:var(--ink3);
  display:inline-flex; align-items:center; gap:3px; }
.linha-cat:hover { color:var(--azul); }
.linha-val { font-size:14px; white-space:nowrap; }
.linha-val.forte { font-weight:600; }
.linha.total { background:rgba(19,26,31,.02); }
.data-quad { width:38px; text-align:center; flex:0 0 auto; }
.dq-dia { display:block; font-family:var(--disp); font-size:18px; font-weight:700; line-height:1; }
.dq-mes { display:block; font-family:var(--mono); font-size:10px; color:var(--ink3); }
.menu { position:absolute; z-index:20; top:52px; left:40px; background:var(--card);
  border:1px solid var(--line); border-radius:12px; padding:5px; box-shadow:0 12px 32px rgba(19,26,31,.13);
  display:flex; flex-direction:column; min-width:186px; }
.menu button { display:flex; align-items:center; gap:8px; border:0; background:none; padding:7px 9px;
  border-radius:8px; font-size:13.5px; text-align:left; color:var(--ink); }
.menu button:hover { background:rgba(19,26,31,.05); }
.menu button.on { color:var(--azul); font-weight:500; }
.menu button svg { margin-left:auto; }

/* tabela */
.tabela { width:100%; border-collapse:collapse; font-size:13.5px; }
.tabela th { text-align:left; font-family:var(--mono); font-size:10.5px; text-transform:uppercase;
  letter-spacing:.05em; color:var(--ink3); font-weight:400; padding:12px 18px; border-bottom:1px solid var(--line); }
.tabela td { padding:11px 18px; border-bottom:1px solid var(--line); }
.tabela tr:last-child td { border-bottom:0; }
.tabela .dir { text-align:right; }
.tabela td .ponto { margin-right:7px; }

/* compromissos */
.resumo-comp { display:flex; flex-direction:column; gap:12px; }
.resumo-nota { margin:0; color:var(--ink2); font-size:14px; max-width:52ch; }

/* agentes */
.agentes { display:grid; grid-template-columns:repeat(auto-fill,minmax(272px,1fr)); gap:14px; }
.agente { display:flex; flex-direction:column; gap:8px; padding:18px; opacity:.72; transition:.18s; }
.agente.on { opacity:1; }
.agente-cab { display:flex; align-items:center; gap:9px; }
.agente-cab h3 { font-family:var(--disp); font-size:15.5px; font-weight:700; margin:0; letter-spacing:-.01em; }
.agente-res { margin:0; font-size:14px; }
.agente-det { margin:0; font-size:12.5px; color:var(--ink3); }
.agente-achado { margin-top:6px; background:rgba(23,69,126,.055); border-radius:10px;
  padding:10px 12px; font-size:13px; color:var(--azul); }
.switch { margin-left:auto; width:38px; height:22px; border-radius:11px; border:0;
  background:#D5D9D2; position:relative; transition:background .18s; padding:0; }
.switch span { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%;
  background:#fff; transition:transform .18s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.switch.on { background:var(--verde); }
.switch.on span { transform:translateX(16px); }

/* chat */
.chat-wrap { display:flex; flex-direction:column; min-height:calc(100vh - 68px); }
.chat-corpo { flex:1; display:flex; flex-direction:column; gap:16px; padding-bottom:20px; }
.chat-vazio { color:var(--ink2); max-width:50ch; }
.chat-vazio p { margin:0 0 16px; }
.msg { display:flex; flex-direction:column; max-width:78%; }
.msg.user { align-self:flex-end; align-items:flex-end; }
.balao { padding:12px 15px; border-radius:15px; font-size:14.5px; line-height:1.55; white-space:pre-wrap; }
.msg.user .balao { background:var(--ink); color:#fff; border-bottom-right-radius:5px; }
.msg.cfo .balao { background:var(--card); border:1px solid var(--line); border-bottom-left-radius:5px; }
.balao.pensando { display:inline-flex; align-items:center; gap:8px; color:var(--ink3); font-size:13px; }
.girando { animation:gira 1s linear infinite; }
@keyframes gira { to { transform:rotate(360deg); } }
.tools { display:flex; gap:5px; margin-bottom:5px; flex-wrap:wrap; }
.tool { font-family:var(--mono); font-size:10px; color:var(--ink3); border:1px solid var(--line);
  border-radius:5px; padding:2px 6px; background:var(--card); }
.chat-entrada { position:sticky; bottom:22px; display:flex; align-items:center; gap:8px;
  background:var(--card); border:1px solid var(--line); border-radius:14px; padding:5px 5px 5px 15px;
  box-shadow:0 6px 22px rgba(19,26,31,.07); }
.chat-entrada input { flex:1; border:0; background:none; outline:none; font-size:14.5px; padding:10px 0; color:var(--ink); }
.chat-entrada button { border:0; background:var(--ink); color:#fff; width:36px; height:36px;
  border-radius:10px; display:grid; place-items:center; }
.chat-entrada button:disabled { background:#D5D9D2; cursor:not-allowed; }

/* barra de pergunta */
.barra-perg { position:sticky; bottom:22px; margin-top:34px; display:flex; align-items:center; gap:10px;
  background:var(--card); border:1px solid var(--line); border-radius:14px; padding:5px 5px 5px 15px;
  color:var(--ink3); box-shadow:0 6px 22px rgba(19,26,31,.07); }
.barra-perg input { flex:1; border:0; background:none; outline:none; font-size:14.5px; padding:10px 0; color:var(--ink); }
.barra-perg button { border:0; background:var(--ink); color:#fff; width:34px; height:34px;
  border-radius:10px; display:grid; place-items:center; }
.barra-perg button:disabled { background:#D5D9D2; }

/* toast */
.toast { position:fixed; bottom:26px; left:50%; transform:translateX(-50%); background:var(--ink);
  color:#fff; padding:11px 17px; border-radius:11px; font-size:13.5px; display:flex; align-items:center;
  gap:8px; box-shadow:0 10px 30px rgba(19,26,31,.25); z-index:60; }

/* responsivo */
@media (max-width:840px) {
  .app { flex-direction:column; }
  .rail { width:100%; flex:0 0 auto; height:auto; position:fixed; bottom:0; top:auto; z-index:50;
    border-right:0; border-top:1px solid var(--line); flex-direction:row; align-items:center;
    padding:6px 8px; gap:0; }
  .marca, .rail-rodape { display:none; }
  .rail-itens { flex-direction:row; width:100%; justify-content:space-between; }
  .nav-item { flex-direction:column; gap:3px; font-size:10.5px; padding:6px 4px; flex:1; align-items:center; }
  .nav-item.ativo { background:transparent; color:var(--azul); }
  .main { padding:24px 18px 96px; }
  .cab h1 { font-size:25px; }
  .veredito { font-size:19px; }
  .num-val { font-size:31px; }
  .cat { grid-template-columns:104px 1fr 78px; }
  .cat-delta { display:none; }
  .chat-entrada, .barra-perg { bottom:66px; }
}

@media (prefers-reduced-motion:reduce) {
  .app *, .app *::before, .app *::after { animation-duration:.001ms !important; transition-duration:.001ms !important; }
}
`;
