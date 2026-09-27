/**
 * ONG Solidária — módulo de armazenamento local.
 *
 * Concentra todo o acesso a localStorage do projeto, para que nenhum outro
 * módulo leia/escreva chaves "na mão". Dois usos concretos:
 *
 * 1) Rascunho do formulário de cadastro — salvo a cada digitação, restaurado
 *    se o usuário sair da página e voltar (ou atualizar o navegador) antes
 *    de enviar. Por prudência, campos sensíveis (CPF, data de nascimento)
 *    NÃO entram no rascunho persistido.
 * 2) Histórico de cadastros enviados neste navegador — como o projeto não
 *    tem back-end, isso é o que demonstra visivelmente que os dados
 *    "ficaram salvos" após o envio do formulário.
 */

const CHAVE_RASCUNHO = "ong-solidaria:rascunho-cadastro";
const CHAVE_CADASTROS = "ong-solidaria:cadastros-enviados";

/** Campos do formulário que são persistidos no rascunho automático. */
const CAMPOS_RASCUNHO = [
  "nome",
  "email",
  "telefone",
  "cep",
  "cidade",
  "endereco",
  "area_interesse",
  "disponibilidade",
  "mensagem",
];

function lerJSON(chave, valorPadrao) {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch (erro) {
    console.warn("Não foi possível ler o localStorage:", erro);
    return valorPadrao;
  }
}

function escreverJSON(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    // Ex.: modo privado do navegador ou cota excedida — o app segue
    // funcionando normalmente, só sem persistência.
    console.warn("Não foi possível gravar no localStorage:", erro);
    return false;
  }
}

// ---------- Rascunho do formulário ----------

export function salvarRascunho(valoresFormulario) {
  const dadosFiltrados = {};
  CAMPOS_RASCUNHO.forEach((campo) => {
    if (campo in valoresFormulario) dadosFiltrados[campo] = valoresFormulario[campo];
  });
  escreverJSON(CHAVE_RASCUNHO, dadosFiltrados);
}

export function carregarRascunho() {
  return lerJSON(CHAVE_RASCUNHO, null);
}

export function limparRascunho() {
  try {
    window.localStorage.removeItem(CHAVE_RASCUNHO);
  } catch (erro) {
    console.warn("Não foi possível limpar o rascunho:", erro);
  }
}

// ---------- Histórico de cadastros enviados ----------

export function registrarCadastro(resumo) {
  const lista = lerJSON(CHAVE_CADASTROS, []);
  lista.unshift({ ...resumo, enviadoEm: new Date().toISOString() });
  escreverJSON(CHAVE_CADASTROS, lista.slice(0, 20)); // limite razoável
}

export function listarCadastros() {
  return lerJSON(CHAVE_CADASTROS, []);
}
