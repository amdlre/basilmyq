import { getTranslations } from "next-intl/server";

import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { resolveLocale } from "@/i18n/resolve-locale";
import { Link } from "@/i18n/navigation";

export default async function PublicLayout(props: LayoutProps<"/[locale]">) {
  await resolveLocale(props.params);
  const t = await getTranslations("Nav");

  return (
    <>
      {/* Navbar and Footer land in Phase 5; this is the minimal chrome for Phase 0. */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-heading text-sm font-semibold">
            basilmyq
          </Link>
          <nav aria-label={t("home")} className="flex items-center gap-1">
            <ThemeToggle />
            <LocaleToggle />
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {props.children}
      </main>
    </>
  );
}
