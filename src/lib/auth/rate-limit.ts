import "server-only";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * In-memory login throttle, keyed by IP. Deliberately simple: this guards one
 * admin account on a single-instance deployment. It resets on restart, and it
 * would need shared storage if the app is ever scaled horizontally.
 */
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkLoginRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - bucket.count - 1,
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  bucket.count += 1;
}

export function clearLoginRateLimit(ip: string): void {
  buckets.delete(ip);
}

/** Drops expired buckets so the map cannot grow without bound. */
export function pruneLoginRateLimits(): void {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(ip);
  }
}
