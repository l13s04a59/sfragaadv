import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

export type DatabaseUrlSource = "LUSEAN_URL" | "RECLAMANTE_DATABASE_URL" | "DATABASE_URL";

export type ResolvedDatabaseUrl = {
  url: string;
  source: DatabaseUrlSource;
  host: string;
};

/** Hosts used by Cursor Apps / platform Postgres — not the user's external DB. */
function isPlatformInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "postgres_postgres" ||
    h.endsWith("_postgres") ||
    h === "postgres" ||
    h.endsWith(".postgres.svc") ||
    h.includes("postgres.svc.cluster")
  );
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname || "(unknown)";
  } catch {
    const m = url.match(/@([^/:?]+)(?::\d+)?(?:\/|\?|$)/);
    return m?.[1] ?? "(unparseable)";
  }
}

function readEnvUrl(name: DatabaseUrlSource): { raw: string; host: string } | null {
  const raw = process.env[name]?.trim() || "";
  if (!raw) return null;
  return { raw, host: hostnameFromUrl(raw) };
}

/**
 * Prefer a fresh non-stale secret name first: LUSEAN_URL.
 * Then RECLAMANTE_DATABASE_URL. Then DATABASE_URL only if not platform-internal.
 * Internal hosts (postgres_postgres) are never used for ingest.
 * Never logs or returns secret values — only source name + hostname.
 */
export function resolveDatabaseUrl(): ResolvedDatabaseUrl | null {
  const candidates: DatabaseUrlSource[] = [
    "LUSEAN_URL",
    "RECLAMANTE_DATABASE_URL",
    "DATABASE_URL",
  ];

  for (const source of candidates) {
    const entry = readEnvUrl(source);
    if (!entry) continue;
    if (isPlatformInternalHost(entry.host)) {
      console.warn(
        `[db] ignoring ${source} host=${entry.host} (platform internal); use LUSEAN_URL with the external lusean host`,
      );
      continue;
    }
    return { url: entry.raw, source, host: entry.host };
  }

  return null;
}

/** Ensure sslmode=disable for hosts that reject SSL (never log the URL). */
export function normalizeDatabaseUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (!u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "disable");
    }
    return u.toString();
  } catch {
    if (!/[?&]sslmode=/.test(url)) {
      return url.includes("?") ? `${url}&sslmode=disable` : `${url}?sslmode=disable`;
    }
    return url;
  }
}

export function hasExternalDatabase(): boolean {
  return resolveDatabaseUrl() !== null;
}

/** True when env URLs exist but all were skipped as platform-internal. */
export function isPlatformDatabaseBlocked(): boolean {
  if (resolveDatabaseUrl()) return false;
  return Boolean(
    readEnvUrl("LUSEAN_URL") ||
      readEnvUrl("RECLAMANTE_DATABASE_URL") ||
      readEnvUrl("DATABASE_URL"),
  );
}

export function databaseMode(): "postgres" | "pglite" {
  return hasExternalDatabase() ? "postgres" : "pglite";
}

/** Safe diagnostics for health checks (no secrets). */
export function databaseDiagnostics(): {
  mode: "postgres" | "pglite";
  source: DatabaseUrlSource | null;
  host: string | null;
  luseanSet: boolean;
  luseanHost: string | null;
  reclamanteSet: boolean;
  reclamanteHost: string | null;
  databaseUrlSet: boolean;
  databaseUrlHost: string | null;
  platformDatabaseBlocked: boolean;
} {
  const resolved = resolveDatabaseUrl();
  const lusean = readEnvUrl("LUSEAN_URL");
  const reclamante = readEnvUrl("RECLAMANTE_DATABASE_URL");
  const databaseUrl = readEnvUrl("DATABASE_URL");
  return {
    mode: resolved ? "postgres" : "pglite",
    source: resolved?.source ?? null,
    host: resolved?.host ?? null,
    luseanSet: Boolean(lusean),
    luseanHost: lusean?.host ?? null,
    reclamanteSet: Boolean(reclamante),
    reclamanteHost: reclamante?.host ?? null,
    databaseUrlSet: Boolean(databaseUrl),
    databaseUrlHost: databaseUrl?.host ?? null,
    platformDatabaseBlocked: isPlatformDatabaseBlocked(),
  };
}

