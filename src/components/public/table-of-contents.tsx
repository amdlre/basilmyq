"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

/**
 * Built from the rendered article rather than from the markdown source, so it
 * always matches what is actually on the page.
 */
export function TableOfContents({ contentId }: { contentId: string }) {
  const t = useTranslations("BlogPage");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    // The scan runs after paint rather than synchronously in the effect body:
    // the article has to be laid out before its headings can be measured, and
    // setting state straight from an effect would cascade an extra render.
    const frame = requestAnimationFrame(() => {
      const container = document.getElementById(contentId);
      if (!container) return;

      const found = [...container.querySelectorAll("h2, h3")].map(
        (element, index) => {
          if (!element.id) element.id = `section-${index}`;
          return {
            id: element.id,
            text: element.textContent ?? "",
            level: element.tagName === "H2" ? 2 : 3,
          };
        },
      );

      setHeadings(found);
      if (found.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (visible[0]?.target.id) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-80px 0px -70% 0px" },
      );

      for (const heading of found) {
        const element = document.getElementById(heading.id);
        if (element) observer.observe(element);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [contentId]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label={t("contents")} className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t("contents")}
      </p>
      <ul className="space-y-1.5 border-s border-border ps-3 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "ps-3" : ""}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block transition-colors hover:text-foreground",
                activeId === heading.id
                  ? "font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
