"use client";

import { type ReactNode, useEffect, useRef } from "react";

type AnimatedInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Fade-and-rise on scroll into view.
 *
 * Two deliberate choices, both of them performance decisions:
 *
 * 1. CSS transition plus an IntersectionObserver rather than a motion library.
 *    The library version pulled ~89 KB of mostly unused JavaScript onto every
 *    public page for a fade.
 *
 * 2. Nothing is hidden during server rendering. The hidden state is applied on
 *    mount, and only to elements that are already below the fold. Hiding
 *    everything up front delays the largest contentful paint until hydration
 *    finishes, because the LCP element itself starts at `opacity: 0` — which is
 *    exactly what was happening here, and cost several seconds.
 *
 * The observer flips a data attribute on the node instead of setting React
 * state, so revealing an element costs no re-render.
 */
export function AnimatedIn({
  children,
  delay = 0,
  className,
}: AnimatedInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Already visible on load: leave it painted, nothing to animate.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.animate = "";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.dataset.animate = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
