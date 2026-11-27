import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  verifySession,
  type SessionPayload,
} from "./auth-session";
import type { PortalSchemaId } from "./portal-schemas";

export async function getPortalSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Require a valid portal session; redirect to login otherwise. */
export async function requirePortalSession(): Promise<SessionPayload> {
  const session = await getPortalSession();
  if (!session) redirect("/portal");
  return session;
}

/**
 * Require session whose schema_permitido matches the requested schema.
 * Forged schema URLs are rejected (redirect home module).
 */
export async function requirePortalSchemaAccess(
  schema: string,
): Promise<SessionPayload> {
  const session = await requirePortalSession();
  if (session.schema !== schema) {
    redirect(`/portal/${session.schema}`);
  }
  return session;
}

export function assertSessionSchema(
  session: SessionPayload,
  schema: PortalSchemaId,
): boolean {
  return session.schema === schema;
}
