"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side provider tree.
 *
 * Kept separate from the root layout (which is a Server Component) so the
 * layout itself does not have to become a client component.
 *
 * ThemeProvider:
 *   - attribute="data-theme" matches the [data-theme="dark"] selector
 *     in src/styles/tokens.css — enabling dark mode with zero JS.
 *   - enableSystem={false} prevents the OS dark-mode preference from
 *     activating the (currently incomplete) dark palette.
 *   - disableTransitionOnChange prevents a flash of unstyled content when
 *     toggling themes.
 *
 * Toaster:
 *   - Styled via CSS variable references so it inherits the token system.
 *   - Never uses hardcoded color values.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <GoogleAnalytics />
      {children}

      <Toaster
        position="bottom-right"
        toastOptions={{
          unstyled: false,
          classNames: {
            toast: "font-body",
          },
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-sm)",
            lineHeight: "1.6",
            background: "var(--ivory)",
            color: "var(--onyx)",
            border: "1px solid var(--fog)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md-raw)",
          },
        }}
      />
    </ThemeProvider>
  );
}
