"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroContainerVariants,
  heroItemVariants,
  heroItemReducedVariants,
  heroItemTransition,
} from "@/lib/motion/variants";
import { HeroBadges } from "./hero-badges";
import { HeroStats } from "./hero-stats";
import { HeroCTA } from "./hero-cta";

/**
 * Left panel of the hero section.
 *
 * Acts as the Framer Motion stagger container — each direct child
 * (eyebrow, headline, subheading, badges, stats, CTAs) fades up in sequence.
 *
 * On mobile: order-2 (below image). On desktop: order-1 (left column).
 */
export function HeroContent() {
  const prefersReducedMotion = useReducedMotion();
  const itemVariants = prefersReducedMotion
    ? heroItemReducedVariants
    : heroItemVariants;

  return (
    <motion.div
      variants={heroContainerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // Stacking order
        "order-2 lg:order-1",
        // Layout
        "flex flex-col justify-center",
        // Spacing — mobile pads inward; desktop respects nav height at top
        "px-space-5 md:px-space-8 lg:px-space-10",
        "pt-space-8 pb-space-10 lg:pt-nav",
        // Height — desktop fills viewport height
        "lg:min-h-screen",
      )}
    >
      {/* Eyebrow */}
      <motion.div
        variants={itemVariants}
        transition={heroItemTransition}
        className="flex items-center gap-space-2 mb-space-5"
      >
        <MapPin
          className="w-3.5 h-3.5 text-laterite shrink-0"
          aria-hidden="true"
        />
        <span className="text-label tracking-label uppercase text-laterite font-medium">
          Corlim, North Goa
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={itemVariants}
        transition={heroItemTransition}
        className={cn(
          "font-display tracking-display text-ivory text-balance",
          "text-heading-1 md:text-display-2 lg:text-display-1",
          "max-w-lg mb-space-5",
        )}
      >
        Ready to Move Luxury Apartments in Goa
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={itemVariants}
        transition={heroItemTransition}
        className="text-body-lg text-stone text-pretty max-w-md mb-space-6"
      >
        G+4 premium residences with lift, covered parking, spacious 2&nbsp;BHK
        homes and exceptional connectivity.
      </motion.p>

      {/* Badges */}
      <motion.div
        variants={itemVariants}
        transition={heroItemTransition}
        className="mb-space-7"
      >
        <HeroBadges />
      </motion.div>

      {/* Price */}
      <motion.div
        variants={itemVariants}
        transition={heroItemTransition}
        className="mb-space-8"
      >
        <HeroStats />
      </motion.div>

      {/* CTAs */}
      <motion.div variants={itemVariants} transition={heroItemTransition}>
        <HeroCTA />
      </motion.div>
    </motion.div>
  );
}
