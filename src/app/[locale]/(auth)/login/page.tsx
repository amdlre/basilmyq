import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/dashboard/login-form";
import { resolveLocale } from "@/i18n/resolve-locale";

export async function generateMetadata(
  props: PageProps<"/[locale]/login">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const t = await getTranslations({ locale, namespace: "Login" });

  return {
    title: t("title"),
    // The admin entrance should never appear in search results.
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  await resolveLocale(props.params);

  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center p-4"
    >
      <LoginForm />
    </main>
  );
}
