"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the given CSS media query matches the current viewport.
 *
 * SSR-safe: returns false on the server and updates immediately after
 * hydration. This means there may be a single render where the default
 * (false) is used before the real value is known — this is intentional
 * and does not cause a hydration mismatch because the server always
 * returns false.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Sync immediately after mount
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
