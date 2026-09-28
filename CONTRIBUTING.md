# Como contribuir

Este projeto segue o fluxo **GitFlow** (ver detalhes no `README.md`). Para
qualquer alteração:

1. Abra uma *issue* descrevendo o problema ou a melhoria, associando-a a um
   *milestone* de release quando fizer sentido.
2. Crie uma branch `feature/<nome>` ou `fix/<nome>` a partir de `develop`.
3. Faça commits com mensagens no padrão **Conventional Commits**
   (`feat:`, `fix:`, `docs:`, `chore:`, `build:`).
4. Abra um **Pull Request** da sua branch para `develop`, explicando:
   - o que mudou e por quê;
   - como foi validado (teste manual, Playwright, W3C Nu Html Checker,
     auditoria de acessibilidade, etc.).
5. Após o merge (`--no-ff`), feche a *issue* correspondente referenciando o
   PR ou o commit.

Releases só saem de `develop` para `main` com uma tag SemVer
(`vMAJOR.MINOR.PATCH`) e um merge `--no-ff`.
