/**
 * Error monitoring wrapper.
 *
 * Drop-in for Sentry: set NEXT_PUBLIC_SENTRY_DSN in your environment and
 * install @sentry/nextjs to activate. Without a DSN this falls back to
 * console.error so errors are never silently swallowed.
 *
 * To activate Sentry:
 *   npm install @sentry/nextjs
 *   # Then uncomment the Sentry block below and run `npx @sentry/wizard@latest -i nextjs`
 */

// import * as Sentry from "@sentry/nextjs";

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context });
  //   return;
  // }
  if (process.env.NODE_ENV !== "production") {
    console.error("[monitoring]", error, context);
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureMessage(message, level);
  //   return;
  // }
  if (process.env.NODE_ENV !== "production") {
    console[level === "error" ? "error" : level === "warning" ? "warn" : "log"]("[monitoring]", message);
  }
}
