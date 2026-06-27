/**
 * Navigation configuration.
 *
 * Types and data have moved to src/data/navigation.ts.
 * This file re-exports everything so all existing component imports
 * (`@/config/navigation`) continue to work without modification.
 */
export type {
  NavItem,
  NavDropdownItem,
  MobileNavItem,
} from "@/data/navigation";

export { NAV_ITEMS, MOBILE_NAV_ITEMS } from "@/data/navigation";
