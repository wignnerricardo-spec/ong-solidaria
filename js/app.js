/**
 * ONG Solidária — ponto de entrada da SPA.
 *
 * Único script carregado pelo index.html (como módulo ES). Sua única
 * responsabilidade é ligar o link de "pular para o conteúdo" — que não pode
 * usar um `#âncora` normal porque isso disparia o roteador — e iniciar o
 * roteador, que cuida de tudo mais a partir daí.
 */

import { iniciarRoteador } from "./router.js";

function configurarLinkPular() {
  const link = document.getElementById("link-pular");
  const app = document.getElementById("app");
  if (!link || !app) return;

  link.addEventListener("click", function (evento) {
    // preventDefault evita que o navegador tente navegar para "#app", o
    // que mudaria location.hash e acionaria o roteador da SPA sem motivo.
    evento.preventDefault();
    if (!app.hasAttribute("tabindex")) app.setAttribute("tabindex", "-1");
    app.focus();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  configurarLinkPular();
  iniciarRoteador();
});
