import { NextResponse, type NextRequest } from "next/server";
import {
  readCookie,
  SESSION_COOKIE,
  verifySession,
} from "@/lib/auth-session";
import { isPortalSchemaId } from "@/lib/portal-schemas";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page + auth endpoints stay public.
  if (
    pathname === "/portal" ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  const session = await verifySession(token);

  // /portal/:schema — require session; reject forged schema
  const schemaMatch = pathname.match(/^\/portal\/([^/]+)\/?$/);
  if (schemaMatch) {
    const schema = schemaMatch[1]!;
    if (!isPortalSchemaId(schema)) {
      return NextResponse.next(); // let [schema] page 404
    }
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.schema !== schema) {
      const url = request.nextUrl.clone();
      url.pathname = `/portal/${session.schema}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Portal data APIs
  if (pathname.startsWith("/api/portal/")) {
    if (!session) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/api/portal/:path*", "/api/auth/:path*"],
};
