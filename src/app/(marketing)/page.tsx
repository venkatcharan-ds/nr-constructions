import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { createMetadata } from "@/lib/seo/metadata";
import {
  buildLocalBusinessSchema,
  buildApartmentListingSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schemas";
import { Hero } from "@/components/sections/hero";

// Below-fold sections are code-split into separate JS chunks.
// They still SSR (no ssr:false) so SEO and initial paint are unaffected;
// the browser only parses their JS bundles when it reaches that scroll position.
const AboutSection    = dynamic(() => import("@/components/sections/about").then(m => ({ default: m.AboutSection })));
const SpecsSection    = dynamic(() => import("@/components/sections/specs").then(m => ({ default: m.SpecsSection })));
const AmenitiesSection = dynamic(() => import("@/components/sections/amenities").then(m => ({ default: m.AmenitiesSection })));
const FloorPlanSection = dynamic(() => import("@/components/sections/floor-plan").then(m => ({ default: m.FloorPlanSection })));
const GallerySection  = dynamic(() => import("@/components/sections/gallery").then(m => ({ default: m.GallerySection })));
const LocationSection = dynamic(() => import("@/components/sections/location").then(m => ({ default: m.LocationSection })));
const FaqSection      = dynamic(() => import("@/components/sections/faq").then(m => ({ default: m.FaqSection })));
const ContactSection  = dynamic(() => import("@/components/sections/contact").then(m => ({ default: m.ContactSection })));
const Footer          = dynamic(() => import("@/components/layout/footer").then(m => ({ default: m.Footer })));

export const metadata = createMetadata({
  title: "Ready-to-Move 2 BHK Luxury Apartments in Goa",
  description:
    "G+4 premium residences at Corlim, North Goa. Spacious 2 BHK apartments of 102–103 sqm starting ₹61 Lakhs. Lift, covered parking, ready to move.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      {/* ── JSON-LD Structured Data ─────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildApartmentListingSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema()) }}
      />

      <Hero />
      <Suspense>
        <AboutSection />
        <SpecsSection />
        <AmenitiesSection />
        <ErrorBoundary>
          <FloorPlanSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <GallerySection />
        </ErrorBoundary>
        <LocationSection />
        <FaqSection />
        <ErrorBoundary>
          <ContactSection />
        </ErrorBoundary>
        <Footer />
      </Suspense>
    </>
  );
}
