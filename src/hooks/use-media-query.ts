"use client";

import { useSyncExternalStore } from "react";

const NOOP = () => () => {};

/**
 * Returns true when the given CSS media query matches the current viewport.
 *
 * SSR-safe: returns false on the server (getServerSnapshot) and subscribes
 * to change events on the client via useSyncExternalStore — the React 18
 * canonical approach for external store subscriptions.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    typeof window === "undefined"
      ? NOOP
      : (callback) => {
          const media = window.matchMedia(query);
          media.addEventListener("change", callback);
          return () => media.removeEventListener("change", callback);
        },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false,
  );
}
