import { NextResponse } from "next/server";
import { APP_SCHEMA, databaseDiagnostics } from "@/lib/db";
import { insertReclamante } from "@/lib/ingest";
import type { Answers, FormSource } from "@/lib/form-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      form_source?: FormSource;
      answers?: Answers;
      early_exit?: boolean;
    };

    const source = body.form_source;
    if (source !== "trabalhista" && source !== "gestante") {
      return NextResponse.json({ error: "form_source inválido" }, { status: 400 });
    }

    const result = await insertReclamante(
      body.answers ?? {},
      source,
      Boolean(body.early_exit),
    );

    return NextResponse.json({
      ok: true,
      id: result.id,
      mode: result.mode,
      schema: APP_SCHEMA,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gravar";
    const safe =
      /password|connection string|SASL|authentication/i.test(message) &&
      !/source=|host=/i.test(message)
        ? "Falha ao conectar ou gravar no banco. Verifique LUSEAN_URL (sslmode=disable)."
        : message;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}

export async function GET() {
  const diag = databaseDiagnostics();
  return NextResponse.json({
    ok: true,
    database: diag.mode === "postgres" ? "configured" : "pglite_fallback",
    schema: APP_SCHEMA,
    table: `${APP_SCHEMA}.reclamante`,
    source: diag.source,
    host: diag.host,
    luseanSet: diag.luseanSet,
    luseanHost: diag.luseanHost,
    reclamanteSet: diag.reclamanteSet,
    reclamanteHost: diag.reclamanteHost,
    databaseUrlSet: diag.databaseUrlSet,
    databaseUrlHost: diag.databaseUrlHost,
    platformDatabaseBlocked: diag.platformDatabaseBlocked,
  });
}
