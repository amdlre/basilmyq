import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import type { AppLocale } from "@/i18n/routing";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { ZodLocaleProvider } from "@/components/shared/zod-locale-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  locale: AppLocale;
  direction: "rtl" | "ltr";
  children: ReactNode;
};

/**
 * Server Component on purpose: `NextIntlClientProvider` needs to read the
 * request configuration before handing messages down to the client boundary.
 */
export function AppProviders({
  locale,
  direction,
  children,
}: AppProvidersProps) {
  return (
    <NextIntlClientProvider>
      <ZodLocaleProvider locale={locale}>
        <NuqsAdapter>
          <ThemeProvider>
            <DirectionProvider dir={direction}>
              <TooltipProvider>
                {children}
                <Toaster
                  position={
                    direction === "rtl" ? "bottom-left" : "bottom-right"
                  }
                  dir={direction}
                  richColors
                />
              </TooltipProvider>
            </DirectionProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </ZodLocaleProvider>
    </NextIntlClientProvider>
  );
}
