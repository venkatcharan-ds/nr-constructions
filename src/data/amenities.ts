// ── Amenity data types ────────────────────────────────────────────────────────

/** Lucide icon name — import the matching icon from lucide-react in UI. */
export type AmenityIconName =
  | "arrow-up-from-dot"
  | "car"
  | "wind"
  | "droplets"
  | "zap"
  | "shield-check"
  | "tree-pine"
  | "wifi"
  | "hard-hat"
  | "flame";

export interface AmenityItem {
  id: string;
  name: string;
  description: string;
  icon: AmenityIconName;
  sortOrder: number;
}

// ── Amenity list ──────────────────────────────────────────────────────────────

export const AMENITIES: AmenityItem[] = [
  {
    id: "lift",
    name: "Passenger Lift",
    description:
      "Automatic passenger lift serving all floors — essential for daily convenience.",
    icon: "arrow-up-from-dot",
    sortOrder: 1,
  },
  {
    id: "parking",
    name: "Covered Parking",
    description:
      "Dedicated covered parking space per unit, protected from rain and sun.",
    icon: "car",
    sortOrder: 2,
  },
  {
    id: "ventilation",
    name: "Cross-Ventilation",
    description:
      "Units designed for natural airflow — sea breeze from the west, cooler interiors.",
    icon: "wind",
    sortOrder: 3,
  },
  {
    id: "water",
    name: "24/7 Water Supply",
    description:
      "Municipal water connection with overhead tank and pump backup.",
    icon: "droplets",
    sortOrder: 4,
  },
  {
    id: "power",
    name: "Power Backup",
    description:
      "Generator backup for common areas and lift during load-shedding.",
    icon: "zap",
    sortOrder: 5,
  },
  {
    id: "security",
    name: "Compound Wall & Gate",
    description:
      "Fully enclosed compound with main gate — controlled entry for residents.",
    icon: "shield-check",
    sortOrder: 6,
  },
  {
    id: "garden",
    name: "Landscaped Entrance",
    description: "Green landscaping at the building entrance for a warm arrival.",
    icon: "tree-pine",
    sortOrder: 7,
  },
  {
    id: "rcc",
    name: "RCC Frame Construction",
    description:
      "Reinforced concrete structure built to withstand Goa's coastal climate.",
    icon: "hard-hat",
    sortOrder: 8,
  },
];
