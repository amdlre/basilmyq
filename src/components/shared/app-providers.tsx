import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  direction: "rtl" | "ltr";
  children: ReactNode;
};

/**
 * Server Component on purpose: `NextIntlClientProvider` needs to read the
 * request configuration before handing messages down to the client boundary.
 */
export function AppProviders({ direction, children }: AppProvidersProps) {
  return (
    <NextIntlClientProvider>
      <NuqsAdapter>
        <ThemeProvider>
          <DirectionProvider dir={direction}>
            <TooltipProvider>
              {children}
              <Toaster
                position={direction === "rtl" ? "bottom-left" : "bottom-right"}
                dir={direction}
                richColors
              />
            </TooltipProvider>
          </DirectionProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
