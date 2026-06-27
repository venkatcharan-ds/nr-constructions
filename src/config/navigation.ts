import { CURRENT_PROJECT_SLUG } from "./site";

export type NavItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "dropdown"; label: string; items: NavDropdownItem[] };

export interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

const projectBase = `/project/${CURRENT_PROJECT_SLUG}`;

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
] as const;

export const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Apartment", href: projectBase, icon: "building-2" },
  { label: "Gallery", href: `${projectBase}/gallery`, icon: "images" },
  { label: "WhatsApp", href: "whatsapp", icon: "message-circle" },
  { label: "Call", href: "call", icon: "phone" },
] as const;

export type MobileNavItem = (typeof MOBILE_NAV_ITEMS)[number];
