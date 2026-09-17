import { CheckIcon } from "lucide-react";

import { AnimatedIn } from "@/components/shared/animated-in";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import type { AppLocale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";

type ServiceRow = Record<string, unknown> & {
  id: string;
  price: string | null;
  featuresAr: string[];
  featuresEn: string[];
};

export function ServicesSection({
  services,
  locale,
  title,
  description,
}: {
  services: ServiceRow[];
  locale: AppLocale;
  title: string;
  description?: string;
}) {
  if (services.length === 0) return null;

  return (
    <Section title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => {
          const features =
            locale === "ar" ? service.featuresAr : service.featuresEn;

          return (
            <AnimatedIn key={service.id} delay={index * 0.05}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <h3 className="font-heading font-semibold text-balance">
                    {pick(service, "title", locale)}
                  </h3>
                  <p className="text-sm text-balance text-muted-foreground">
                    {pick(service, "description", locale)}
                  </p>

                  {features.length > 0 ? (
                    <ul className="space-y-1.5 pt-1 text-sm">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {service.price ? (
                    <p className="mt-auto pt-3 text-sm font-medium">
                      {service.price}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </AnimatedIn>
          );
        })}
      </div>
    </Section>
  );
}
