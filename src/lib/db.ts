import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

export type DatabaseUrlSource = "RECLAMANTE_DATABASE_URL" | "DATABASE_URL";

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

/**
 * Prefer RECLAMANTE_DATABASE_URL for reclamante ingest.
 * When it is set, ignore DATABASE_URL entirely (Apps Postgres must not win).
 * If only DATABASE_URL is set, skip platform-internal hosts like postgres_postgres.
 * Never logs or returns secret values — only source name + hostname.
 */
export function resolveDatabaseUrl(): ResolvedDatabaseUrl | null {
  const reclamante = process.env.RECLAMANTE_DATABASE_URL?.trim() || "";
  if (reclamante) {
    const host = hostnameFromUrl(reclamante);
    return { url: reclamante, source: "RECLAMANTE_DATABASE_URL", host };
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() || "";
  if (!databaseUrl) return null;

  const host = hostnameFromUrl(databaseUrl);
  if (isPlatformInternalHost(host)) {
    console.warn(
      `[db] ignoring DATABASE_URL host=${host} (platform internal); set RECLAMANTE_DATABASE_URL for external Postgres`,
    );
    return null;
  }

  return { url: databaseUrl, source: "DATABASE_URL", host };
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

/** True when only Apps DATABASE_URL is present and it was skipped as internal. */
export function isPlatformDatabaseBlocked(): boolean {
  if (process.env.RECLAMANTE_DATABASE_URL?.trim()) return false;
  const databaseUrl = process.env.DATABASE_URL?.trim() || "";
  if (!databaseUrl) return false;
  return isPlatformInternalHost(hostnameFromUrl(databaseUrl));
}

export function databaseMode(): "postgres" | "pglite" {
  return hasExternalDatabase() ? "postgres" : "pglite";
}

/** Safe diagnostics for health checks (no secrets). */
export function databaseDiagnostics(): {
  mode: "postgres" | "pglite";
  source: DatabaseUrlSource | null;
  host: string | null;
  reclamanteSet: boolean;
  databaseUrlSet: boolean;
  platformDatabaseBlocked: boolean;
} {
  const resolved = resolveDatabaseUrl();
  const platformDatabaseBlocked = isPlatformDatabaseBlocked();
  return {
    mode: resolved ? "postgres" : "pglite",
    source: resolved?.source ?? null,
    host: resolved?.host ?? null,
    reclamanteSet: Boolean(process.env.RECLAMANTE_DATABASE_URL?.trim()),
    databaseUrlSet: Boolean(process.env.DATABASE_URL?.trim()),
    platformDatabaseBlocked,
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
      "Nenhum banco externo utilizável: defina RECLAMANTE_DATABASE_URL (host externo). DATABASE_URL interno da plataforma é ignorado.",
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
    });
    // Self-heal hosted DBs that were provisioned before migrate-on-build ran.
    try {
      await ensureExternalMigrations(pool);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (/ENOTFOUND|getaddrinfo|ECONNREFUSED|ETIMEDOUT|ENETUNREACH/i.test(message)) {
        throw new Error(
          `Falha ao conectar no Postgres (source=${resolved.source} host=${resolved.host}): host inacessível ou inexistente. Confira RECLAMANTE_DATABASE_URL.`,
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
    await client.query(
      "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    const done = new Set(
      (await client.query("select name from schema_migrations")).rows.map(
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
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
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
          `Falha ao gravar no Postgres (source=${resolved?.source ?? "?"} host=${resolved?.host ?? "?"}): host inacessível. Confira RECLAMANTE_DATABASE_URL.`,
        );
      }
      throw error;
    }
  }

  if (isPlatformDatabaseBlocked()) {
    const host = hostnameFromUrl(process.env.DATABASE_URL?.trim() || "");
    throw new Error(
      `RECLAMANTE_DATABASE_URL é obrigatória: DATABASE_URL host=${host} é interno da plataforma e foi ignorado.`,
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
  // IDs are supplied by the app (crypto.randomUUID); keep a stub for DEFAULT clauses.
  await db.exec(`
    CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
      SELECT '00000000-0000-4000-8000-000000000000'::uuid;
    $$ LANGUAGE SQL;
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

export async function applyOptionalIndexes(): Promise<{ applied: boolean; reason?: string }> {
  if (!hasExternalDatabase()) {
    return { applied: false, reason: "no_external_database" };
  }
  const statements = [
    `CREATE INDEX IF NOT EXISTS idx_reclamante_gestante ON reclamante (gestante)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_submitted_at ON reclamante (submitted_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_telefone ON reclamante (telefone)`,
    `CREATE INDEX IF NOT EXISTS idx_reclamante_tally_submission_id ON reclamante (tally_submission_id) WHERE tally_submission_id IS NOT NULL`,
  ];
  for (const statement of statements) {
    await sql(statement);
  }
  return { applied: true };
}
