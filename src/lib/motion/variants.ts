import type { Variants } from "framer-motion";

/*
 * Central Framer Motion variant library.
 *
 * Rules:
 *   - Every animation value lives here. Components import and use these;
 *     they never define their own keyframes or timing values.
 *   - Duration and easing values match the design token system exactly.
 *   - Each group has a standard variant and a reducedMotion variant.
 *     Components choose between them via useReducedMotion().
 *   - The signature easing cubic-bezier(0.16, 1, 0.3, 1) matches
 *     --ease-signature in the design token system.
 */

const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;
const STANDARD_EASE = [0.4, 0, 0.2, 1] as const;

// ── Nav Glass Overlay ──────────────────────────────────────────────────────────

export const navOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const navOverlayTransition = {
  duration: 0.3,
  ease: STANDARD_EASE,
};

// ── Dropdown Panel ─────────────────────────────────────────────────────────────

export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export const dropdownReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const dropdownTransition = {
  duration: 0.2,
  ease: SIGNATURE_EASE,
};

// ── Mobile Menu Overlay ────────────────────────────────────────────────────────

export const mobileMenuVariants: Variants = {
  closed: {
    x: "100%",
    opacity: 0,
  },
  open: {
    x: 0,
    opacity: 1,
  },
};

export const mobileMenuReducedVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

export const mobileMenuTransition = {
  duration: 0.4,
  ease: SIGNATURE_EASE,
};

export const mobileMenuExitTransition = {
  duration: 0.3,
  ease: STANDARD_EASE,
};

// ── Mobile Menu Items (children of stagger container) ─────────────────────────

export const mobileMenuContainerVariants: Variants = {
  closed: {},
  open: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

export const mobileMenuItemVariants: Variants = {
  closed: {
    opacity: 0,
    x: 24,
  },
  open: {
    opacity: 1,
    x: 0,
  },
};

export const mobileMenuItemReducedVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

export const mobileMenuItemTransition = {
  duration: 0.35,
  ease: SIGNATURE_EASE,
};

// ── Page Section Entrance (used by page-level sections, shared here) ──────────

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const fadeUpReducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeUpTransition = {
  duration: 0.5,
  ease: SIGNATURE_EASE,
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInTransition = {
  duration: 0.3,
  ease: STANDARD_EASE,
};

// ── Stagger Container (generic) ────────────────────────────────────────────────

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFastVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
