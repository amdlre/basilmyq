import { EyeIcon, MessageSquareQuoteIcon, StarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageShell } from "@/components/shared/page-shell";
import { StatsGrid } from "@/components/shared/stats-grid";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getTestimonials } from "@/server/queries/dashboard";
import { getTestimonialStats } from "@/server/queries/stats";

import { TestimonialsClient } from "./testimonials-client";

export default async function TestimonialsPage(
  props: PageProps<"/[locale]/dashboard/testimonials">,
) {
  await resolveLocale(props.params);
  const [rows, stats] = await Promise.all([
    getTestimonials(),
    getTestimonialStats(),
  ]);
  const t = await getTranslations("Testimonials");
  const tNav = await getTranslations("Nav");

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      breadcrumbs={[
        { label: tNav("dashboard.title"), href: "/dashboard" },
        { label: t("title") },
      ]}
    >
      <StatsGrid
        stats={[
          {
            label: t("stats.total"),
            value: stats.total,
            icon: MessageSquareQuoteIcon,
          },
          {
            label: t("stats.averageRating"),
            value: stats.averageRating,
            icon: StarIcon,
            variant: "accent",
          },
          {
            label: t("stats.visible"),
            value: stats.visible,
            icon: EyeIcon,
            variant: "success",
          },
        ]}
      />
      <TestimonialsClient rows={rows} />
    </PageShell>
  );
}
