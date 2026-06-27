import { cn } from "@/lib/utils";
import { PROJECT } from "@/data/project";

/**
 * Feature badge row driven by PROJECT.badges from the data layer.
 * Animated as a single unit by the parent HeroContent stagger — no internal motion.
 */
export function HeroBadges() {
  return (
    <ul
      className="flex flex-wrap gap-space-2"
      role="list"
      aria-label="Key features"
    >
      {PROJECT.badges.map(({ id, label, variant }) => (
        <li key={id}>
          <span
            className={cn(
              "inline-flex items-center gap-space-2",
              "px-space-4 py-space-2",
              "text-label tracking-label uppercase font-medium",
              "rounded-full border",
              variant === "success"
                ? "bg-success/15 text-success border-success/35"
                : "bg-ivory/8 text-ivory border-ivory/40",
            )}
          >
            {variant === "success" && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-success shrink-0"
                aria-hidden="true"
              />
            )}
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
