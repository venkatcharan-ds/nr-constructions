import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sectionVariants, sectionReducedVariants, sectionTransition } from "@/lib/motion/variants";

interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  /** Center-align text (default left on desktop). */
  align?: "left" | "center";
  /** Use ivory/stone text for dark section backgrounds. */
  light?: boolean;
  prefersReducedMotion?: boolean;
}

/**
 * Shared section eyebrow + heading + optional subheading block.
 * Accepts a `prefersReducedMotion` prop so the parent can pass the hook result
 * without each instance importing the hook separately.
 */
export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = "left",
  light = false,
  prefersReducedMotion = false,
}: SectionHeaderProps) {
  const variants = prefersReducedMotion ? sectionReducedVariants : sectionVariants;
  const centred = align === "center";

  return (
    <motion.div
      variants={variants}
      transition={sectionTransition}
      className={cn("mb-space-8 md:mb-space-9", centred && "text-center")}
    >
      {eyebrow && (
        <p
          className={cn(
            "text-label tracking-label uppercase font-medium mb-space-3",
            light ? "text-laterite" : "text-laterite",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-heading-1 tracking-heading text-balance",
          light ? "text-ivory" : "text-onyx",
          centred ? "max-w-2xl mx-auto" : "max-w-xl",
        )}
      >
        {heading}
      </h2>
      {subheading && (
        <p
          className={cn(
            "text-body-lg text-pretty mt-space-4",
            light ? "text-stone" : "text-stone",
            centred ? "max-w-xl mx-auto" : "max-w-lg",
          )}
        >
          {subheading}
        </p>
      )}
    </motion.div>
  );
}
