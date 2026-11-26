# Hostinger — app-lusean

Pasta estática para o site / app Hostinger chamado **app-lusean**.

## Conteúdo

```
hostinger/app-lusean/
  index.html          → LUSEAN SISTEMAS (3 botões)
  styles.css
  casarotaria/        → placeholder schema casarotaria
  sfragaadv/          → placeholder (dados reais só na app Next)
  lusefin/            → placeholder schema lusefin
```

## Upload (site name: app-lusean)

1. No hPanel Hostinger, use o site/app **app-lusean** (ou crie um site com esse nome).
2. **Arquivos** → **Gerenciador de arquivos** → pasta do site (ex. `public_html`).
3. Envie o conteúdo de `hostinger/app-lusean/`.
4. Abra a URL do site e confira os três botões.

MVP estática: sem Node e sem `LUSEAN_URL`. A prévia de dados do SFRAGA ADVOCACIA
(contagens / lista de tabelas) roda na app Next (`/portal/sfragaadv`) com o secret
`LUSEAN_URL` no servidor — nunca no HTML/JS do browser.

Detalhes: Project store `docs/portal-esquemas.md`.
