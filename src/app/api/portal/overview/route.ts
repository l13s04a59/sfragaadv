import { NextResponse } from "next/server";
import {
  readCookie,
  SESSION_COOKIE,
  verifySession,
} from "@/lib/auth-session";
import { getSfragaOverview } from "@/lib/portal-sfraga-overview";

export const runtime = "nodejs";

/**
 * Data API for portal overview — requires session with schema sfragaadv.
 * Rejects forged access to other schemas.
 */
export async function GET(request: Request) {
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (session.schema !== "sfragaadv") {
    return NextResponse.json(
      { error: "Acesso negado a este schema." },
      { status: 403 },
    );
  }

  const overview = await getSfragaOverview();
  return NextResponse.json(
    { ok: true, schema: session.schema, overview },
    { headers: { "cache-control": "private, no-store" } },
  );
}
