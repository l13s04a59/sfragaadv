import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth-session";
import { authenticateUser } from "@/lib/auth-user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      login?: string;
      password?: string;
    };
    const login = typeof body.login === "string" ? body.login : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!login.trim() || !password) {
      return NextResponse.json(
        { error: "Informe login e senha." },
        { status: 400 },
      );
    }

    const user = await authenticateUser(login, password);
    if (!user) {
      return NextResponse.json(
        { error: "Login ou senha inválidos." },
        { status: 401 },
      );
    }

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
