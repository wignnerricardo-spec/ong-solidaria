/**
 * ONG Solidária — menu de navegação (desktop e mobile) e indicação da
 * rota atual.
 *
 * O cabeçalho é parte fixa da SPA (não é reinjetado a cada rota), então
 * `initNavegacao()` só precisa rodar uma vez, na inicialização do app.
 * `atualizarAriaCurrent()` já é chamada pelo roteador a cada troca de rota.
 */

export function initNavegacao() {
  const botao = document.getElementById("botao-menu");
  const lista = document.getElementById("lista-navegacao-principal");

  if (!botao || !lista) return;

  function fecharMenu() {
    lista.classList.remove("aberta");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu de navegação");
  }

  function abrirMenu() {
    lista.classList.add("aberta");
    botao.setAttribute("aria-expanded", "true");
    botao.setAttribute("aria-label", "Fechar menu de navegação");
  }

  botao.addEventListener("click", function () {
    const estaAberto = lista.classList.contains("aberta");
    if (estaAberto) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  });

  // Fecha o menu ao escolher um link (comum em navegação mobile). Os links
  // do menu principal são fixos (não são recriados por rota), então basta
  // ligar isso uma vez.
  lista.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  // Fecha o menu com Esc, devolvendo o foco ao botão que o abriu.
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && lista.classList.contains("aberta")) {
      fecharMenu();
      botao.focus();
    }
  });

  // Se a tela crescer para o layout desktop com o menu mobile aberto,
  // reseta o estado para não herdar classes indevidas ao encolher de novo.
  const consultaDesktop = window.matchMedia("(min-width: 769px)");
  consultaDesktop.addEventListener("change", function (evento) {
    if (evento.matches) fecharMenu();
  });
}

/** Marca com aria-current="page" o link do menu (cabeçalho e rodapé)
 *  correspondente à rota atualmente exibida, e limpa os demais. */
export function atualizarAriaCurrent(rota) {
  const mapaRotaParaHref = {
    "": "#/",
    projetos: "#/projetos",
    cadastro: "#/cadastro",
  };

  document.querySelectorAll("nav a[aria-current]").forEach((link) => {
    link.removeAttribute("aria-current");
  });

  const href = mapaRotaParaHref[rota];
  if (!href) return;

  document.querySelectorAll(`nav a[href="${href}"]`).forEach((link) => {
    link.setAttribute("aria-current", "page");
  });
}
