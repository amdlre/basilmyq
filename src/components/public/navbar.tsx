"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/shared/brand-mark";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/projects", key: "projects" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

type NavbarProps = {
  siteName: string;
  logoUrl: string | null;
  cvUrl: string | null;
};

export function Navbar({ siteName, logoUrl, cvUrl }: NavbarProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // A floating pill rather than a full-width bar: it lifts off the page,
    // then shrinks and frosts over once the page scrolls under it.
    <header
      className={cn(
        "sticky top-0 z-40 px-4 transition-all duration-300",
        isScrolled ? "pt-2" : "pt-2",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full transition-all duration-300",
          "h-13 border bg-background/70 px-3 shadow-lg backdrop-blur-md",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-1">
          <BrandMark name={siteName} logoUrl={logoUrl} eager />
        </Link>

        <nav
          aria-label={t("home")}
          className="hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(pathname.startsWith(link.href) && "text-primary")}
            >
              <Link href={link.href}>{t(link.key)}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* On phones these live inside the menu instead, to keep the bar short. */}
          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <LocaleToggle />
          </div>

          {cvUrl ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              {/* Route handler rather than the file: it records the download. */}
              <a href="/api/cv" target="_blank" rel="noopener noreferrer">
                <DownloadIcon />
                {t("downloadCv")}
              </a>
            </Button>
          ) : null}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("openMenu")}
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            {/* Full screen on phones: the links are the whole view, not a panel. */}
            <SheetContent
              side="bottom"
              // Same variant the sheet uses for its own height, so this wins.
              className="flex w-full max-w-none flex-col gap-0 p-0 data-[side=bottom]:h-dvh"
            >
              <SheetHeader className="border-b">
                <SheetTitle>
                  <BrandMark name={siteName} logoUrl={logoUrl} />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-1 flex-col justify-center gap-2 p-6">
                {LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-lg px-2 py-3 font-heading text-2xl font-semibold transition-colors hover:text-primary",
                        pathname.startsWith(link.href) && "text-primary",
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="flex items-center justify-between gap-3 border-t p-6">
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <LocaleToggle />
                </div>

                {cvUrl ? (
                  <Button asChild size="lg">
                    <a href="/api/cv" target="_blank" rel="noopener noreferrer">
                      <DownloadIcon />
                      {t("downloadCv")}
                    </a>
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
