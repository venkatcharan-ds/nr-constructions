"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLogoProps {
  /** Controls text colour — light on dark hero, dark on scrolled glass background. */
  isScrolled: boolean;
}

/**
 * Site logo rendered as styled text.
 *
 * "NR" uses the display typeface (Cormorant Garamond) at heading-3 scale.
 * "Constructions" uses the body typeface (Inter) at label scale.
 *
 * When a brand SVG is available, replace the text spans with next/image.
 * The colour-switching logic and link wrapper remain identical.
 */
export function NavLogo({ isScrolled }: NavLogoProps) {
  return (
    <Link
      href="/"
      aria-label="NR Constructions — Home"
      className="flex items-baseline gap-space-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 rounded-sm"
    >
      <span
        className={cn(
          "font-display text-heading-3 font-medium leading-none",
          "transition-colors duration-normal",
          isScrolled ? "text-onyx" : "text-ivory",
        )}
      >
        NR
      </span>
      <span
        className={cn(
          "text-label tracking-label uppercase font-medium leading-none",
          "transition-colors duration-normal",
          isScrolled ? "text-stone" : "text-ivory/70",
        )}
      >
        Constructions
      </span>
    </Link>
  );
}
