/**
 * Build de produção: minifica HTML/CSS/JS e achata os caminhos (sem ../)
 * para servir a partir da raiz de um branch estático como o GitHub Pages.
 * Rodado localmente com `npm run build` ou automaticamente pelo workflow
 * .github/workflows/deploy.yml a cada push em `main`.
 */
const fs = require("fs");
const path = require("path");
const { minify: minifyJS } = require("terser");
const CleanCSS = require("clean-css");
const { minify: minifyHTML } = require("html-minifier-terser");

const RAIZ = __dirname;
const SAIDA = path.join(RAIZ, "dist");

async function main() {
  fs.rmSync(SAIDA, { recursive: true, force: true });
  fs.mkdirSync(path.join(SAIDA, "css"), { recursive: true });
  fs.mkdirSync(path.join(SAIDA, "js", "vendor"), { recursive: true });
  fs.mkdirSync(path.join(SAIDA, "imagens"), { recursive: true });

  // CSS
  const cssOriginal = fs.readFileSync(path.join(RAIZ, "css/style.css"), "utf8");
  const cssMinificado = new CleanCSS({ level: 2 }).minify(cssOriginal);
  if (cssMinificado.errors.length) throw new Error(cssMinificado.errors.join("\n"));
  fs.writeFileSync(path.join(SAIDA, "css/style.css"), cssMinificado.styles);
  console.log(`css/style.css: ${cssOriginal.length} -> ${cssMinificado.styles.length} bytes`);

  // JS (todos os módulos autorais; o vendor já vem minificado de fábrica)
  const pastaJS = path.join(RAIZ, "js");
  const arquivosJS = fs.readdirSync(pastaJS).filter((f) => f.endsWith(".js"));
  for (const arquivo of arquivosJS) {
    const codigo = fs.readFileSync(path.join(pastaJS, arquivo), "utf8");
    const resultado = await minifyJS(codigo, { module: true, compress: true, mangle: true });
    if (resultado.error) throw resultado.error;
    fs.writeFileSync(path.join(SAIDA, "js", arquivo), resultado.code);
    console.log(`js/${arquivo}: ${codigo.length} -> ${resultado.code.length} bytes`);
  }
  fs.copyFileSync(
    path.join(pastaJS, "vendor/chart.umd.min.js"),
    path.join(SAIDA, "js/vendor/chart.umd.min.js")
  );

  // Imagens (já otimizadas na fonte; só copia)
  for (const arquivo of fs.readdirSync(path.join(RAIZ, "imagens"))) {
    fs.copyFileSync(path.join(RAIZ, "imagens", arquivo), path.join(SAIDA, "imagens", arquivo));
  }

  // HTML: achata os caminhos (../css/ -> css/, etc.) e minifica por último
  let html = fs.readFileSync(path.join(RAIZ, "html/index.html"), "utf8");
  html = html
    .replace(/\.\.\/css\//g, "css/")
    .replace(/\.\.\/js\//g, "js/")
    .replace(/\.\.\/imagens\//g, "imagens/");
  const htmlMinificado = await minifyHTML(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
  fs.writeFileSync(path.join(SAIDA, "index.html"), htmlMinificado);
  console.log(`index.html: ${html.length} -> ${htmlMinificado.length} bytes`);

  console.log("\nBuild de produção gerado em ./dist");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
