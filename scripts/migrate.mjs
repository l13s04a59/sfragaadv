import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

const raw =
  process.env.RECLAMANTE_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || "";

if (!raw) {
  console.error("DATABASE_URL / RECLAMANTE_DATABASE_URL not set — skip migrate");
  process.exit(0);
}

function normalize(url) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("sslmode")) u.searchParams.set("sslmode", "disable");
    return u.toString();
  } catch {
    return url.includes("sslmode=")
      ? url
      : url.includes("?")
        ? `${url}&sslmode=disable`
        : `${url}?sslmode=disable`;
  }
}

const client = new pg.Client({ connectionString: normalize(raw), ssl: false });
await client.connect();
const files = (await readdir("migrations").catch(() => []))
  .filter((f) => f.endsWith(".sql"))
  .sort();
for (const file of files) {
  const sql = await readFile(`migrations/${file}`, "utf8");
  await client.query(sql);
  console.log("applied", file);
}
await client.end();
