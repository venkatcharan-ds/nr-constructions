"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/navigation";
import { NavDropdown } from "./nav-dropdown";

interface NavLinksProps {
  /** Controls text colour — adapts between hero and scrolled states. */
  isScrolled: boolean;
}

/**
 * Desktop horizontal navigation links.
 *
 * Manages which dropdown is open via a string key (the item label).
 * Dropdown open/close uses a 200ms close delay to prevent accidental
 * dismissal when the mouse moves between the trigger and the panel.
 *
 * Keyboard: Escape closes any open dropdown and returns focus to the trigger.
 */
export function NavLinks({ isScrolled }: NavLinksProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  }, [clearCloseTimer]);

  const handleTriggerMouseEnter = useCallback(
    (label: string) => {
      clearCloseTimer();
      setOpenDropdown(label);
    },
    [clearCloseTimer],
  );

  const handleTriggerMouseLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent, label: string) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        triggerRefs.current[label]?.focus();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpenDropdown((prev) => (prev === label ? null : label));
      }
    },
    [],
  );

  const linkBaseClasses = cn(
    "text-label tracking-label uppercase font-medium",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-laterite focus-visible:ring-offset-2 rounded-sm",
  );

  const linkColourClasses = isScrolled
    ? "text-onyx hover:text-laterite focus-visible:ring-offset-ivory"
    : "text-ivory hover:text-laterite-light focus-visible:ring-offset-transparent";

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-space-7" role="list">
        {NAV_ITEMS.map((item) => {
          if (item.kind === "link") {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    linkBaseClasses,
                    isActive ? "text-laterite" : linkColourClasses,
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          // Dropdown item
          const dropdownId = `nav-dropdown-${item.label.toLowerCase()}`;
          const isOpen = openDropdown === item.label;
          const isAnyChildActive = item.items.some(
            (child) =>
              pathname === child.href ||
              (child.href !== "/" && pathname.startsWith(child.href)),
          );

          return (
            <li key={item.label} className="relative">
              <button
                ref={(el) => {
                  triggerRefs.current[item.label] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={dropdownId}
                onMouseEnter={() => handleTriggerMouseEnter(item.label)}
                onMouseLeave={handleTriggerMouseLeave}
                onKeyDown={(e) => handleTriggerKeyDown(e, item.label)}
                onFocus={() => handleTriggerMouseEnter(item.label)}
                onBlur={scheduleClose}
                className={cn(
                  linkBaseClasses,
                  "flex items-center gap-space-1",
                  isAnyChildActive ? "text-laterite" : linkColourClasses,
                )}
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform duration-fast",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                  strokeWidth={2.5}
                />
              </button>

              <NavDropdown
                id={dropdownId}
                items={item.items}
                isOpen={isOpen}
                isScrolled={isScrolled}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
