import type { PortalSchemaId } from "./portal-schemas";
import { isPortalSchemaId } from "./portal-schemas";

export const SESSION_COOKIE = "lusean_session";

/** 12 hours */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export type SessionPayload = {
  userId: number;
  login: string;
  schema: PortalSchemaId;
  exp: number;
};

/** True when LUSEAN_SESSION_SECRET (or SESSION_SECRET) is configured. */
export function hasSessionSecret(): boolean {
  return Boolean(
    process.env.LUSEAN_SESSION_SECRET?.trim() ||
      process.env.SESSION_SECRET?.trim(),
  );
}

/**
 * Portal sessions require an explicit secret — no built-in fallback
 * (a hardcoded key would allow forging cookies in the published app).
 */
function requireSessionSecret(): string {
  const fromEnv =
    process.env.LUSEAN_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!fromEnv) {
    throw new Error(
      "LUSEAN_SESSION_SECRET é obrigatório para sessões do portal (sem valor padrão).",
    );
  }
  return fromEnv;
}

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlFromString(s: string): string {
  return b64urlFromBytes(new TextEncoder().encode(s));
}

function bytesFromB64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const normalized = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof atob === "function") {
    const bin = atob(normalized);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(normalized, "base64"));
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(requireSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signData(data: string): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return b64urlFromBytes(new Uint8Array(sig));
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function signSession(
  payload: Omit<SessionPayload, "exp"> & { exp?: number },
): Promise<string> {
  const body: SessionPayload = {
    ...payload,
    exp: payload.exp ?? Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const data = b64urlFromString(JSON.stringify(body));
  const sig = await signData(data);
  return `${data}.${sig}`;
}

export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token || !hasSessionSecret()) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  let expected: string;
  try {
    expected = await signData(data);
  } catch {
    return null;
  }
  try {
    const a = bytesFromB64url(sig);
    const b = bytesFromB64url(expected);
    if (!timingSafeEqualBytes(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const json = new TextDecoder().decode(bytesFromB64url(data));
    const raw = JSON.parse(json) as Partial<SessionPayload>;
    if (
      typeof raw.userId !== "number" ||
      typeof raw.login !== "string" ||
      typeof raw.schema !== "string" ||
      typeof raw.exp !== "number"
    ) {
      return null;
    }
    if (raw.exp < Math.floor(Date.now() / 1000)) return null;
    if (!isPortalSchemaId(raw.schema)) return null;
    return {
      userId: raw.userId,
      login: raw.login,
      schema: raw.schema,
      exp: raw.exp,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function readCookie(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
