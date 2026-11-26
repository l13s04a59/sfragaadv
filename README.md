# SFraga Advocacia — Formulários de intake

Aplicação Next.js (App Router) que substitui os questionários Tally de triagem trabalhista, com ingestão em PostgreSQL (`sfragaadv.reclamante`).

## Rotas

- `/` — links de teste
- `/portal` — **LUSEAN SISTEMAS** (3 sistemas / schemas)
- `/portal/casarotaria`, `/portal/sfragaadv`, `/portal/lusefin` — por schema (prévia de dados só em sfragaadv)
- `/formulario/trabalhista` — reclamante geral (`gestante=false`, `form_source=trabalhista`)
- `/formulario/gestante` — gestante (`gestante=true`, `form_source=gestante`)
- `/obrigado` — confirmação após envio

## Desenvolvimento

```bash
cp .env.example .env.local
# preencha DATABASE_URL com ?sslmode=disable se o servidor não aceitar SSL
npm install
npm run dev
```

Preferir `LUSEAN_URL` (Postgres lusean). Sem URL externa válida, o envio usa PGlite em memória (demo local).

### Portal — LUSEAN SISTEMAS

UI em português, título centrado **LUSEAN SISTEMAS**, botões:

1. **CASA ROTÁRIA** → `casarotaria` (placeholder)
2. **SFRAGA ADVOCACIA** → `sfragaadv` (prévia: contagens + tabelas em `public`/`sfragaadv` via `LUSEAN_URL`)
3. **LUSEAN FINANÇAS** → `lusefin` (placeholder)

### Hostinger (estático) — site **app-lusean**

Pasta `hostinger/app-lusean/` (HTML/CSS) para upload no site Hostinger nomeado **app-lusean**. Passo a passo: `hostinger/README.md` e Project store `docs/portal-esquemas.md`. Prévia de dados Sfraga não roda no estático — só na app Next.

O app Next completo (formulários + API + prévia) continua em Node (Cursor Apps / VPS). Não use `output: 'export'` no Next raiz — as rotas `/api/*` quebrariam.

Documentação: Project store `docs/formularios-intake.md` e `docs/portal-esquemas.md`.
