import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";

export interface CreateMetadataOptions {
  /** Page-specific title. Rendered as "[title] | NR Constructions". */
  title?: string;
  /** Page-specific description. Falls back to site default. */
  description?: string;
  /** Absolute path from root, e.g. "/project/corlim". Used for canonical URL. */
  path?: string;
  /** Absolute Cloudinary URL for the OG image. Falls back to site default. */
  ogImage?: string;
  /** Alt text for the OG image. */
  ogImageAlt?: string;
  /** Set true for admin, thank-you, and other pages that must not be indexed. */
  noIndex?: boolean;
}

/**
 * Produce a complete Next.js Metadata object for a page.
 *
 * The root layout sets the title template and site-wide defaults.
 * Pages call this to supply only what is different — everything else is inherited.
 *
 * @example
 * // app/(marketing)/about/page.tsx
 * export const metadata = createMetadata({
 *   title: 'About Us',
 *   description: 'NR Constructions — quality residential construction in Goa.',
 *   path: '/about',
 * })
 */
export function createMetadata({
  title,
  description,
  path = "/",
  ogImage,
  ogImageAlt,
  noIndex = false,
}: CreateMetadataOptions = {}): Metadata {
  const resolvedDescription = description ?? SITE_CONFIG.description;
  const canonicalUrl = `${SITE_CONFIG.url}${path === "/" ? "" : path}`;
  const resolvedOgImage = ogImage ?? SITE_CONFIG.ogImage;
  const resolvedAlt = ogImageAlt ?? title ?? SITE_CONFIG.name;

  return {
    ...(title ? { title } : {}),
    description: resolvedDescription,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      url: canonicalUrl,
      description: resolvedDescription,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: resolvedAlt,
        },
      ],
    },

    twitter: {
      description: resolvedDescription,
      images: [resolvedOgImage],
    },

    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}
