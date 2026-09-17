import { z } from "zod";

/**
 * The single-admin credentials. There is no user table: identity lives entirely
 * in the environment, so it is validated once, loudly, at first use.
 */
const authEnvSchema = z.object({
  ADMIN_EMAIL: z.email("ADMIN_EMAIL must be a valid email address."),
  ADMIN_PASSWORD_HASH: z
    .string()
    .startsWith("$2", "ADMIN_PASSWORD_HASH must be a bcrypt hash."),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters."),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

let cached: AuthEnv | undefined;

export function getAuthEnv(): AuthEnv {
  if (cached) return cached;

  const parsed = authEnvSchema.safeParse({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    AUTH_SECRET: process.env.AUTH_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid auth environment:\n${parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}\n\nRun \`npm run hash-password\` to generate the secrets.`,
    );
  }

  cached = parsed.data;
  return cached;
}
