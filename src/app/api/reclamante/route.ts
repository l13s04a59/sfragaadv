import { NextResponse } from "next/server";
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gravar";
    // Never include connection strings or secrets in responses.
    const safe =
      /password|connection string|ECONNREFUSED|SASL|authentication/i.test(message)
        ? "Falha ao conectar ou gravar no banco. Verifique DATABASE_URL / RECLAMANTE_DATABASE_URL (sslmode=disable)."
        : message;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}

export async function GET() {
  const hasDb = Boolean(
    process.env.RECLAMANTE_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim(),
  );
  return NextResponse.json({
    ok: true,
    database: hasDb ? "configured" : "pglite_fallback",
  });
}
