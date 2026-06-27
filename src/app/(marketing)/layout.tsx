import { DesktopNav } from "@/components/layout/navigation/desktop-nav";
import { MobileNav } from "@/components/layout/navigation/mobile-nav";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

/**
 * Marketing layout — wraps all public-facing pages.
 *
 * Renders both navigation components:
 *   - DesktopNav: fixed header with glass morphism, hidden on mobile (lg:flex)
 *   - MobileNav: mobile bar + fullscreen overlay, hidden on desktop (lg:hidden)
 *
 * Children are rendered without top padding here; pages that need to
 * account for the fixed nav height should apply pt-nav or pt-mobile-nav
 * as appropriate. Hero sections that bleed behind the nav do not need it.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <DesktopNav />
      <MobileNav />
      <main id="main-content">{children}</main>
    </>
  );
}
