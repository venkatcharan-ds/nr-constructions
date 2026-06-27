import { HeroContent } from "./hero-content";
import { HeroImage } from "./hero-image";

/**
 * Full-screen cinematic hero.
 * HeroImage owns the background layer (image + overlays + floating cards).
 * HeroContent owns the text overlay (absolutely positioned over the image).
 * Both are Client Components that handle their own Framer Motion entrance.
 */
export function Hero() {
  return (
    <section
      aria-label="Roshan Apartments — Ready to Move 2 BHK in Goa"
      className="relative min-h-screen overflow-hidden bg-onyx"
    >
      <HeroImage />
      <HeroContent />
    </section>
  );
}
