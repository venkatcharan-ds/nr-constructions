"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { navOverlayVariants, navOverlayTransition } from "@/lib/motion/variants";
import { NavLogo } from "./nav-logo";
import { NavLinks } from "./nav-links";
import { NavCtaButtons } from "./nav-cta-buttons";

/**
 * Desktop navigation header.
 *
 * Behaviour:
 *   - Initially transparent, overlaying the hero image with ivory text.
 *   - After 80px scroll: glass morphism background fades in (frosted ivory).
 *   - Logo and links adapt their colour via the isScrolled prop.
 *   - Sticky at top with z-sticky stacking context.
 *   - Hidden on mobile — mobile-nav.tsx handles smaller viewports.
 */
export function DesktopNav() {
  const { isScrolled } = useScrollProgress(80);
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      role="banner"
      className={cn(
        "fixed top-0 left-0 right-0",
        "h-nav",
        "z-sticky",
        // Hidden on mobile
        "hidden lg:flex",
        "items-center",
      )}
    >
      {/* Glass background overlay — fades in on scroll */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            aria-hidden="true"
            variants={prefersReducedMotion ? undefined : navOverlayVariants}
            initial={prefersReducedMotion ? { opacity: 1 } : "hidden"}
            animate="visible"
            exit={prefersReducedMotion ? undefined : "hidden"}
            transition={navOverlayTransition}
            className="absolute inset-0 glass-nav border-b border-border-default shadow-sm"
          />
        )}
      </AnimatePresence>

      {/* Nav content */}
      <div className="container-site relative flex items-center justify-between gap-space-6 w-full">
        <NavLogo isScrolled={isScrolled} />

        <div className="flex items-center gap-space-8">
          <NavLinks isScrolled={isScrolled} />
          <NavCtaButtons isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  );
}
