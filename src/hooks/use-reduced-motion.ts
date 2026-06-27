"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Returns true if the user has requested reduced motion via their OS settings.
 *
 * Wraps Framer Motion's useReducedMotion with SSR safety — the Framer hook
 * returns null during server rendering; this wrapper normalises it to false
 * so components can use it unconditionally without null-checks.
 *
 * Components use this to swap full animation variants for opacity-only variants.
 */
export function useReducedMotion(): boolean {
  const prefersReducedMotion = useFramerReducedMotion();
  // null during SSR — default to false (animations enabled) until client hydrates.
  return prefersReducedMotion ?? false;
}
