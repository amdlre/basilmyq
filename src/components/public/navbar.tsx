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
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        isScrolled
          ? "border-b bg-background/85 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/">
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
          <ThemeToggle />
          <LocaleToggle />

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
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <BrandMark name={siteName} logoUrl={logoUrl} />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href={link.href}>{t(link.key)}</Link>
                    </Button>
                  </SheetClose>
                ))}
                {cvUrl ? (
                  <Button asChild className="mt-2">
                    <a href="/api/cv" target="_blank" rel="noopener noreferrer">
                      <DownloadIcon />
                      {t("downloadCv")}
                    </a>
                  </Button>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
