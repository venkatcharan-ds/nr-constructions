"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle, Home, Building2, Images, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTACT } from "@/config/site";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import {
  mobileMenuVariants,
  mobileMenuReducedVariants,
  mobileMenuTransition,
  mobileMenuExitTransition,
  mobileMenuContainerVariants,
  mobileMenuItemVariants,
  mobileMenuItemReducedVariants,
  mobileMenuItemTransition,
} from "@/lib/motion/variants";
import { NavLogo } from "./nav-logo";
import { MOBILE_NAV_ITEMS } from "@/config/navigation";

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 shrink-0" aria-hidden="true" />,
  Apartment: <Building2 className="w-5 h-5 shrink-0" aria-hidden="true" />,
  Gallery: <Images className="w-5 h-5 shrink-0" aria-hidden="true" />,
  Location: <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />,
};

const BOOK_VISIT_MESSAGE =
  "Hello, I'd like to schedule a site visit for the Corlim apartments.";

/**
 * Mobile navigation — bar + fullscreen overlay.
 *
 * The bar is always visible on mobile (hidden on lg+).
 * The hamburger opens a fullscreen slide-in menu with staggered item entrances.
 * Focus is trapped within the overlay when open.
 * Scroll is locked on <body> while the menu is open.
 * Closes automatically on route change.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { isScrolled } = useScrollProgress(80);
  const { url: whatsappUrl } = useWhatsApp(BOOK_VISIT_MESSAGE);
  const menuRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableSelectors =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
    );
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        openButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    openButtonRef.current?.focus();
  }, []);

  const menuVariants = prefersReducedMotion
    ? mobileMenuReducedVariants
    : mobileMenuVariants;
  const itemVariants = prefersReducedMotion
    ? mobileMenuItemReducedVariants
    : mobileMenuItemVariants;

  return (
    <>
      {/* Mobile bar */}
      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0",
          "h-mobile-nav",
          "z-sticky",
          "flex lg:hidden items-center",
          "transition-all duration-normal",
          isScrolled
            ? "glass-nav border-b border-border-default shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container-site flex items-center justify-between w-full">
          <NavLogo isScrolled={isScrolled || isOpen} />

          <button
            ref={openButtonRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsOpen(true)}
            className={cn(
              "p-space-2 rounded",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
              isScrolled || isOpen ? "text-onyx" : "text-ivory",
            )}
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={isOpen ? mobileMenuTransition : mobileMenuExitTransition}
            className={cn(
              "fixed inset-0 z-modal",
              "bg-surface-primary",
              "flex flex-col",
              "overflow-y-auto",
            )}
          >
            {/* Menu header */}
            <div className="flex items-center justify-between px-space-6 h-mobile-nav shrink-0 border-b border-border-default">
              <NavLogo isScrolled />
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={handleClose}
                className={cn(
                  "p-space-2 rounded text-onyx",
                  "transition-colors duration-fast hover:text-laterite",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                )}
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Nav links */}
            <motion.nav
              aria-label="Mobile navigation"
              variants={mobileMenuContainerVariants}
              initial="closed"
              animate="open"
              className="flex-1 px-space-6 py-space-8"
            >
              <ul className="space-y-space-2" role="list">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <motion.li
                      key={item.href}
                      variants={itemVariants}
                      transition={mobileMenuItemTransition}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-space-4 py-space-4",
                          "text-heading-3 font-display font-medium",
                          "border-b border-border-default",
                          "transition-colors duration-fast",
                          "focus-visible:outline-none focus-visible:text-laterite",
                          isActive
                            ? "text-laterite"
                            : "text-onyx hover:text-laterite",
                        )}
                      >
                        {ICON_MAP[item.label] ?? null}
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>

            {/* Bottom CTA area */}
            <div className="px-space-6 pb-space-10 pt-space-6 space-y-space-3 shrink-0 border-t border-border-default">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-space-3 w-full",
                  "py-space-4 rounded",
                  "border border-onyx/20 text-onyx",
                  "text-label tracking-label uppercase font-medium",
                  "transition-colors duration-fast hover:border-laterite hover:text-laterite",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                )}
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                WhatsApp
              </a>

              <a
                href={CONTACT.phone.primaryTel}
                className={cn(
                  "flex items-center justify-center gap-space-3 w-full",
                  "py-space-4 rounded",
                  "bg-laterite text-ivory",
                  "text-label tracking-label uppercase font-medium",
                  "transition-colors duration-fast hover:bg-laterite-dark",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
                )}
              >
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                {CONTACT.phone.primary}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
