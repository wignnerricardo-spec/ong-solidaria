/**
 * ONG Solidária — sistema de templates.
 *
 * Cada função recebe dados (quando precisa) e devolve uma string HTML pronta
 * para ser injetada em #app pelo roteador. Não há dependência de nenhuma
 * biblioteca — são apenas template literals com interpolação, o suficiente
 * para o tamanho deste projeto e fácil de entender por quem lê o código.
 */

import { projetos, opcoesAreaInteresse } from "./dados.js";
import { listarCadastros } from "./armazenamento.js";

function formatarDataCurta(isoDate) {
  const data = new Date(isoDate + "T00:00:00");
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ---------- Rota "/" (Início) ----------
export function renderHome() {
  return `
    <section class="hero" aria-labelledby="hero-titulo">
      <div class="container">
        <div class="hero__conteudo">
          <h1 id="hero-titulo">Transformando boa vontade em impacto real</h1>
          <p>
            Há mais de 12 anos aproximamos pessoas dispostas a ajudar de quem
            mais precisa. Levamos alimento, educação e acolhimento a
            comunidades vulneráveis por meio de projetos transparentes e
            resultados que você pode acompanhar.
          </p>
          <div class="hero__acoes">
            <a class="botao botao-primario" href="#/cadastro">Quero ser voluntário(a)</a>
            <a class="botao botao-secundario" href="#/projetos">Conhecer os projetos</a>
          </div>
        </div>
        <figure class="hero__figura">
          <picture>
            <source srcset="../imagens/voluntarios-mesa-solidaria.svg" type="image/svg+xml">
            <source srcset="../imagens/voluntarios-mesa-solidaria.webp" type="image/webp">
            <img
              src="../imagens/voluntarios-mesa-solidaria.png"
              alt="Três voluntários da ONG Mãos que Ajudam organizando caixas de doação sobre uma mesa, prontos para distribuição à comunidade"
              width="480"
              height="360"
              loading="lazy"
            >
          </picture>
        </figure>
      </div>
    </section>

    <section aria-labelledby="missao-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h2 id="missao-titulo">Quem somos</h2>
          <p>
            A Mãos que Ajudam é uma organização do terceiro setor dedicada a
            reduzir a desigualdade social por meio de ações contínuas e
            parcerias com a comunidade local.
          </p>
        </div>

        <div class="grade-cartoes grid-12">
          <article class="cartao col-span-4">
            <div class="cartao__icone" aria-hidden="true">🎯</div>
            <h3>Missão</h3>
            <p>Conectar voluntários, doadores e famílias em situação de vulnerabilidade, promovendo dignidade e autonomia.</p>
          </article>
          <article class="cartao col-span-4">
            <div class="cartao__icone" aria-hidden="true">🔭</div>
            <h3>Visão</h3>
            <p>Ser referência regional em transparência e efetividade de projetos sociais até 2030.</p>
          </article>
          <article class="cartao col-span-4">
            <div class="cartao__icone" aria-hidden="true">💚</div>
            <h3>Valores</h3>
            <p>Transparência, respeito, colaboração e compromisso com resultados mensuráveis.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="secao-alternada" aria-labelledby="numeros-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h2 id="numeros-titulo">Nosso impacto em números</h2>
        </div>
        <dl class="estatisticas grid-12">
          <div class="col-span-3"><dt>3.400+</dt><dd>pessoas atendidas em 2025</dd></div>
          <div class="col-span-3"><dt>180</dt><dd>voluntários ativos</dd></div>
          <div class="col-span-3"><dt>12</dt><dd>anos de atuação</dd></div>
          <div class="col-span-3"><dt>9</dt><dd>projetos em andamento</dd></div>
        </dl>

        <div class="grafico-impacto__wrapper">
          <h3 class="grafico-impacto__titulo">Voluntários ativos por projeto</h3>
          <canvas id="grafico-impacto" role="img" aria-label="Gráfico de barras com o número de voluntários ativos em cada um dos quatro projetos da ONG"></canvas>
        </div>
      </div>
    </section>

    <section aria-labelledby="cta-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h2 id="cta-titulo">Faça parte dessa rede de apoio</h2>
          <p>Seja doando seu tempo como voluntário ou apoiando um projeto específico, toda contribuição chega a quem precisa.</p>
          <a class="botao botao-primario" href="#/cadastro">Cadastre-se agora</a>
        </div>
      </div>
    </section>
  `;
}

// ---------- Rota "/projetos" ----------
export function renderProjetos() {
  const artigos = projetos
    .map(
      (p) => `
        <article class="projeto col-span-12" id="${p.slug}" aria-labelledby="${p.slug}-titulo">
          <div class="projeto__figura" aria-hidden="true">${p.icone}</div>
          <div class="projeto__corpo">
            <div class="projeto__meta">
              <span class="selo">${p.selo}</span>
              <time datetime="${p.dataIso}">${p.dataTexto}</time>
            </div>
            <h2 id="${p.slug}-titulo">${p.titulo}</h2>
            <p>${p.descricao}</p>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <section aria-labelledby="projetos-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h1 id="projetos-titulo">Iniciativas solidárias</h1>
          <p>Cada projeto nasce de uma necessidade real identificada junto às comunidades atendidas. Conheça o que estamos construindo agora.</p>
        </div>
        <div class="lista-projetos grid-12">
          ${artigos}
        </div>
      </div>
    </section>

    <section class="secao-alternada" aria-labelledby="participar-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h2 id="participar-titulo">Quer apoiar algum desses projetos?</h2>
          <p>Voluntários de qualquer área são bem-vindos: educação, saúde, construção, comunicação e muito mais.</p>
          <a class="botao botao-primario" href="#/cadastro">Fazer meu cadastro</a>
        </div>
      </div>
    </section>
  `;
}

// ---------- Rota "/cadastro" ----------
export function renderCadastro() {
  const opcoesArea = opcoesAreaInteresse()
    .map((o) => `<option value="${o.valor}">${o.rotulo}</option>`)
    .join("");

  return `
    <section class="secao-formulario" aria-labelledby="cadastro-titulo">
      <div class="container">
        <div class="secao__titulo">
          <h1 id="cadastro-titulo">Cadastro de voluntário(a)</h1>
          <p>Preencha seus dados abaixo. Campos marcados com <span class="obrigatorio">*</span> são obrigatórios.</p>
        </div>

        <p class="aviso-rascunho" id="aviso-rascunho" hidden>
          Recuperamos um rascunho salvo neste navegador — confira os campos antes de enviar.
        </p>

        <form class="formulario" id="formulario-cadastro" novalidate autocomplete="on">
          <div class="aviso-formulario" role="alert" aria-live="polite"></div>

          <fieldset>
            <legend>Dados pessoais</legend>

            <div class="campo">
              <label for="nome">Nome completo <span class="obrigatorio">*</span></label>
              <input type="text" id="nome" name="nome" minlength="5" maxlength="120" autocomplete="name"
                placeholder="Digite seu nome completo" aria-describedby="nome-ajuda nome-erro" required>
              <p id="nome-ajuda" class="texto-ajuda">Como aparece no seu documento de identidade.</p>
              <p id="nome-erro" class="mensagem-erro" aria-live="polite"></p>
            </div>

            <div class="linha-campos">
              <div class="campo">
                <label for="cpf">CPF <span class="obrigatorio">*</span></label>
                <input type="text" id="cpf" name="cpf" inputmode="numeric" autocomplete="off"
                  placeholder="000.000.000-00" pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"
                  title="Formato esperado: 000.000.000-00" maxlength="32"
                  aria-describedby="cpf-ajuda cpf-erro" required>
                <p id="cpf-ajuda" class="texto-ajuda">Somente números; a máscara é aplicada automaticamente. Não é salvo como rascunho.</p>
                <p id="cpf-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>

              <div class="campo">
                <label for="nascimento">Data de nascimento <span class="obrigatorio">*</span></label>
                <input type="date" id="nascimento" name="nascimento" autocomplete="bday" max="2018-01-01"
                  aria-describedby="nascimento-ajuda nascimento-erro" required>
                <p id="nascimento-ajuda" class="texto-ajuda">É preciso ter 18 anos ou mais para se voluntariar.</p>
                <p id="nascimento-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>
            </div>

            <div class="linha-campos">
              <div class="campo">
                <label for="email">E-mail <span class="obrigatorio">*</span></label>
                <input type="email" id="email" name="email" autocomplete="email"
                  placeholder="voce@exemplo.com" aria-describedby="email-erro" required>
                <p id="email-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>

              <div class="campo">
                <label for="telefone">Telefone / WhatsApp <span class="obrigatorio">*</span></label>
                <input type="tel" id="telefone" name="telefone" inputmode="numeric" autocomplete="tel"
                  placeholder="(00) 00000-0000" pattern="\\(\\d{2}\\) \\d{4,5}-\\d{4}"
                  title="Formato esperado: (00) 00000-0000" maxlength="32"
                  aria-describedby="telefone-erro" required>
                <p id="telefone-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Endereço</legend>

            <div class="linha-campos">
              <div class="campo">
                <label for="cep">CEP <span class="obrigatorio">*</span></label>
                <input type="text" id="cep" name="cep" inputmode="numeric" autocomplete="postal-code"
                  placeholder="00000-000" pattern="\\d{5}-\\d{3}" title="Formato esperado: 00000-000"
                  maxlength="32" aria-describedby="cep-erro" required>
                <p id="cep-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>

              <div class="campo">
                <label for="cidade">Cidade <span class="obrigatorio">*</span></label>
                <input type="text" id="cidade" name="cidade" autocomplete="address-level2"
                  placeholder="Sua cidade" aria-describedby="cidade-erro" required>
                <p id="cidade-erro" class="mensagem-erro" aria-live="polite"></p>
              </div>
            </div>

            <div class="campo">
              <label for="endereco">Endereço completo</label>
              <input type="text" id="endereco" name="endereco" autocomplete="address-line1" placeholder="Rua, número, bairro">
            </div>
          </fieldset>

          <fieldset>
            <legend>Disponibilidade e interesses</legend>

            <div class="campo">
              <label for="area-interesse">Área de interesse</label>
              <select id="area-interesse" name="area_interesse" aria-describedby="area-ajuda">
                <option value="">Selecione uma área (opcional)</option>
                ${opcoesArea}
                <option value="outro">Outra / não sei ainda</option>
              </select>
              <p id="area-ajuda" class="texto-ajuda">Você pode mudar de projeto depois do cadastro.</p>
            </div>

            <div class="campo">
              <span id="disponibilidade-legenda">Disponibilidade semanal <span class="obrigatorio">*</span></span>
              <div class="grupo-radio" role="radiogroup" aria-labelledby="disponibilidade-legenda">
                <label class="opcao-radio"><input type="radio" name="disponibilidade" value="manha" required> Manhã</label>
                <label class="opcao-radio"><input type="radio" name="disponibilidade" value="tarde"> Tarde</label>
                <label class="opcao-radio"><input type="radio" name="disponibilidade" value="noite"> Noite</label>
                <label class="opcao-radio"><input type="radio" name="disponibilidade" value="fim-de-semana"> Fim de semana</label>
              </div>
            </div>

            <div class="campo">
              <label for="mensagem">Conte um pouco sobre você (opcional)</label>
              <textarea id="mensagem" name="mensagem" rows="4" maxlength="500"
                placeholder="Experiências anteriores como voluntário, habilidades, disponibilidade específica..."></textarea>
            </div>

            <div class="campo">
              <label class="opcao-checkbox">
                <input type="checkbox" id="termos" name="termos" required>
                Li e concordo com os termos de voluntariado da ONG. <span class="obrigatorio">*</span>
              </label>
              <button type="button" class="link-modal" id="botao-abrir-termos" aria-haspopup="dialog">Ver os termos de voluntariado</button>
            </div>
          </fieldset>

          <button type="submit" class="botao botao-enviar">Enviar cadastro</button>
        </form>

        ${renderListaCadastrosSalvos()}
      </div>
    </section>
  `;
}

/** Lista os cadastros já enviados NESTE navegador, lidos do localStorage. */
export function renderListaCadastrosSalvos() {
  const cadastros = listarCadastros();
  if (cadastros.length === 0) return "";

  const itens = cadastros
    .map(
      (c) => `
        <li>
          <strong>${c.nome}</strong> — ${c.areaRotulo || "área não informada"}
          <span class="texto-ajuda">(${formatarDataCurta(c.enviadoEm.slice(0, 10))})</span>
        </li>
      `
    )
    .join("");

  return `
    <aside class="cadastros-salvos" id="cadastros-salvos" aria-labelledby="cadastros-salvos-titulo">
      <h2 id="cadastros-salvos-titulo">Cadastros enviados neste navegador</h2>
      <p class="texto-ajuda">
        Como este projeto não tem back-end, guardamos aqui (via <code>localStorage</code>) só para você
        conferir que o envio funcionou. Nenhum dado sai do seu navegador.
      </p>
      <ul>${itens}</ul>
    </aside>
  `;
}

export function renderNaoEncontrada() {
  return `
    <section>
      <div class="container secao__titulo">
        <h1>Página não encontrada</h1>
        <p>O endereço acessado não existe nesta aplicação.</p>
        <a class="botao botao-primario" href="#/">Voltar para o início</a>
      </div>
    </section>
  `;
}
