"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface UseScrollProgressReturn {
  /** True once scrollY exceeds the given threshold (default 80px). */
  isScrolled: boolean;
}

/**
 * Tracks vertical scroll position and returns a boolean once the page
 * has scrolled past a given pixel threshold.
 *
 * Uses Framer Motion's useScroll which reads from the compositor thread,
 * avoiding main-thread JS on every scroll event.
 *
 * @param threshold - Pixel offset at which isScrolled becomes true. Default: 80.
 */
export function useScrollProgress(threshold = 80): UseScrollProgressReturn {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > threshold;
    // Only call setIsScrolled when the value actually changes — prevents
    // unnecessary re-renders on every scroll event above the threshold.
    setIsScrolled((prev) => (prev !== shouldBeScrolled ? shouldBeScrolled : prev));
  });

  return { isScrolled };
}
