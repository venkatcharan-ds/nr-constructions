import { formatPrice } from "@/lib/utils";
import { PROJECT } from "@/data/project";

/**
 * Price highlight block driven by PROJECT.pricing from the data layer.
 * Animated as a single unit by the parent HeroContent stagger — no internal motion.
 */
export function HeroStats() {
  const { min, label } = PROJECT.pricing;
  const formattedPrice = formatPrice(min);

  return (
    <div>
      <p className="text-label tracking-micro uppercase text-stone/60 mb-space-1">
        Starting from
      </p>
      <p
        className="font-display text-heading-1 tracking-heading text-laterite num-tabular"
        aria-label={`Starting from ${formattedPrice}`}
      >
        {formattedPrice}
      </p>
      <p className="text-label text-stone/60 tracking-tight mt-space-1">
        {label}
      </p>
    </div>
  );
}
