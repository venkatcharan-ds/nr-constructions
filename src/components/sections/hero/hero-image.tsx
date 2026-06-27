"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroImageVariants,
  heroImageReducedVariants,
  heroImageTransition,
  floatingCardVariants,
  floatingCardReducedVariants,
  floatingCard1Transition,
  floatingCard2Transition,
} from "@/lib/motion/variants";

/**
 * Temporary building image placeholder.
 * Replace the inner content with next/image when photography is ready.
 * The outer structure (fill, overflow-hidden) stays identical.
 */
function HeroImagePlaceholder() {
  return (
    <div
      className={cn(
        "w-full h-full",
        "bg-gradient-to-br from-deep-water to-onyx",
        "flex flex-col items-center justify-center gap-space-4",
      )}
      role="img"
      aria-label="NR Constructions apartment building — photography coming soon"
    >
      <div className="w-16 h-16 rounded-full bg-stone/10 flex items-center justify-center">
        <Building2 className="w-8 h-8 text-stone/30" aria-hidden="true" />
      </div>
      <p className="text-body-sm text-stone/40 tracking-label uppercase text-center px-space-8">
        Building Photography
        <br />
        Coming Soon
      </p>
    </div>
  );
}

/**
 * Right panel of the hero section.
 *
 * Wraps the image placeholder (later: next/image) with:
 *   - A fade-in scale entrance animation
 *   - Two floating info cards that animate in with a delay
 *
 * On mobile: order-1 (above content), fixed height.
 * On desktop: order-2 (right column), stretches to viewport height.
 */
export function HeroImage() {
  const prefersReducedMotion = useReducedMotion();
  const imgVariants = prefersReducedMotion
    ? heroImageReducedVariants
    : heroImageVariants;
  const cardVariants = prefersReducedMotion
    ? floatingCardReducedVariants
    : floatingCardVariants;

  return (
    <motion.div
      variants={imgVariants}
      initial="hidden"
      animate="visible"
      transition={heroImageTransition}
      className={cn(
        // Stacking order
        "order-1 lg:order-2",
        // Mobile: fixed height to show a good portion of the image
        "relative h-[62vw] min-h-64 md:h-[50vw]",
        // Desktop: auto height, stretches to match the content column
        "lg:h-auto lg:min-h-screen",
        "overflow-hidden",
      )}
    >
      {/* Image fills the container absolutely — swap inner content for next/image */}
      <div className="absolute inset-0">
        <HeroImagePlaceholder />
      </div>

      {/* Subtle bottom gradient to blend into section bg on desktop */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 lg:hidden overlay-hero pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Floating Card 1: Ready to Move status ───────────────────────── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={floatingCard1Transition}
        aria-hidden="true"
        className={cn(
          "absolute top-space-6 right-space-4 md:right-space-6",
          "bg-ivory rounded-xl shadow-lg",
          "px-space-4 py-space-3",
          "flex items-center gap-space-3",
          "z-raised",
        )}
      >
        <span
          className="w-2.5 h-2.5 rounded-full bg-success shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-body-sm font-medium text-onyx leading-none mb-space-1">
            Ready to Move
          </p>
          <p className="text-micro text-stone">G+4 Building · Corlim</p>
        </div>
      </motion.div>

      {/* ── Floating Card 2: Starting price ─────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={floatingCard2Transition}
        aria-hidden="true"
        className={cn(
          "absolute bottom-space-6 left-space-4 md:left-space-6",
          "bg-ivory rounded-xl shadow-lg",
          "px-space-4 py-space-3",
          "z-raised",
        )}
      >
        <p className="text-micro text-stone tracking-micro uppercase mb-space-1">
          Starting from
        </p>
        <p className="font-display text-heading-3 tracking-heading text-laterite num-tabular">
          {formatPrice(6_100_000)}
        </p>
        <p className="text-micro text-stone mt-space-1">per unit · 2 BHK</p>
      </motion.div>
    </motion.div>
  );
}
