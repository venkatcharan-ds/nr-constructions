import { HeroContent } from "./hero-content";
import { HeroImage } from "./hero-image";

/**
 * Homepage hero section.
 *
 * Desktop layout: two-column split — content (55%) left, image (45%) right.
 * Mobile layout: image on top, content below (DOM order reversed via CSS order).
 *
 * Both HeroContent and HeroImage handle their own entrance animations
 * independently (both trigger on mount). The split avoids a single top-level
 * motion wrapper that would serialize two visually independent animations.
 *
 * Server Component — children are client components that opt in to animation.
 */
export function Hero() {
  return (
    <section
      aria-label="Hero — Ready to Move 2 BHK Apartments in Goa"
      className="relative bg-onyx lg:grid lg:grid-cols-[55%_45%]"
    >
      <HeroContent />
      <HeroImage />
    </section>
  );
}
