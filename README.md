# SFraga Advocacia — Formulários de intake

Aplicação Next.js (App Router) que substitui os questionários Tally de triagem trabalhista, com ingestão em PostgreSQL (`sfragaadv.reclamante`).

## Rotas

- `/` — links de teste
- `/portal` — portal de manutenção (3 sistemas / schemas)
- `/portal/sfragaadv`, `/portal/lusefin`, `/portal/casarotaria` — placeholders por schema
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

### Portal de manutenção

UI em português com botões **Sfragaadv**, **LuseFin** e **CasaRotaria** (schemas `sfragaadv`, `lusefin`, `casarotaria`). MVP só navega para placeholders — sem CRUD e sem ping ao banco.

### Hostinger (estático)

A pasta `hostinger/portal/` é HTML/CSS pronto para upload no File Manager (não precisa de Node). Passo a passo: `hostinger/README.md` e o Project store `docs/portal-esquemas.md`.

O app Next completo (formulários + API) continua em Node (Cursor Apps / VPS). Não use `output: 'export'` no Next raiz — as rotas `/api/*` quebrariam.

Documentação: Project store `docs/formularios-intake.md` e `docs/portal-esquemas.md`.