let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;
let externalReady: Promise<pg.Pool> | undefined;
let loggedSource: string | undefined;

async function getExternalPool(): Promise<pg.Pool> {
  const resolved = resolveDatabaseUrl();
  if (!resolved) {
    throw new Error(
      "Nenhum banco externo utilizável: defina LUSEAN_URL (host 187.41.98.57). Hosts internos da plataforma (postgres_postgres) são ignorados.",
    );
  }
  const databaseUrl = normalizeDatabaseUrl(resolved.url);
  externalReady ??= (async () => {
    if (loggedSource !== resolved.source) {
      console.info(`[db] using ${resolved.source} host=${resolved.host}`);
      loggedSource = resolved.source;
    }
    pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: false,
      options: "-c search_path=sfragaadv,public",
    });
    try {
      await ensureExternalMigrations(pool);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (/ENOTFOUND|getaddrinfo|ECONNREFUSED|ETIMEDOUT|ENETUNREACH/i.test(message)) {
        throw new Error(
          `Falha ao conectar no Postgres (source=${resolved.source} host=${resolved.host}): host inacessível ou inexistente. Confira LUSEAN_URL.`,
        );
      }
      throw error;
    }
    return pool;
  })().catch((error: unknown) => {
    externalReady = undefined;
    pool = undefined;
    throw error;
  });
  return externalReady;
}

async function ensureExternalMigrations(db: pg.Pool): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("create schema if not exists sfragaadv");
    await client.query("set search_path to sfragaadv, public");
    await client.query(
      "create table if not exists sfragaadv.schema_migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    const done = new Set(
      (await client.query("select name from sfragaadv.schema_migrations")).rows.map(
        (r: { name: string }) => r.name,
      ),
    );
    const migrationsDir = path.join(process.cwd(), "migrations");
    const files = (await readdir(migrationsDir).catch(() => []))
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .filter((f) => !done.has(f));
    for (const file of files) {
      const sqlText = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query("begin");
      try {
        await client.query(sqlText);
        await client.query(
          "insert into sfragaadv.schema_migrations (name) values ($1)",
          [file],
        );
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (hasExternalDatabase()) {
    const db = await getExternalPool();
    try {
      return (await db.query(text, params)).rows as T[];
    } catch (error: unknown) {
      const resolved = resolveDatabaseUrl();
      const message = error instanceof Error ? error.message : String(error);
      if (/ENOTFOUND|getaddrinfo|ECONNREFUSED|ETIMEDOUT|ENETUNREACH/i.test(message)) {
        throw new Error(
          `Falha ao gravar no Postgres (source=${resolved?.source ?? "?"} host=${resolved?.host ?? "?"}): host inacessível. Confira LUSEAN_URL.`,
        );
      }
      throw error;
    }
  }

  if (isPlatformDatabaseBlocked()) {
    const diag = databaseDiagnostics();
    throw new Error(
      `LUSEAN_URL é obrigatória: só há hosts internos (luseanHost=${diag.luseanHost} reclamanteHost=${diag.reclamanteHost} databaseUrlHost=${diag.databaseUrlHost}).`,
    );
  }

  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(`
    CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
      SELECT '00000000-0000-4000-8000-000000000000'::uuid;
    $$ LANGUAGE SQL;
  `);
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS sfragaadv;
    SET search_path TO sfragaadv, public;
  `);

  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sqlText = await readFile(path.join(migrationsDir, file), "utf8");
    await db.exec(sqlText);
  }
  return db;
}

/** App tables live in schema sfragaadv (not public). */
export const APP_SCHEMA = "sfragaadv";

export async function applyOptionalIndexes(): Promise<{ applied: boolean; reason?: string }> {
  if (!hasExternalDatabase()) {
    return { applied: false, reason: "no_external_database" };
  }
  const statements = [
    `CREATE INDEX IF NOT EXISTS idx_reclamante_gestante ON sfragaadv.reclamante (gestante)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_submitted_at ON sfragaadv.reclamante (submitted_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_telefone ON sfragaadv.reclamante (telefone)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_tally_submission_id ON sfragaadv.reclamante (tally_submission_id) WHERE tally_submission_id IS NOT NULL`,
  ];
  for (const statement of statements) {
    await sql(statement);
  }
  return { applied: true };
}
