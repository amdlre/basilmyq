import type { AppLocale } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

/**
 * Structured data.
 *
 * Rendered as a `<script type="application/ld+json">`. The payload is built
 * from typed helpers below and serialised with `JSON.stringify`, so no
 * caller-supplied string is ever interpolated into the tag.
 */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Safe: the value is machine-generated JSON, never raw HTML.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  );
}

export function PersonJsonLd({
  name,
  description,
  locale,
  email,
  image,
  sameAs,
  jobTitle,
}: {
  name: string;
  description: string;
  locale: AppLocale;
  email: string;
  image?: string | null;
  sameAs: string[];
  jobTitle?: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        description,
        url: absoluteUrl(`/${locale}`),
        email: `mailto:${email}`,
        ...(image ? { image: absoluteUrl(image) } : {}),
        ...(jobTitle ? { jobTitle } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

export function CreativeWorkJsonLd({
  name,
  description,
  locale,
  slug,
  image,
  datePublished,
  keywords,
  authorName,
}: {
  name: string;
  description: string;
  locale: AppLocale;
  slug: string;
  image?: string | null;
  datePublished?: string;
  keywords: string[];
  authorName: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description,
        url: absoluteUrl(`/${locale}/projects/${slug}`),
        inLanguage: locale,
        author: { "@type": "Person", name: authorName },
        ...(image ? { image: absoluteUrl(image) } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
      }}
    />
  );
}

export function BlogPostingJsonLd({
  headline,
  description,
  locale,
  slug,
  image,
  datePublished,
  dateModified,
  keywords,
  authorName,
}: {
  headline: string;
  description: string;
  locale: AppLocale;
  slug: string;
  image?: string | null;
  datePublished?: string;
  dateModified?: string;
  keywords: string[];
  authorName: string;
}) {
  const url = absoluteUrl(`/${locale}/blog/${slug}`);

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        inLanguage: locale,
        author: { "@type": "Person", name: authorName },
        publisher: { "@type": "Person", name: authorName },
        ...(image ? { image: absoluteUrl(image) } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
      }}
    />
  );
}
