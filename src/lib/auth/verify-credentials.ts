import "server-only";

import bcrypt from "bcryptjs";

import { getAuthEnv } from "./config";

/**
 * Compares the submitted credentials against the environment. The bcrypt
 * comparison runs even when the email does not match, so a wrong email and a
 * wrong password take the same amount of time.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const env = getAuthEnv();

  const emailMatches =
    email.trim().toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

  const passwordMatches = await bcrypt.compare(
    password,
    env.ADMIN_PASSWORD_HASH,
  );

  return emailMatches && passwordMatches;
}
