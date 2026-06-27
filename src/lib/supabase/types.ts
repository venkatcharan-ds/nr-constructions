// ── Supabase database types ───────────────────────────────────────────────────
// Hand-authored to match supabase/migrations/001_initial.sql.
// Re-generate with `npx supabase gen types typescript` once the CLI is wired.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ── Enum types (mirrors PostgreSQL enums) ─────────────────────────────────────

export type LeadSource = "website" | "whatsapp" | "phone" | "referral" | "other";
export type LeadStatus = "new" | "contacted" | "visited" | "negotiating" | "closed" | "lost";
export type UnitConfig = "2BHK";
export type ProjectStatus = "active" | "sold_out" | "coming_soon";

// ── Row types ─────────────────────────────────────────────────────────────────

export interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  locality: string;
  district: string;
  state: string;
  pincode: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface UnitRow {
  id: string;
  project_id: string;
  unit_type: string;
  config: UnitConfig;
  carpet_area_sqm: number;
  carpet_area_sqft: number;
  price_inr: number;
  floor: number | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  // Contact
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  // Attribution
  source: LeadSource;
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  // Device
  user_agent: string | null;
  device_type: "mobile" | "tablet" | "desktop" | null;
  // Status
  status: LeadStatus;
  project_id: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SiteVisitRow {
  id: string;
  lead_id: string | null;
  // Contact (denormalised for speed)
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferred_date: string | null;
  // Attribution
  source: LeadSource;
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  // Device
  user_agent: string | null;
  device_type: "mobile" | "tablet" | "desktop" | null;
  // Status
  is_confirmed: boolean;
  project_id: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ── Insert types (omit server-generated fields) ───────────────────────────────

export type LeadInsert = Omit<LeadRow, "id" | "created_at" | "updated_at" | "status"> & {
  status?: LeadStatus;
};

export type SiteVisitInsert = Omit<SiteVisitRow, "id" | "created_at" | "updated_at" | "is_confirmed"> & {
  is_confirmed?: boolean;
};

// ── Database interface (used with createClient<Database>()) ───────────────────

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow;
        Insert: Omit<ProjectRow, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<ProjectRow, "id" | "created_at">>;
      };
      units: {
        Row: UnitRow;
        Insert: Omit<UnitRow, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<UnitRow, "id" | "created_at">>;
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert & { id?: string };
        Update: Partial<Omit<LeadRow, "id" | "created_at">>;
      };
      site_visits: {
        Row: SiteVisitRow;
        Insert: SiteVisitInsert & { id?: string };
        Update: Partial<Omit<SiteVisitRow, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      lead_source: LeadSource;
      lead_status: LeadStatus;
      unit_config: UnitConfig;
      project_status: ProjectStatus;
    };
  };
}
