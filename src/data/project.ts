import type { ProjectStatus } from "@/types";

// ── Per-component content types ───────────────────────────────────────────────

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subheading: string;
  ctaPrimary: string;
  ctaSecondary: string;
  /** Pre-filled WhatsApp message for the hero CTA. */
  visitMessage: string;
}

export interface HeroBadge {
  id: string;
  label: string;
  variant: "success" | "default";
}

export interface UnitSpec {
  bhk: number;
  areaSqm: number;
  areaSqft: number;
  /** Human-readable label: "2 BHK · 102 sqm (1,098 sqft)" */
  label: string;
}

export interface Pricing {
  min: number;
  max: number;
  unit: "per_flat" | "per_sqft";
  currency: "INR";
  /** Shown below the price in the hero stats block. */
  label: string;
  /** Shown on the hero floating price card. */
  floatingLabel: string;
}

// ── Top-level project data type ───────────────────────────────────────────────

export interface ProjectData {
  slug: string;
  name: string;
  subtitle: string;
  status: ProjectStatus;
  /** Number of storeys above ground. */
  totalFloors: number;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    full: string;
  };
  hero: HeroContent;
  badges: HeroBadge[];
  pricing: Pricing;
  units: UnitSpec[];
  /** Text shown on the "Ready to Move" floating card next to the status dot. */
  floatingCardStatus: string;
  /** Key specification items for the specs section. */
  keySpecs: { id: string; label: string; value: string }[];
  /** Short paragraph shown in the about section highlight strip. */
  aboutHighlight: string;
}

// ── Authoritative project record ──────────────────────────────────────────────

export const PROJECT: ProjectData = {
  slug: "corlim",
  name: "Roshan Apartments",
  subtitle: "Premium 2 BHK Residences in Corlim, North Goa",
  status: "active",
  totalFloors: 4,

  address: {
    line1: "Plot No.14, Roshan Apartments",
    line2: "La Oceana Colony, Dona Paula",
    city: "Goa",
    state: "Goa",
    pincode: "403004",
    full: "Plot No.14, Roshan Apartments, La Oceana Colony, Dona Paula, Goa–403004",
  },

  hero: {
    eyebrow: "Corlim, North Goa",
    headline: "Ready to Move Luxury Apartments in Goa",
    subheading:
      "G+4 premium residences with lift, covered parking, spacious 2 BHK homes and exceptional connectivity.",
    ctaPrimary: "Book Site Visit",
    ctaSecondary: "WhatsApp",
    visitMessage:
      "Hello, I’d like to schedule a site visit for your 2 BHK apartments in Corlim, Goa.",
  },

  badges: [
    { id: "status", label: "Ready to Move", variant: "success" },
    { id: "area", label: "102–103 sqm", variant: "default" },
    { id: "type", label: "2 BHK", variant: "default" },
    { id: "lift", label: "Lift", variant: "default" },
    { id: "parking", label: "Covered Parking", variant: "default" },
  ],

  pricing: {
    min: 6_100_000,
    max: 6_500_000,
    unit: "per_flat",
    currency: "INR",
    label: "per unit · all-inclusive",
    floatingLabel: "per unit · 2 BHK",
  },

  units: [
    {
      bhk: 2,
      areaSqm: 102,
      areaSqft: 1098,
      label: "2 BHK · 102 sqm (1,098 sqft)",
    },
    {
      bhk: 2,
      areaSqm: 103,
      areaSqft: 1109,
      label: "2 BHK · 103 sqm (1,109 sqft)",
    },
  ],

  floatingCardStatus: "G+4 Building · Corlim",

  aboutHighlight:
    "Roshan Apartments is a G+4 residential building in Corlim, North Goa — complete, ready to move in, and priced transparently at ₹61 Lakhs per unit.",

  keySpecs: [
    { id: "config", label: "Configuration", value: "2 BHK" },
    { id: "area", label: "Carpet Area", value: "102–103 sqm" },
    { id: "floors", label: "Building", value: "G+4 Floors" },
    { id: "construction", label: "Structure", value: "RCC Frame" },
    { id: "possession", label: "Possession", value: "Ready to Move" },
    { id: "parking", label: "Parking", value: "Covered · 1 per unit" },
    { id: "water", label: "Water Supply", value: "24/7 Municipal + Tank" },
    { id: "power", label: "Power Backup", value: "Generator for Common Areas" },
    { id: "flooring", label: "Flooring", value: "Premium Vitrified Tiles" },
    { id: "windows", label: "Windows", value: "Aluminium Sliding" },
    { id: "doors", label: "Doors", value: "Teak Wood Frame" },
    { id: "bathrooms", label: "Bathrooms", value: "2 · Attached + Common" },
  ],
};
