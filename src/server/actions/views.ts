"use server";

import { db } from "@/server/db";

/**
 * Increments a post's view counter.
 *
 * Public on purpose — it is called from the article page and touches nothing
 * but this one counter. Failures are swallowed: a missed view must never break
 * the page for a reader.
 */
export async function recordPostView(slug: string): Promise<void> {
  try {
    await db.post.updateMany({
      where: { slug, isVisible: true, publishedAt: { not: null } },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Counting is best-effort.
  }
}
