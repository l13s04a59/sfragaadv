import { NextResponse } from "next/server";
import {
  hasSessionSecret,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth-session";
import { authenticateUser } from "@/lib/auth-user";
import {
  assertLoginAllowed,
  clientIpFromRequest,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/login-throttle";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!hasSessionSecret()) {
      return NextResponse.json(
        {
          error:
            "Sessão do portal indisponível: defina LUSEAN_SESSION_SECRET no ambiente.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      login?: string;
      password?: string;
    };
    const login = typeof body.login === "string" ? body.login : "";
    const password = typeof body.password === "string" ? body.password : "";
    const ip = clientIpFromRequest(request);

    if (!login.trim() || !password) {
      return NextResponse.json(
        { error: "Informe login e senha." },
        { status: 400 },
      );
    }

    const blocked = assertLoginAllowed(ip, login);
    if (blocked) {
      return NextResponse.json({ error: blocked }, { status: 429 });
    }

    const user = await authenticateUser(login, password);
    if (!user) {
      recordLoginFailure(ip, login);
      return NextResponse.json(
        { error: "Login ou senha inválidos." },
        { status: 401 },
      );
    }

    recordLoginSuccess(ip, login);

    const token = await signSession({
      userId: user.id,
      login: user.login,
      schema: user.schema,
    });

    const res = NextResponse.json({
      ok: true,
      schema: user.schema,
      redirect: `/portal/${user.schema}`,
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no login";
    const safe = /password|connection string|SASL|authentication/i.test(message)
      ? "Falha ao autenticar. Verifique LUSEAN_URL no servidor."
      : message.replace(/postgresql:\/\/[^\s]+/gi, "[redacted]");
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
