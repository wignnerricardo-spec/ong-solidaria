/**
 * ONG Solidária — validação, máscaras e persistência do formulário de
 * cadastro de voluntário(a).
 *
 * A validação nativa do HTML5 (required, type, pattern, minlength...) já
 * garante o mínimo de integridade do formulário mesmo sem este módulo. Este
 * arquivo ENRIQUECE a experiência: aplica máscara enquanto o usuário digita,
 * faz a validação real de CPF (dígitos verificadores) via Constraint
 * Validation API, salva/recupera um rascunho no localStorage e registra o
 * histórico de cadastros enviados neste navegador.
 *
 * `initCadastro(raiz)` é chamada pelo roteador toda vez que a rota
 * /cadastro é renderizada — `raiz` é o elemento que acabou de receber o
 * HTML novo (normalmente #app), e é dentro dele que buscamos os campos.
 */

import { salvarRascunho, carregarRascunho, limparRascunho, registrarCadastro } from "./armazenamento.js";
import { renderListaCadastrosSalvos } from "./templates.js";
import { mostrarToast } from "./componentes.js";

/** Remove tudo que não for dígito. */
function apenasNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function aplicarMascara(campo, formatar, maxDigitos) {
  campo.addEventListener("input", function () {
    const posicaoOriginal = campo.selectionStart;
    const tamanhoAntes = campo.value.length;

    let digitos = apenasNumeros(campo.value).slice(0, maxDigitos);
    campo.value = formatar(digitos);

    const diferenca = campo.value.length - tamanhoAntes;
    const novaPosicao = Math.max(0, (posicaoOriginal || 0) + diferenca);
    campo.setSelectionRange(novaPosicao, novaPosicao);
  });
}

function formatarCPF(digitos) {
  return digitos
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatarTelefone(digitos) {
  if (digitos.length <= 10) {
    return digitos.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digitos.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function formatarCEP(digitos) {
  return digitos.replace(/^(\d{5})(\d)/, "$1-$2");
}

/** Validação real de CPF, com cálculo dos dois dígitos verificadores. */
function cpfValido(cpf) {
  const numeros = apenasNumeros(cpf);

  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const caractere of base) {
      soma += Number(caractere) * peso;
      peso--;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const nove = numeros.slice(0, 9);
  const primeiroDigito = calcularDigito(nove);
  const dez = nove + String(primeiroDigito);
  const segundoDigito = calcularDigito(dez);

  return numeros === dez + String(segundoDigito);
}

function configurarValidacaoCPF(campo) {
  campo.addEventListener("input", function () {
    const digitos = apenasNumeros(campo.value);
    if (digitos.length < 11) {
      campo.setCustomValidity("");
      return;
    }
    campo.setCustomValidity(cpfValido(campo.value) ? "" : "CPF inválido. Confira os números digitados.");
  });
}

/**
 * Falha encontrada em sessão de validação: o atributo `required` nativo só
 * verifica se value.length > 0, então um campo preenchido só com espaços
 * (ex.: "     ") passava no checkValidity() como se fosse um nome/cidade de
 * verdade. Afeta apenas campos de texto livre obrigatórios SEM pattern
 * próprio (nome e cidade) — os demais (cpf, telefone, cep, email) já
 * rejeitam espaços-only pelo seu próprio pattern/type/algoritmo.
 */
function configurarValidacaoDeEspacosEmBranco(formulario) {
  ["nome", "cidade"].forEach((idCampo) => {
    const campo = formulario.querySelector(`#${idCampo}`);
    if (!campo) return;
    campo.addEventListener("input", function () {
      const somenteEspacos = campo.value.length > 0 && campo.value.trim() === "";
      campo.setCustomValidity(somenteEspacos ? "Este campo não pode conter apenas espaços em branco." : "");
    });
  });
}

function configurarMensagensDeErro(formulario) {
  const campos = formulario.querySelectorAll("input, select");
  campos.forEach((campo) => {
    const container = campo.closest(".campo");
    if (!container) return;
    const elementoErro = container.querySelector(".mensagem-erro");
    if (!elementoErro) return;

    const atualizarMensagem = () => {
      elementoErro.textContent = campo.validity.valid ? "" : campo.validationMessage;
    };

    campo.addEventListener("input", atualizarMensagem);
    campo.addEventListener("blur", atualizarMensagem);
    campo.addEventListener("invalid", atualizarMensagem);
  });
}

// ---------- Rascunho automático (localStorage) ----------

/** Lê os valores atuais dos campos que fazem parte do rascunho (o filtro
 *  fino de quais campos realmente são persistidos vive em armazenamento.js). */
function coletarValoresParaRascunho(formulario) {
  const dados = new FormData(formulario);
  const valores = {};
  dados.forEach((valor, chave) => {
    // Radios repetem a mesma chave por opção; FormData só guarda a marcada.
    valores[chave] = valor;
  });
  return valores;
}

function restaurarRascunho(formulario, aviso) {
  const rascunho = carregarRascunho();
  if (!rascunho) return;

  const temAlgumValor = Object.values(rascunho).some((valor) => valor);
  if (!temAlgumValor) return;

  Object.entries(rascunho).forEach(([nomeCampo, valor]) => {
    if (!valor) return;
    const campo = formulario.elements.namedItem(nomeCampo);
    if (!campo) return;

    if (campo instanceof RadioNodeList) {
      // Grupo de rádio (disponibilidade): marca a opção salva.
      const opcao = formulario.querySelector(`input[name="${nomeCampo}"][value="${valor}"]`);
      if (opcao) opcao.checked = true;
    } else {
      campo.value = valor;
    }
  });

  if (aviso) aviso.hidden = false;
}

/**
 * Liga o autosalvamento com debounce e devolve uma função para cancelar
 * qualquer gravação já agendada — necessária no envio bem-sucedido, senão
 * um autosave pendente de uma tecla anterior dispararia DEPOIS do
 * formulario.reset() e regravaria um rascunho vazio no lugar do que
 * acabamos de limpar.
 */
function configurarAutosalvamentoDeRascunho(formulario) {
  let temporizador = null;
  formulario.addEventListener("input", function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      salvarRascunho(coletarValoresParaRascunho(formulario));
    }, 500);
  });

  return function cancelarAutosalvamentoPendente() {
    clearTimeout(temporizador);
  };
}

