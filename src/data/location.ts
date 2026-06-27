// ── Location data types ───────────────────────────────────────────────────────

export type LandmarkType =
  | "essential"
  | "education"
  | "healthcare"
  | "leisure"
  | "transport";

export interface Landmark {
  id: string;
  name: string;
  /** Human-readable distance, e.g. "2.5 km" or "8 min drive". */
  distance: string;
  type: LandmarkType;
}

export interface LocationData {
  coordinates: { lat: number; lng: number };
  locality: string;
  district: string;
  state: string;
  /** Short connectivity summary for display in the hero or about sections. */
  connectivitySummary: string[];
  landmarks: Landmark[];
}

// ── Location record ───────────────────────────────────────────────────────────

export const LOCATION: LocationData = {
  coordinates: {
    // Corlim, North Goa — approximate
    lat: 15.5131,
    lng: 73.8448,
  },
  locality: "Corlim",
  district: "North Goa",
  state: "Goa",

  connectivitySummary: [
    "10 min to Panjim city centre",
    "15 min to Goa International Airport",
    "5 min to NH66 (national highway)",
    "20 min to Calangute and Baga beaches",
  ],

  landmarks: [
    // Essential
    {
      id: "market",
      name: "Corlim Market",
      distance: "0.5 km",
      type: "essential",
    },
    {
      id: "panjim",
      name: "Panjim City Centre",
      distance: "6 km",
      type: "essential",
    },
    {
      id: "nh66",
      name: "NH66 National Highway",
      distance: "2 km",
      type: "transport",
    },

    // Education
    {
      id: "school-1",
      name: "Mushtifund Aryaan Higher Secondary School",
      distance: "1.2 km",
      type: "education",
    },
    {
      id: "goa-uni",
      name: "Goa University",
      distance: "4 km",
      type: "education",
    },

    // Healthcare
    {
      id: "gmch",
      name: "Goa Medical College & Hospital",
      distance: "5 km",
      type: "healthcare",
    },
    {
      id: "mapusa-hosp",
      name: "Asilo Hospital, Mapusa",
      distance: "9 km",
      type: "healthcare",
    },

    // Leisure
    {
      id: "dona-paula",
      name: "Dona Paula Beach",
      distance: "4 km",
      type: "leisure",
    },
    {
      id: "calangute",
      name: "Calangute Beach",
      distance: "18 km",
      type: "leisure",
    },
    {
      id: "mall",
      name: "Caculo Mall, St. Inez",
      distance: "7 km",
      type: "leisure",
    },

    // Transport
    {
      id: "airport",
      name: "Goa International Airport (GOI)",
      distance: "12 km",
      type: "transport",
    },
    {
      id: "kmc-bus",
      name: "KTC Bus Stand, Panjim",
      distance: "7 km",
      type: "transport",
    },
  ],
};
