/**
 * ONG Solidária — componentes de feedback reutilizáveis: modal e toast.
 *
 * O overlay do modal e o container de toasts vivem no "shell" da SPA
 * (index.html), fora de #app, então sobrevivem intactos a toda troca de
 * rota — só o botão que ABRE o modal está dentro do formulário de cadastro,
 * que é reinjetado a cada visita à rota. Por isso a ligação é dividida em
 * duas funções: `initModalGlobal()` liga a estrutura fixa do modal (roda uma
 * vez, na inicialização do app) e `ligarAbrirModalTermos()` liga o botão de
 * abrir, chamada pelo roteador toda vez que a rota /cadastro é renderizada.
 */

const ICONES_TOAST = {
  sucesso: "✅",
  erro: "⚠️",
  info: "ℹ️",
};

let abrirModalRef = null;
let elementoComFocoAnterior = null;

// ---------- Modal ----------
export function initModalGlobal() {
  const sobreposicao = document.getElementById("sobreposicao-termos");
  const modal = document.getElementById("modal-termos");
  const botaoFechar = document.getElementById("botao-fechar-termos");
  const botaoAceitar = document.getElementById("botao-aceitar-termos");

  if (!sobreposicao || !modal) return;

  function abrirModal() {
    elementoComFocoAnterior = document.activeElement;
    sobreposicao.hidden = false;
    document.body.style.overflow = "hidden";
    botaoFechar.focus();
  }

  function fecharModal() {
    sobreposicao.hidden = true;
    document.body.style.overflow = "";
    if (elementoComFocoAnterior) elementoComFocoAnterior.focus();
  }

  botaoFechar.addEventListener("click", fecharModal);
  botaoAceitar.addEventListener("click", function () {
    // Marca o checkbox de aceite ao confirmar a leitura dos termos no modal.
    // O checkbox só existe quando a rota /cadastro está na tela; se o
    // usuário abriu o modal de outra rota (não deveria, mas por segurança)
    // simplesmente não há nada para marcar.
    const checkboxTermos = document.getElementById("termos");
    if (checkboxTermos) checkboxTermos.checked = true;
    fecharModal();
  });

  // Fecha ao clicar fora da caixa do modal (na área escurecida).
  sobreposicao.addEventListener("click", function (evento) {
    if (evento.target === sobreposicao) fecharModal();
  });

  // Fecha com Esc.
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !sobreposicao.hidden) fecharModal();
  });

  // Prende o foco (Tab) dentro do modal enquanto ele estiver aberto.
  modal.addEventListener("keydown", function (evento) {
    if (evento.key !== "Tab") return;
    const focaveis = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focaveis.length === 0) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  });

  abrirModalRef = abrirModal;
}

/** Liga o botão "Ver os termos de voluntariado" do formulário de cadastro
 *  ao modal global. Precisa ser chamada de novo a cada renderização da
 *  rota /cadastro, porque o botão é recriado junto com o resto do form. */
export function ligarAbrirModalTermos() {
  const botaoAbrir = document.getElementById("botao-abrir-termos");
  if (!botaoAbrir || typeof abrirModalRef !== "function") return;
  botaoAbrir.addEventListener("click", abrirModalRef);
}

// ---------- Toast ----------
export function mostrarToast(mensagem, tipo) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  tipo = tipo || "info";
  const toast = document.createElement("div");
  toast.className = "toast toast--" + tipo;
  toast.setAttribute("role", "status");

  const icone = document.createElement("span");
  icone.className = "toast__icone";
  icone.setAttribute("aria-hidden", "true");
  icone.textContent = ICONES_TOAST[tipo] || ICONES_TOAST.info;

  const texto = document.createElement("span");
  texto.className = "toast__texto";
  texto.textContent = mensagem;

  toast.appendChild(icone);
  toast.appendChild(texto);
  container.appendChild(toast);

  // Remove automaticamente após alguns segundos, com uma animação de saída.
  setTimeout(function () {
    toast.classList.add("saindo");
    toast.addEventListener("animationend", function () {
      toast.remove();
    });
  }, 4000);
}
