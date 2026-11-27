/**
 * In-memory login throttle (per process). Limits brute-force attempts by
 * client IP + login. Fine for a single Cursor Apps instance.
 */

type Bucket = {
  attempts: number;
  failures: number;
  windowStart: number;
  blockedUntil: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_ATTEMPTS_PER_WINDOW = 30;
const BLOCK_MS = 15 * 60 * 1000;

const buckets = new Map<string, Bucket>();

function keyFor(ip: string, login: string): string {
  return `${ip.trim().toLowerCase()}|${login.trim().toLowerCase()}`;
}

function now(): number {
  return Date.now();
}

function getBucket(key: string): Bucket {
  const existing = buckets.get(key);
  const t = now();
  if (!existing || t - existing.windowStart > WINDOW_MS) {
    const fresh: Bucket = {
      attempts: 0,
      failures: 0,
      windowStart: t,
      blockedUntil: 0,
    };
    buckets.set(key, fresh);
    return fresh;
  }
  return existing;
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Returns a Portuguese error message when blocked; otherwise null. */
export function assertLoginAllowed(ip: string, login: string): string | null {
  const bucket = getBucket(keyFor(ip, login));
  const t = now();
  if (bucket.blockedUntil > t) {
    const mins = Math.max(1, Math.ceil((bucket.blockedUntil - t) / 60000));
    return `Muitas tentativas. Tente de novo em cerca de ${mins} min.`;
  }
  return null;
}

export function recordLoginFailure(ip: string, login: string): void {
  const bucket = getBucket(keyFor(ip, login));
  bucket.attempts += 1;
  bucket.failures += 1;
  if (
    bucket.failures >= MAX_FAILURES ||
    bucket.attempts >= MAX_ATTEMPTS_PER_WINDOW
  ) {
    bucket.blockedUntil = now() + BLOCK_MS;
  }
}

export function recordLoginSuccess(ip: string, login: string): void {
  buckets.delete(keyFor(ip, login));
}
