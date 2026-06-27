import { formatPrice } from "@/lib/utils";

/**
 * Price highlight block rendered inside the hero stagger container.
 * Animated as a single unit by the parent — no internal motion.
 */
export function HeroStats() {
  return (
    <div>
      <p className="text-label tracking-micro uppercase text-stone/60 mb-space-1">
        Starting from
      </p>
      <p
        className="font-display text-heading-1 tracking-heading text-laterite num-tabular"
        aria-label={`Starting from ${formatPrice(6_100_000)}`}
      >
        {formatPrice(6_100_000)}
      </p>
      <p className="text-label text-stone/60 tracking-tight mt-space-1">
        per unit · all-inclusive
      </p>
    </div>
  );
}
