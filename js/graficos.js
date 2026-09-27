/**
 * ONG Solidária — integração com a biblioteca externa Chart.js.
 *
 * Único ponto de contato do projeto com uma dependência de terceiros: só
 * este módulo conhece a API do Chart.js, então qualquer troca de biblioteca
 * no futuro fica isolada aqui, sem tocar em router.js ou templates.js.
 *
 * Chart.js é carregado como script clássico (window.Chart) ANTES do módulo
 * do app (ver html/index.html), então nunca precisamos de import — apenas
 * checamos se `window.Chart` existe antes de usar, para o app não quebrar
 * caso o arquivo, por algum motivo, não tenha carregado.
 */

import { projetos } from "./dados.js";

let instanciaGrafico = null;

/** Cria (ou recria) o gráfico de barras de voluntários ativos por projeto
 *  dentro do <canvas id="grafico-impacto"> da rota Início. Precisa ser
 *  chamado toda vez que a rota é renderizada, porque o roteador substitui
 *  o innerHTML de #app e cria um <canvas> novo a cada visita — um Chart
 *  antigo, apontando para um canvas que já não existe mais no DOM,
 *  vazaria memória e poderia até desenhar por cima do gráfico novo. Por
 *  isso a instância anterior é sempre destruída primeiro.
 */
export function initGraficoImpacto(raiz) {
  const canvas = raiz.querySelector("#grafico-impacto");
  if (!canvas) return;

  if (instanciaGrafico) {
    instanciaGrafico.destroy();
    instanciaGrafico = null;
  }

  if (typeof window.Chart === "undefined") {
    // Biblioteca não carregou por algum motivo (ex.: bloqueio de rede) —
    // a home continua funcionando normalmente, só sem o gráfico.
    console.warn("Chart.js não está disponível; o gráfico de impacto não será exibido.");
    return;
  }

  instanciaGrafico = new window.Chart(canvas, {
    type: "bar",
    data: {
      labels: projetos.map((p) => p.titulo),
      datasets: [
        {
          label: "Voluntários ativos",
          data: projetos.map((p) => p.voluntariosAtivos),
          backgroundColor: "#2e7d32",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });
}
