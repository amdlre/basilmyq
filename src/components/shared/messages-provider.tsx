import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

/**
 * Hands a subset of the message catalogue to the client.
 *
 * Nesting is intentional: the root layout provides the namespaces every area
 * shares, and an inner area adds its own. next-intl serialises exactly what it
 * is given, so the public site never carries the dashboard vocabulary.
 */
export async function MessagesProvider({
  namespaces,
  children,
}: {
  namespaces: readonly string[];
  children: ReactNode;
}) {
  // `getMessages()` is typed as the exact catalogue shape, which cannot be
  // indexed by an arbitrary string, so it is read as a record here.
  const all = (await getMessages()) as unknown as Record<string, unknown>;
  const messages = Object.fromEntries(
    namespaces
      .filter((namespace) => namespace in all)
      .map((namespace) => [namespace, all[namespace]]),
  );

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
