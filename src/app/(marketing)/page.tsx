import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Ready-to-Move 2 BHK Apartments in Goa",
  description:
    "G+4 residential apartments at Corlim, Goa. 2 BHK units of 102–103 sqm starting ₹61 Lakhs. Ready to move. NR Constructions.",
  path: "/",
});

/**
 * Homepage — vertical-slice placeholder.
 * Full hero, features, gallery, and contact sections will replace this.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center gap-space-6 pt-nav">
      <h1 className="font-display text-display-2 text-onyx text-center max-w-prose text-balance">
        Premium 2&nbsp;BHK Apartments in Goa
      </h1>
      <p className="text-body-lg text-stone text-center max-w-xl text-pretty">
        G+4 ready-to-move residences at Corlim. 102–103&nbsp;sqm starting at
        ₹&nbsp;61&nbsp;Lakhs.
      </p>
    </div>
  );
}
