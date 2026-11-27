import bcrypt from "bcryptjs";
import { sql } from "./db";
import type { PortalSchemaId } from "./portal-schemas";
import { isPortalSchemaId } from "./portal-schemas";

export type AppUserRow = {
  id: number;
  login: string;
  password_hash: string;
  schema_permitido: string;
  is_active: string;
};

export async function findActiveUserByLogin(
  login: string,
): Promise<AppUserRow | null> {
  const trimmed = login.trim();
  if (!trimmed) return null;
  const rows = await sql<AppUserRow>(
    `select id, login, password_hash, schema_permitido, is_active
     from public.app_user
     where login = $1 and is_deleted = 'f'
     limit 1`,
    [trimmed],
  );
  return rows[0] ?? null;
}

export async function authenticateUser(
  login: string,
  password: string,
): Promise<{ id: number; login: string; schema: PortalSchemaId } | null> {
  const user = await findActiveUserByLogin(login);
  if (!user || user.is_active !== "t") return null;
  if (!isPortalSchemaId(user.schema_permitido)) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;

  return {
    id: user.id,
    login: user.login,
    schema: user.schema_permitido,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
