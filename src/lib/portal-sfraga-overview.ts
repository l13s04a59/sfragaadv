import {
  databaseDiagnostics,
  hasExternalDatabase,
  sql,
} from "@/lib/db";
import { countLinkedPessoas, listLinkedPessoas, type LinkedPessoa } from "@/lib/pessoa";

export type SchemaTableRow = {
  schema: string;
  name: string;
};

export type SfragaOverview = {
  ok: boolean;
  mode: "postgres" | "pglite";
  source: string | null;
  host: string | null;
  reclamanteCount: number | null;
  pessoaCount: number | null;
  tbescolCount: number | null;
  pessoas: LinkedPessoa[];
  tables: SchemaTableRow[];
  error?: string;
};

async function safeCount(query: string): Promise<number | null> {
  try {
    const rows = await sql<{ count: string | number }>(query);
    return Number(rows[0]?.count ?? 0);
  } catch {
    return null;
  }
}

/**
 * Read-only prototype for SFRAGA ADVOCACIA: counts and table list in
 * schemas `sfragaadv` and `public`. People list only via active
 * `sfragaadv.pessoa` links. Never returns connection secrets.
 */
export async function getSfragaOverview(): Promise<SfragaOverview> {
  const diag = databaseDiagnostics();
  const base = {
    mode: diag.mode,
    source: diag.source,
    host: diag.host,
  };

  try {
    const [reclamanteCount, tbescolCount, pessoaCount, pessoas, tableRows] =
      await Promise.all([
        safeCount("select count(*)::int as count from sfragaadv.reclamante"),
        safeCount("select count(*)::int as count from public.tbescol"),
        countLinkedPessoas("sfragaadv"),
        listLinkedPessoas("sfragaadv", 20),
        sql<{ schema: string; name: string }>(
          `select table_schema as schema, table_name as name
           from information_schema.tables
           where table_schema in ('sfragaadv', 'public')
             and table_type = 'BASE TABLE'
           order by table_schema, table_name`,
        ),
      ]);

    return {
      ok: true,
      ...base,
      reclamanteCount,
      pessoaCount,
      tbescolCount,
      pessoas,
      tables: tableRows.map((r) => ({ schema: r.schema, name: r.name })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao consultar";
    const safe = /password|connection string|SASL|authentication/i.test(message)
      ? "Falha ao conectar. Verifique LUSEAN_URL no ambiente (sem expor o valor)."
      : message.replace(/postgresql:\/\/[^\s]+/gi, "[redacted]");

    return {
      ok: false,
      ...base,
      reclamanteCount: null,
      pessoaCount: null,
      tbescolCount: null,
      pessoas: [],
      tables: [],
      error: safe,
    };
  }
}

export function sfragaOverviewHint(): string {
  if (hasExternalDatabase()) {
    return "Conectado via LUSEAN_URL (ou alias externo). Somente leitura; pessoas só com vínculo sfragaadv.pessoa.";
  }
  return "Sem LUSEAN_URL utilizável — prévia em PGlite local (demo).";
}
