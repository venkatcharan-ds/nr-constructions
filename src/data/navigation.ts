import { PROJECT } from "./project";

// ── Navigation types ──────────────────────────────────────────────────────────
/*
  Types live here (not in config/navigation.ts) to avoid a circular import.
  config/navigation.ts re-exports everything from this file for backward
  compatibility — all existing component imports continue to work unchanged.
*/

export interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

export type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "dropdown"; label: string; items: NavDropdownItem[] };

export interface MobileNavItem {
  label: string;
  href: string;
  /** Lucide icon name used in mobile-nav.tsx's ICON_MAP. */
  icon: string;
}

// ── Nav item data ─────────────────────────────────────────────────────────────

const projectBase = `/project/${PROJECT.slug}`;

export const NAV_ITEMS: NavItem[] = [
  {
    kind: "dropdown",
    label: "Apartment",
    items: [
      {
        label: "Overview",
        href: projectBase,
        description: "Project summary, pricing, and specifications",
      },
      {
        label: "Floor Plans",
        href: `${projectBase}/floor-plans`,
        description: "102 sqm and 103 sqm unit layouts",
      },
      {
        label: "Gallery",
        href: `${projectBase}/gallery`,
        description: "Exterior, interior, and amenity photos",
      },
      {
        label: "Amenities",
        href: `${projectBase}/amenities`,
        description: "Lift, parking, balcony, and more",
      },
      {
        label: "Location",
        href: `${projectBase}/location`,
        description: "Corlim, North Goa — proximity and connectivity",
      },
    ],
  },
  { kind: "link", label: "About", href: "/about" },
  { kind: "link", label: "Contact", href: "/contact" },
];

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Apartment", href: projectBase, icon: "Building2" },
  { label: "Gallery", href: `${projectBase}/gallery`, icon: "Images" },
  { label: "Location", href: `${projectBase}/location`, icon: "MapPin" },
];
