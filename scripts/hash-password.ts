/* eslint-disable no-console */
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/**
 * Generates the two secrets the single-admin login needs. The plaintext
 * password is never written anywhere — only its bcrypt hash is printed.
 */
async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const password = (await rl.question("Admin password: ")).trim();
  rl.close();

  if (password.length < 12) {
    console.error("\nRefusing: use at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Next.js runs env files through dotenv-expand, so an unescaped `$2b$12$…`
  // is read as three empty variables and the hash arrives as "". Escaping each
  // `$` is what makes it survive the load.
  const escapedHash = hash.replaceAll("$", "\\$");

  console.log("\nAdd these to .env.local (and to your Coolify environment):\n");
  console.log(`ADMIN_PASSWORD_HASH='${escapedHash}'`);
  console.log(`AUTH_SECRET='${randomBytes(32).toString("base64")}'`);
  console.log(
    "\nThe backslashes before each $ are required — Next.js expands unescaped\n" +
      "$ sequences in env files, which would silently blank out the hash.\n",
  );
}

void main();
