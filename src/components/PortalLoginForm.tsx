"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  nextPath?: string | null;
};

export function PortalLoginForm({ nextPath }: Props) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
        schema?: string;
      };
      if (!res.ok) {
        setError(data.error || "Falha no login.");
        return;
      }
      // Always honour schema_permitido from the server (never open chooser).
      const allowed = data.redirect || "/portal";
      const target =
        nextPath && nextPath === allowed ? nextPath : allowed;
      router.replace(target);
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="portal-login" onSubmit={onSubmit} noValidate>
      <label className="portal-login-field">
        <span>Login</span>
        <input
          name="login"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          disabled={pending}
        />
      </label>
      <label className="portal-login-field">
        <span>Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={pending}
        />
      </label>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
