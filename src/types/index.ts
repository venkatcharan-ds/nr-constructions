/** Project publication status. Mirrors the Supabase CHECK constraint. */
export type ProjectStatus = "active" | "sold_out" | "upcoming" | "completed";

/** Lead pipeline status. Mirrors the Supabase CHECK constraint. */
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit_scheduled"
  | "negotiating"
  | "booked"
  | "lost";

/** Site visit status. Mirrors the Supabase CHECK constraint. */
export type VisitStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

/** Image category for a project. */
export type ImageCategory = "exterior" | "interior" | "amenity" | "location";

/** Lead acquisition source. */
export type LeadSource =
  | "contact_form"
  | "whatsapp"
  | "booking_form"
  | "phone";

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  status: ProjectStatus;
  location: string;
  city: string;
  state: string;
  reraNumber: string | null;
  totalUnits: number | null;
  availableUnits: number | null;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: "per_flat" | "per_sqft";
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnitType {
  id: string;
  projectId: string;
  name: string;
  bhk: number;
  areaSqm: number;
  areaSqft: number;
  price: number | null;
  priceNegotiable: boolean;
  floorCount: number | null;
  availableCount: number | null;
  floorPlanUrl: string | null;
}

export interface Amenity {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  cloudinaryId: string;
  url: string;
  altText: string | null;
  category: ImageCategory;
  sortOrder: number;
  isHero: boolean;
}

export interface Lead {
  id: string;
  projectId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  unitTypeId: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisit {
  id: string;
  leadId: string;
  projectId: string | null;
  preferredDate: string;
  preferredTime: string;
  confirmedDate: string | null;
  confirmedTime: string | null;
  status: VisitStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Utility: make selected keys required on a type. */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Utility: API success response envelope. */
export interface ApiSuccess<T = undefined> {
  success: true;
  data?: T;
}

/** Utility: API error response envelope. */
export interface ApiError {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse<T = undefined> = ApiSuccess<T> | ApiError;
