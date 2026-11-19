import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

function rawDatabaseUrl(): string {
  return (
    process.env.RECLAMANTE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ""
  );
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
  return rawDatabaseUrl() !== "";
}

export function databaseMode(): "postgres" | "pglite" {
  return hasExternalDatabase() ? "postgres" : "pglite";
}

let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;
let externalReady: Promise<pg.Pool> | undefined;

async function getExternalPool(): Promise<pg.Pool> {
  const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl());
  if (databaseUrl === "") {
    throw new Error("No external database URL configured");
  }
  externalReady ??= (async () => {
    pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: false,
    });
    // Self-heal hosted DBs that were provisioned before migrate-on-build ran.
    await ensureExternalMigrations(pool);
    return pool;
  })().catch((error: unknown) => {
    externalReady = undefined;
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
    return (await db.query(text, params)).rows as T[];
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
