import type { Metadata } from "next";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CopyEmail } from "@/components/public/copy-email";
import { SocialLinks } from "@/components/public/social-links";
import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { resolveLocale } from "@/i18n/resolve-locale";
import { pickOptional } from "@/lib/i18n-content";
import { buildMetadata } from "@/lib/seo";
import { readSocialLinks } from "@/lib/social";
import { getSiteSettings } from "@/server/queries/public";

import { ContactForm } from "./contact-form";

export async function generateMetadata(
  props: PageProps<"/[locale]/contact">,
): Promise<Metadata> {
  const locale = await resolveLocale(props.params);
  const t = await getTranslations({ locale, namespace: "ContactPage" });

  return buildMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage(
  props: PageProps<"/[locale]/contact">,
) {
  const locale = await resolveLocale(props.params);
  const settings = await getSiteSettings();
  const t = await getTranslations("ContactPage");

  const city = settings ? pickOptional(settings, "city", locale) : null;
  const socialLinks = readSocialLinks(settings?.socialLinks);

  return (
    <Section title={t("title")} description={t("description")}>
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <AnimatedIn>
          <ContactForm />
        </AnimatedIn>

        <AnimatedIn delay={0.1} className="space-y-4">
          {settings ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MailIcon className="size-4" />
                    {t("emailCard")}
                  </p>
                  <p dir="ltr" className="font-medium break-all">
                    {settings.email}
                  </p>
                  <div className="pt-1">
                    <CopyEmail email={settings.email} />
                  </div>
                </div>

                {settings.phone ? (
                  <div className="border-t pt-4">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PhoneIcon className="size-4" />
                      {t("phone")}
                    </p>
                    <p dir="ltr" className="mt-1 font-medium">
                      {settings.phone}
                    </p>
                  </div>
                ) : null}

                {city ? (
                  <div className="border-t pt-4">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="size-4" />
                      {t("location")}
                    </p>
                    <p className="mt-1 font-medium">{city}</p>
                  </div>
                ) : null}

                {socialLinks.length > 0 ? (
                  <div className="border-t pt-4">
                    <p className="mb-1 text-sm text-muted-foreground">
                      {t("social")}
                    </p>
                    <SocialLinks links={socialLinks} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </AnimatedIn>
      </div>
    </Section>
  );
}
