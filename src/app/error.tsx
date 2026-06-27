"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  /** The error that was thrown. `digest` is a server-side identifier for log correlation. */
  error: Error & { digest?: string };
  /** Call this to re-render the segment that threw. */
  reset: () => void;
}

/**
 * Root error boundary.
 *
 * Must be a Client Component — Next.js requires this for all error.tsx files.
 * Catches errors thrown during rendering of any route segment below the
 * root layout.
 *
 * Production note: do not render `error.message` to users — it may contain
 * sensitive server-side details. The digest is safe to display for support use.
 */
export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to your error reporting service here (e.g. Sentry)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <main
      className={[
        "min-h-screen",
        "flex flex-col items-center justify-center",
        "bg-surface-primary",
        "px-space-5",
        "text-center",
      ].join(" ")}
    >
      <h1
        className={[
          "font-display",
          "text-heading-1",
          "text-onyx",
          "text-balance",
        ].join(" ")}
      >
        Something went wrong
      </h1>

      <p
        className={[
          "text-body-md",
          "text-stone",
          "mt-space-3",
          "max-w-sm",
          "text-pretty",
        ].join(" ")}
      >
        An unexpected error occurred. Please try again. If the problem
        persists, contact us directly.
      </p>

      {error.digest && (
        <p
          className={[
            "text-micro",
            "text-stone",
            "mt-space-2",
            "font-mono",
            "tracking-label",
          ].join(" ")}
        >
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-space-3 mt-space-7">
        <button
          onClick={reset}
          className={[
            "inline-flex items-center justify-center",
            "h-12 px-space-7",
            "bg-laterite",
            "text-ivory",
            "text-label font-medium tracking-label uppercase",
            "rounded-md",
            "transition-colors duration-fast",
            "hover:bg-laterite-light",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
          ].join(" ")}
        >
          Try again
        </button>

        <Link
          href="/"
          className={[
            "inline-flex items-center justify-center",
            "h-12 px-space-7",
            "border border-onyx",
            "text-onyx",
            "text-label font-medium tracking-label uppercase",
            "rounded-md",
            "transition-colors duration-fast",
            "hover:bg-onyx hover:text-ivory",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-onyx focus-visible:ring-offset-2",
          ].join(" ")}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
