import { createMetadata } from "@/lib/seo/metadata";
import {
  buildLocalBusinessSchema,
  buildApartmentListingSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schemas";
import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { SpecsSection } from "@/components/sections/specs";
import { AmenitiesSection } from "@/components/sections/amenities";
import { FloorPlanSection } from "@/components/sections/floor-plan";
import { GallerySection } from "@/components/sections/gallery";
import { LocationSection } from "@/components/sections/location";
import { FaqSection } from "@/components/sections/faq";
import { ContactSection } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";

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
      <AboutSection />
      <SpecsSection />
      <AmenitiesSection />
      <FloorPlanSection />
      <GallerySection />
      <LocationSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </>
  );
}
