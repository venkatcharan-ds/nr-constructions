"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  dropdownVariants,
  dropdownReducedVariants,
  dropdownTransition,
} from "@/lib/motion/variants";
import type { NavDropdownItem } from "@/config/navigation";

interface NavDropdownProps {
  /** Unique identifier — matches the parent link label for open/close control. */
  id: string;
  /** Items to render inside the dropdown panel. */
  items: NavDropdownItem[];
  /** Whether this dropdown is currently open. Controlled externally by NavLinks. */
  isOpen: boolean;
  /** Called when the mouse enters the dropdown panel itself (prevents early close). */
  onMouseEnter: () => void;
  /** Called when the mouse leaves the dropdown panel. */
  onMouseLeave: () => void;
}

/**
 * Dropdown panel for a nav item with sub-navigation.
 *
 * Open/close state is controlled by the parent NavLinks component.
 * The panel handles its own AnimatePresence exit animation.
 * Mouse enter/leave events on the panel itself are forwarded to the
 * parent to prevent premature close when moving between trigger and panel.
 */
export function NavDropdown({
  id,
  items,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: NavDropdownProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? dropdownReducedVariants
    : dropdownVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id={id}
          role="menu"
          aria-label="Apartment pages"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={dropdownTransition}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(
            // Position: below the nav, aligned to the trigger
            "absolute top-full left-1/2 -translate-x-1/2 mt-space-2",
            // Size
            "w-64",
            // Appearance
            "bg-ivory rounded-lg border border-border-default shadow-md",
            // Stacking
            "z-dropdown",
            // Prevent interaction when animating out
            "overflow-hidden",
          )}
        >
          <ul className="py-space-2">
            {items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block px-space-5 py-space-3",
                      "transition-colors duration-fast",
                      "focus-visible:outline-none focus-visible:bg-fog",
                      isActive
                        ? "text-laterite"
                        : "text-onyx hover:text-laterite hover:bg-fog",
                    )}
                  >
                    <span className="block text-body-sm font-medium">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="block text-micro text-stone mt-space-1">
                        {item.description}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
