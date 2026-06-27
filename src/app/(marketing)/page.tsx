import { createMetadata } from "@/lib/seo/metadata";
import { Hero } from "@/components/sections/hero";

export const metadata = createMetadata({
  title: "Ready-to-Move 2 BHK Luxury Apartments in Goa",
  description:
    "G+4 premium residences at Corlim, North Goa. Spacious 2 BHK apartments of 102–103 sqm starting ₹61 Lakhs. Lift, covered parking, ready to move.",
  path: "/",
});

export default function HomePage() {
  return <Hero />;
}
