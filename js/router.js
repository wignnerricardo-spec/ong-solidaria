/**
 * ONG Solidária — roteador da SPA (hash-based).
 *
 * Não usa History API porque o projeto é hospedado como arquivo estático
 * simples, sem servidor para reescrever rotas: `#/rota` funciona em qualquer
 * lugar, inclusive abrindo o index.html diretamente do disco.
 *
 * Formato aceito: "#/", "#/projetos", "#/cadastro" e, opcionalmente, uma
 * "âncora" depois de outra barra (ex.: "#/projetos/mesa-solidaria") para
 * pousar direto em um projeto específico da lista.
 */

import {
  renderHome,
  renderProjetos,
  renderCadastro,
  renderNaoEncontrada,
} from "./templates.js";
import { initNavegacao, atualizarAriaCurrent } from "./navegacao.js";
import { initModalGlobal, ligarAbrirModalTermos } from "./componentes.js";
import { initCadastro } from "./formularios.js";
import { initGraficoImpacto } from "./graficos.js";

const elementoApp = document.getElementById("app");

/** Cada rota sabe renderizar sua própria view e, se precisar, "hidratar"
 *  (religar os event listeners) o HTML recém-injetado — já que innerHTML
 *  não preserva nenhum listener anterior. */
const ROTAS = {
  "": {
    titulo: "Início",
    render: renderHome,
    hidratar(raiz) {
      initGraficoImpacto(raiz);
    },
  },
  projetos: {
    titulo: "Nossos Projetos",
    render: renderProjetos,
  },
  cadastro: {
    titulo: "Cadastro de Voluntário(a)",
    render: renderCadastro,
    hidratar(raiz) {
      initCadastro(raiz);
      ligarAbrirModalTermos();
    },
  },
};

function analisarHash() {
  const bruto = window.location.hash.replace(/^#\/?/, "");
  const partes = bruto.split("/").filter(Boolean);
  return {
    rota: partes[0] || "",
    ancora: partes.length > 1 ? partes.slice(1).join("-") : null,
  };
}

/** Depois de renderizar, move o foco para a âncora pedida (se existir) ou
 *  para o <h1> da view, e rola a página — assim leitores de tela anunciam a
 *  nova "página" e o usuário de teclado não fica com o foco perdido no
 *  corpo do documento, como aconteceria numa SPA sem esse cuidado. */
function moverFocoEfoco(ancora) {
  let alvo = ancora ? document.getElementById(ancora) : null;
  if (!alvo) alvo = elementoApp.querySelector("h1");
  if (!alvo) return;

  if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
  alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  alvo.focus({ preventScroll: true });
}

function renderizar() {
  const { rota, ancora } = analisarHash();
  const definicao = ROTAS[rota];

  elementoApp.innerHTML = definicao ? definicao.render() : renderNaoEncontrada();
  document.title = definicao
    ? `Mãos que Ajudam — ${definicao.titulo}`
    : "Mãos que Ajudam — Página não encontrada";

  atualizarAriaCurrent(rota);

  if (definicao && typeof definicao.hidratar === "function") {
    definicao.hidratar(elementoApp);
  }

  moverFocoEfoco(ancora);
}

export function iniciarRoteador() {
  initNavegacao();
  initModalGlobal();
  window.addEventListener("hashchange", renderizar);
  renderizar();
}
