import { cn } from "@/lib/utils";

const BADGES = [
  { id: "status", label: "Ready to Move", variant: "success" as const },
  { id: "area", label: "102–103 sqm", variant: "default" as const },
  { id: "type", label: "2 BHK", variant: "default" as const },
  { id: "lift", label: "Lift", variant: "default" as const },
  { id: "parking", label: "Covered Parking", variant: "default" as const },
] as const;

/**
 * Feature badge row rendered inside the hero stagger container.
 * Animated as a single unit by the parent HeroContent stagger — no internal motion.
 */
export function HeroBadges() {
  return (
    <ul
      className="flex flex-wrap gap-space-2"
      role="list"
      aria-label="Key features"
    >
      {BADGES.map(({ id, label, variant }) => (
        <li key={id}>
          <span
            className={cn(
              "inline-flex items-center gap-space-2",
              "px-space-3 py-space-1",
              "text-label tracking-label uppercase font-medium",
              "rounded-full border",
              variant === "success"
                ? "bg-success/15 text-success border-success/30"
                : "bg-ivory/8 text-ivory/75 border-ivory/15",
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
