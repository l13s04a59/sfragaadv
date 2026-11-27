# SFraga Advocacia — Formulários de intake

Aplicação Next.js (App Router) que substitui os questionários Tally de triagem trabalhista, com ingestão em PostgreSQL (`sfragaadv.reclamante`).

## Rotas

- `/` — links de teste
- `/portal` — **LUSEAN SISTEMAS** (login; após auth redireciona só ao `schema_permitido`)
- `/portal/casarotaria`, `/portal/sfragaadv`, `/portal/lusefin` — protegidos por sessão (prévia de dados só em sfragaadv)
- `/formulario/trabalhista` — reclamante geral (`gestante=false`, `form_source=trabalhista`)
- `/formulario/gestante` — gestante (`gestante=true`, `form_source=gestante`)
- `/obrigado` — confirmação após envio

## Desenvolvimento

```bash
cp .env.example .env.local
# prefer LUSEAN_URL; set sslmode=require (TLS) or disable only if the server rejects SSL
npm install
npm run dev
```

Preferir `LUSEAN_URL` (Postgres lusean). Sem URL externa válida, o envio usa PGlite em memória (demo local).

### Portal — LUSEAN SISTEMAS

UI em português, título centrado **LUSEAN SISTEMAS**. Exige login (`public.app_user`); a sessão carrega um único `schema_permitido` (`sfragaadv` | `lusefin` | `casarotaria`) — sem chooser aberto dos três sistemas. Prévia de dados (incl. pessoas via `sfragaadv.pessoa`) só em SFRAGA ADVOCACIA.

Primeiro usuário: `scripts/create-app-user.mjs` (bcrypt via env). Ver Project store `docs/portal-primeiro-login.md`.

### Hostinger (estático) — site **app-lusean**

Pasta `hostinger/app-lusean/` (HTML/CSS) espelha a tela de login (sem auth real). Passo a passo: `hostinger/README.md` e Project store `docs/portal-esquemas.md`. Login + prévia Sfraga só na app Next.

O app Next completo (formulários + API + portal) continua em Node (Cursor Apps / VPS). Não use `output: 'export'` no Next raiz — as rotas `/api/*` quebrariam.

Documentação: Project store `docs/formularios-intake.md`, `docs/portal-esquemas.md`, `docs/multi-tenant-pessoas-acesso.md`, `docs/portal-primeiro-login.md`.
