# Hostinger — portal estático

Pasta pronta para upload no File Manager / FTP da Hostinger.

## Conteúdo

```
hostinger/portal/
  index.html          → landing com 3 botões
  styles.css
  sfragaadv/          → placeholder schema sfragaadv
  lusefin/            → placeholder schema lusefin
  casarotaria/        → placeholder schema casarotaria
```

## Upload

1. No hPanel Hostinger → **Arquivos** → **Gerenciador de arquivos**.
2. Abra `public_html` (ou a pasta do subdomínio, ex. `portal.seudominio.com`).
3. Envie o conteúdo de `hostinger/portal/` (pode ficar em `/` ou em `/portal/`).
4. Abra no navegador: `https://seudominio.com/` ou `https://seudominio.com/portal/`.

Não há Node/PHP nesta MVP: só HTML/CSS. Chamadas ao Postgres (`LUSEAN_URL`) ficam para a próxima etapa.

## Variável de ambiente (próxima etapa)

Quando houver backend na Hostinger (Node ou PHP):

| Nome         | Uso                                      |
|--------------|------------------------------------------|
| `LUSEAN_URL` | Connection string do Postgres lusean     |

Nunca coloque a senha em HTML/JS do cliente. Detalhes: Project store `docs/portal-esquemas.md`.
