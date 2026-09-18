import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { MessagesProvider } from "@/components/shared/messages-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  direction: "rtl" | "ltr";
  /**
   * Namespaces handed to the client. next-intl serialises whatever it is given
   * into every response, so shipping the whole catalogue would put the entire
   * dashboard vocabulary into every public page. Inner areas add their own.
   */
  namespaces: readonly string[];
  children: ReactNode;
};

/**
 * Server Component on purpose: the message provider reads the request
 * configuration before handing anything to the client boundary.
 */
export function AppProviders({
  direction,
  namespaces,
  children,
}: AppProvidersProps) {
  return (
    <MessagesProvider namespaces={namespaces}>
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
    </MessagesProvider>
  );
}
