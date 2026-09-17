"use client";

import { useEffect, useRef } from "react";

import { recordPostView } from "@/server/actions/views";

/**
 * Records one view per mount, client-side, so prefetches and bot crawls of the
 * server render do not inflate the count. The ref guards React's double-invoked
 * effects in development.
 */
export function ViewCounter({ slug }: { slug: string }) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void recordPostView(slug);
  }, [slug]);

  return null;
}
