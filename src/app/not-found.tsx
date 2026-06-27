import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

/**
 * Global 404 page.
 * Server Component — no interactivity needed.
 * Self-contained layout: no marketing nav/footer (not yet built).
 */
export default function NotFound() {
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
      {/* 404 numeral — uses display typeface as a decorative element */}
      <span
        aria-hidden="true"
        className={[
          "font-display",
          "text-display-1",
          "font-light",
          "text-laterite",
          "leading-none",
          "select-none",
        ].join(" ")}
      >
        404
      </span>

      <h1
        className={[
          "font-display",
          "text-heading-2",
          "text-onyx",
          "mt-space-4",
          "text-balance",
        ].join(" ")}
      >
        Page not found
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
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className={[
          "mt-space-7",
          "inline-flex items-center gap-space-2",
          "text-body-md",
          "text-laterite",
          "underline-offset-4",
          "hover:underline",
          "transition-colors",
          "duration-fast",
          "focus-visible:outline-none",
          "focus-visible:underline",
        ].join(" ")}
      >
        ← Back to home
      </Link>
    </main>
  );
}
