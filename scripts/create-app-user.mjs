/**
 * Create or update a portal user in public.app_user (bcrypt hash).
 *
 * Usage (never pass the password on argv in shared logs — use env):
 *
 *   LUSEAN_URL='postgresql://…' \
 *   APP_USER_LOGIN='luiz' \
 *   APP_USER_PASSWORD='…' \
 *   APP_USER_SCHEMA='sfragaadv' \
 *   node scripts/create-app-user.mjs
 *
 * Optional: APP_USER_ACTIVE=t|f (default t)
 *
 * Dry-run (print SQL placeholders only, no DB write):
 *   DRY_RUN=1 APP_USER_LOGIN=… APP_USER_PASSWORD=… APP_USER_SCHEMA=sfragaadv \
 *   node scripts/create-app-user.mjs
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const login = process.env.APP_USER_LOGIN?.trim() || "";
const password = process.env.APP_USER_PASSWORD || "";
const schema = process.env.APP_USER_SCHEMA?.trim() || "";
const active = (process.env.APP_USER_ACTIVE || "t").trim().toLowerCase() === "f" ? "f" : "t";
const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

const allowed = new Set(["sfragaadv", "lusefin", "casarotaria"]);

if (!login || login.length > 80) {
  console.error("Set APP_USER_LOGIN (1–80 chars).");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error("Set APP_USER_PASSWORD (min 8 chars) via env — never commit it.");
  process.exit(1);
}
if (!allowed.has(schema)) {
  console.error("APP_USER_SCHEMA must be sfragaadv | lusefin | casarotaria");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

if (dryRun) {
  console.log("dry-run: would upsert public.app_user");
  console.log(`  login=${login}`);
  console.log(`  schema_permitido=${schema}`);
  console.log(`  is_active=${active}`);
  console.log(`  password_hash=${hash.slice(0, 7)}… (${hash.length} chars)`);
  process.exit(0);
}

const url =
  process.env.LUSEAN_URL?.trim() ||
  process.env.RECLAMANTE_DATABASE_URL?.trim() ||
  "";

if (!url) {
  console.error("Set LUSEAN_URL (preferred) or RECLAMANTE_DATABASE_URL.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED?.trim() || url,
});
await client.connect();
try {
  await client.query("begin");
  const existing = await client.query(
    `select id from public.app_user where login = $1 and is_deleted = 'f' limit 1`,
    [login],
  );
  if (existing.rows[0]) {
    await client.query(
      `update public.app_user
       set password_hash = $2,
           schema_permitido = $3,
           is_active = $4,
           updated_at = now()
       where id = $1`,
      [existing.rows[0].id, hash, schema, active],
    );
    console.log(`updated app_user id=${existing.rows[0].id} login=${login} schema=${schema}`);
  } else {
    const inserted = await client.query(
      `insert into public.app_user (login, password_hash, schema_permitido, is_active)
       values ($1, $2, $3, $4)
       returning id`,
      [login, hash, schema, active],
    );
    console.log(`created app_user id=${inserted.rows[0].id} login=${login} schema=${schema}`);
  }
  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
