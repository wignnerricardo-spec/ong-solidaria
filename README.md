# Mãos que Ajudam — site institucional da ONG

Single Page Application (SPA) estática, em HTML/CSS/JavaScript puro (sem
framework, sem build tool obrigatório para desenvolver), com roteamento por
hash, formulário de cadastro de voluntários com validação e persistência em
`localStorage`, e um gráfico de impacto (Chart.js) na página inicial.

Site em produção (GitHub Pages): `https://wignnerricardo-spec.github.io/ong-solidaria/`
*(ativar uma vez em Settings → Pages → Branch: `gh-pages` — ver seção Deploy)*

---

## Sumário

- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação e execução local](#instalação-e-execução-local)
- [Fluxo de trabalho Git (GitFlow)](#fluxo-de-trabalho-git-gitflow)
- [Acessibilidade (WCAG 2.1 AA)](#acessibilidade-wcag-21-aa)
- [Build de produção](#build-de-produção)
- [Deploy (GitHub Pages)](#deploy-github-pages)
- [Manutenção](#manutenção)

---

## Estrutura do projeto

```
html/
  index.html          # shell da SPA: header, nav, <main id="app">, modal, toasts
css/
  style.css           # design system (tokens/variáveis), grid, responsividade
js/
  app.js              # ponto de entrada: inicializa o roteador
  router.js           # roteamento por hash (#/, #/projetos, #/cadastro)
  templates.js         # geração de HTML de cada rota (template strings)
  navegacao.js         # menu, estado ativo, comportamento responsivo do header
  componentes.js        # modal, toasts (elementos reutilizáveis)
  formularios.js         # máscaras, validação (CPF, espaços em branco), autosave
  armazenamento.js        # camada de persistência em localStorage
  dados.js                 # dados estáticos dos projetos (mock, sem back-end)
  graficos.js               # integração com Chart.js (gráfico de impacto)
  vendor/chart.umd.min.js    # Chart.js vendorizado (ver nota abaixo)
imagens/
  *.svg, *.png              # imagens do site
```

**Por que Chart.js está vendorizado em `js/vendor/` em vez de vir de um CDN?**
Foi instalado via `npm install chart.js` e o build UMD foi copiado para o
repositório. Isso evita uma dependência de rede em tempo de execução e
elimina divergência de versão entre desenvolvimento e produção.

## Instalação e execução local

Não há dependências de build para desenvolver — é HTML/CSS/JS servido
estaticamente. Basta um servidor HTTP simples (a SPA usa `fetch`/módulos ES,
que exigem `http://`, não `file://`):

```bash
git clone https://github.com/wignnerricardo-spec/ong-solidaria.git
cd ong-solidaria
git checkout develop        # branch de desenvolvimento ativo
python3 -m http.server 8000
# abrir http://localhost:8000/html/index.html
```

Qualquer servidor estático equivalente funciona (`npx serve`, extensão Live
Server do VS Code, etc.) — o único requisito é servir os arquivos por HTTP.

## Fluxo de trabalho Git (GitFlow)

O repositório segue o modelo **GitFlow** simplificado:

- **`main`** — só recebe merges de `develop` quando uma versão é lançada.
  Cada lançamento é marcado com uma tag semântica (`v1.0.0`, `v1.1.0`, ...).
- **`develop`** — branch de integração; todo `feature/*` e `fix/*` é
  mesclado aqui primeiro, sempre com merge `--no-ff` (preserva o commit de
  merge e o histórico da branch, facilitando auditoria/reversão).
- **`feature/<nome>`** — uma branch por funcionalidade
  (`feature/estrutura-html-semantica`, `feature/design-system-css`,
  `feature/spa-core`, `feature/interacao-formulario`,
  `feature/grafico-impacto`).
- **`fix/<nome>`** — correções pontuais encontradas em teste/auditoria
  (`fix/validacao-espacos-em-branco`, `fix/acessibilidade-wcag`).
- **`gh-pages`** — branch **órfã**, sem histórico compartilhado com as
  demais: contém apenas o build de produção (minificado, achatado), gerado a
  partir de `main` e usado exclusivamente pelo GitHub Pages.

Commits seguem o padrão **Conventional Commits** (`feat:`, `fix:`,
`chore:`, `build:`), em português, descrevendo o quê e, quando relevante, o
porquê (ex.: qual auditoria ou teste encontrou o problema corrigido).

Passos para uma nova funcionalidade:

```bash
git checkout develop
git checkout -b feature/nome-da-funcionalidade
# ... commits ...
git checkout develop
git merge --no-ff feature/nome-da-funcionalidade
git push origin develop feature/nome-da-funcionalidade
```

Passos para lançar uma versão:

```bash
git checkout main
git merge --no-ff develop
git tag -a vX.Y.Z -m "Descrição do lançamento"
git push origin main
git push origin vX.Y.Z
```

## Acessibilidade (WCAG 2.1 AA)

O projeto passou por auditoria manual (Playwright + cálculo de contraste
pela fórmula de luminância relativa do próprio WCAG, já que nenhuma
ferramenta externa de varredura estava disponível no ambiente) cobrindo:
contraste de cor, navegação por teclado (ordem de tabulação, foco visível,
trap de foco no modal), tamanho de alvos de toque, rótulos ARIA, anúncio de
erros de formulário e comportamento em zoom de 200%.

Problemas reais encontrados e corrigidos (branch `fix/acessibilidade-wcag`):

| Critério | Problema | Correção |
|---|---|---|
| 1.4.3 Contraste (AA) | `--cor-texto-claro` dava 4.37:1 (mínimo 4.5:1) em `.texto-ajuda` e `.projeto__meta time` | Token escurecido para `#56717d` (5.18:1) |
| Boa prática (2.5.5 é AAA) | Botão de fechar modal com 30×32px | `min-width/min-height: 44px` |
| Boa prática (2.5.5 é AAA) | Links do menu com área de toque ~42×27px | `padding-block` ampliado |

Todas as correções foram revalidadas com o W3C Nu Html Checker (0
erros/avisos) e com reteste funcional completo (sem regressões).

## Build de produção

O build de produção minifica HTML/CSS/JS e otimiza imagens, achatando os
caminhos (sem `../`) para funcionar na raiz de um branch estático como o
GitHub Pages. Ferramentas usadas: `terser` (`--module --compress --mangle`,
o flag `--module` é necessário por o projeto usar ES Modules), `clean-css`
(nível 2) e `html-minifier-terser` para o HTML; imagens raster otimizadas
via Pillow (`optimize=True`) e SVGs com espaços/comentários removidos
manualmente. O build gerado foi revalidado com o Nu Html Checker e retestado
funcionalmente com Playwright — comportamento idêntico ao ambiente de
desenvolvimento, com redução de ~28% no tamanho total dos arquivos.

O conteúdo do build de produção da versão `v1.0.0` está publicado no branch
`gh-pages` (histórico independente/órfão, sem relação com `main`/`develop`).
Para gerar um novo build ao lançar uma nova versão, repita o processo acima
sobre o conteúdo de `main` e substitua o conteúdo do branch `gh-pages`.

## Deploy (GitHub Pages)

O branch `gh-pages` já está publicado no repositório remoto. **Falta apenas
uma configuração manual, feita uma única vez, na interface do GitHub** (não
é possível automatizar essa etapa a partir daqui):

1. No repositório no GitHub, ir em **Settings → Pages**.
2. Em **Source**, selecionar **Deploy from a branch**.
3. Em **Branch**, selecionar `gh-pages` e a pasta `/ (root)`.
4. Salvar. O GitHub publica o site em `https://wignnerricardo-spec.github.io/ong-solidaria/`
   em poucos minutos.

## Manutenção

- **Adicionar/alterar conteúdo dos projetos**: editar o array `projetos` em
  `js/dados.js` (inclui `voluntariosAtivos`, usado no gráfico de impacto).
- **Alterar cores/espaçamentos**: editar as variáveis (design tokens) no
  topo de `css/style.css` — a mudança se propaga a todos os usos.
- **Adicionar uma nova rota**: registrar em `ROTAS` (`js/router.js`) e criar
  a função de template correspondente em `js/templates.js`.
- **Antes de cada lançamento**: revalidar o HTML com o Nu Html Checker,
  rodar o reteste funcional (Playwright) e reexecutar a auditoria de
  contraste/teclado se `css/style.css` ou o markup do formulário/modal
  tiverem sido alterados, então seguir os passos de "lançar uma versão" e
  regenerar o build de `gh-pages`.

---

Projeto acadêmico — Experiência Prática IV (Cruzeiro do Sul), autor:
Wignner Ricardo Siqueira Santos.
