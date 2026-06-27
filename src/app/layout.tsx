import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Providers } from "./providers";
import { SITE_CONFIG } from "@/config/site";
import { validateEnv } from "@/lib/env";
import "./globals.css";

/* ── Fonts ─────────────────────────────────────────────────────────────────── */
/*
   Both fonts are self-hosted via next/font — no browser request to Google.
   Each injects a CSS variable onto <html> that globals.css maps to a
   Tailwind utility:
     --font-cormorant → font-display
     --font-inter     → font-body
*/

/**
 * Cormorant Garamond — display and heading typeface.
 * Not a variable font: weights must be declared explicitly.
 * Weights used: 300 (display), 400 (h1–h2), 500 (h3), 600 (h4 / emphasis).
 */
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

/**
 * Inter — body and UI typeface.
 * Variable font: no weight declaration needed.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/* ── Viewport ───────────────────────────────────────────────────────────────── */
/*
   Exported separately from `metadata` — themeColor and viewport options
   were moved out of the metadata object in Next.js 14 and remain separate here.
*/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow user zoom — accessibility requirement
  themeColor: [
    // Browser chrome color when in light mode
    { media: "(prefers-color-scheme: light)", color: "#F5F2ED" }, // --ivory
    // Prepared for dark mode (matches --onyx)
    { media: "(prefers-color-scheme: dark)", color: "#1A1A18" },
  ],
};

/* ── Root Metadata ──────────────────────────────────────────────────────────── */
/*
   title.template — child pages export `title: "Page Name"` and get
                    "Page Name | NR Constructions" automatically.
   title.default  — shown on any page that does not export a title
                    (e.g. the homepage before its own metadata loads).
   metadataBase   — resolves relative OG image paths to the production URL.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    template: "%s | NR Constructions",
    default:
      "NR Constructions — Ready to Move 2 BHK Apartments in Corlim, Goa",
  },

  description: SITE_CONFIG.description,

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_CONFIG.name,
    title: {
      template: "%s | NR Constructions",
      default:
        "NR Constructions — Ready to Move 2 BHK Apartments in Corlim, Goa",
    },
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: "NR Constructions — Premium 2 BHK Apartments in Corlim, Goa",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | NR Constructions",
      default:
        "NR Constructions — Ready to Move 2 BHK Apartments in Corlim, Goa",
    },
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
      },
    ],
  },
};

/* ── Root Layout ────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateEnv();
  return (
    /*
       suppressHydrationWarning — required because next-themes writes
       data-theme="light" onto <html> on the client after SSR, which
       would otherwise cause a React hydration mismatch warning.

       Font variables are injected here. All child elements can reference
       var(--font-cormorant) and var(--font-inter) via the font-display
       and font-body Tailwind utilities.
    */
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className={[
          "font-body",       // font-family: var(--font-inter)
          "min-h-screen",    // structural — fills viewport
          "overflow-x-hidden", // prevents horizontal scroll from GSAP/R3F
        ].join(" ")}
      >
        {/* Skip to content — WCAG 2.1 SC 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[600] focus:px-4 focus:py-2 focus:bg-onyx focus:text-ivory focus:rounded-md focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-laterite"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