// ---------- Histórico de cadastros enviados ----------

function atualizarListaCadastrosNaTela(formulario) {
  const secaoContainer = formulario.closest(".container");
  if (!secaoContainer) return;

  const asideAtual = document.getElementById("cadastros-salvos");
  const novoHtml = renderListaCadastrosSalvos();

  if (asideAtual) {
    if (novoHtml) {
      asideAtual.outerHTML = novoHtml;
    } else {
      asideAtual.remove();
    }
  } else if (novoHtml) {
    secaoContainer.insertAdjacentHTML("beforeend", novoHtml);
  }
}

// ---------- Envio ----------

function configurarEnvio(formulario, aviso, cancelarAutosalvamentoPendente) {
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      if (aviso) {
        aviso.textContent = "Verifique os campos destacados: alguns dados ainda não estão no formato esperado.";
        aviso.classList.remove("sucesso");
        aviso.classList.add("erro", "visivel");
      }
      mostrarToast("Há campos inválidos no formulário.", "erro");
      return;
    }

    const campoNome = formulario.elements.namedItem("nome");
    const campoArea = formulario.elements.namedItem("area_interesse");
    const areaSelecionada = campoArea && campoArea.selectedOptions && campoArea.selectedOptions[0];

    registrarCadastro({
      nome: campoNome ? campoNome.value : "",
      areaRotulo: areaSelecionada && areaSelecionada.value ? areaSelecionada.textContent : null,
    });

    // Sem back-end neste desafio: apenas confirma o cadastro na própria
    // página e demonstra a persistência via localStorage.
    if (aviso) {
      aviso.textContent = "Cadastro enviado com sucesso! Em breve nossa equipe entrará em contato.";
      aviso.classList.remove("erro");
      aviso.classList.add("sucesso", "visivel");
    }
    mostrarToast("Cadastro enviado com sucesso!", "sucesso");

    cancelarAutosalvamentoPendente();
    limparRascunho();
    formulario.reset();
    atualizarListaCadastrosNaTela(formulario);
  });
}

/** Ponto de entrada do módulo — chamado pelo roteador sempre que a rota
 *  /cadastro é renderizada dentro de `raiz` (normalmente #app). */
export function initCadastro(raiz) {
  const formulario = raiz.querySelector("#formulario-cadastro");
  if (!formulario) return;

  const aviso = formulario.querySelector(".aviso-formulario");
  const avisoRascunho = raiz.querySelector("#aviso-rascunho");

  const campoCPF = formulario.querySelector("#cpf");
  const campoTelefone = formulario.querySelector("#telefone");
  const campoCEP = formulario.querySelector("#cep");

  if (campoCPF) {
    aplicarMascara(campoCPF, formatarCPF, 11);
    configurarValidacaoCPF(campoCPF);
  }
  if (campoTelefone) aplicarMascara(campoTelefone, formatarTelefone, 11);
  if (campoCEP) aplicarMascara(campoCEP, formatarCEP, 8);

  configurarValidacaoDeEspacosEmBranco(formulario);
  configurarMensagensDeErro(formulario);
  restaurarRascunho(formulario, avisoRascunho);
  const cancelarAutosalvamentoPendente = configurarAutosalvamentoDeRascunho(formulario);
  configurarEnvio(formulario, aviso, cancelarAutosalvamentoPendente);
}
