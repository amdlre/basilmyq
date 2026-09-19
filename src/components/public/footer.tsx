import { getTranslations } from "next-intl/server";

import { BrandMark } from "@/components/shared/brand-mark";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pick, pickLogo } from "@/lib/i18n-content";
import type { PublicSettings } from "@/server/queries/public";

import { SocialLinks, type SocialLink } from "./social-links";

const LINKS = [
  { href: "/projects", key: "projects" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

type FooterProps = {
  settings: PublicSettings;
  socialLinks: SocialLink[];
  locale: AppLocale;
};

export async function Footer({ settings, socialLinks, locale }: FooterProps) {
  const t = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");
  const year = new Date().getFullYear();
  const siteName = pick(settings, "siteName", locale);

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="space-y-2">
            <p>
              <BrandMark name={siteName} logoUrl={pickLogo(settings, locale)} />
            </p>
            <p className="max-w-xs text-sm text-balance text-muted-foreground">
              {pick(settings, "tagline", locale)}
            </p>
          </div>

          <nav aria-label={tFooter("links")} className="flex flex-col gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="space-y-3">
            <a
              href={`mailto:${settings.email}`}
              dir="ltr"
              className="block text-sm transition-colors hover:text-primary"
            >
              {settings.email}
            </a>
            <SocialLinks links={socialLinks} />
          </div>
        </div>

        <p className="border-t pt-6 text-xs text-muted-foreground">
          {tFooter("rights", { year, name: siteName })}
        </p>
      </div>
    </footer>
  );
}
