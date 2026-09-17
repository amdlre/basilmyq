import "server-only";

import { SignJWT, jwtVerify } from "jose";

import { SESSION_MAX_AGE } from "@/lib/constants";

import { getAuthEnv } from "./config";

const ISSUER = "basilmyq";
const AUDIENCE = "basilmyq-admin";

export type Session = {
  email: string;
  expiresAt: Date;
};

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getAuthEnv().AUTH_SECRET);
}

export async function signSession(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/**
 * Verifies signature, issuer, audience and expiry, and additionally re-checks
 * the email against the environment — so rotating ADMIN_EMAIL invalidates every
 * outstanding token immediately.
 */
export async function verifySession(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const email = payload.email;
    if (typeof email !== "string" || !payload.exp) return null;

    if (email.toLowerCase() !== getAuthEnv().ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    return { email, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    // Any malformed, tampered or expired token is simply "no session".
    return null;
  }
}
