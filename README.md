# SFraga Advocacia — Formulários de intake

Aplicação Next.js (App Router) que substitui os questionários Tally de triagem trabalhista, com ingestão em PostgreSQL (`sfragaadv.reclamante`).

## Rotas

- `/` — links de teste
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

Sem `DATABASE_URL` / `RECLAMANTE_DATABASE_URL`, o envio usa PGlite em memória (demo local).

Documentação completa: ver o Project store em `docs/formularios-intake.md`.
