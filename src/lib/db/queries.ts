// ── Typed database queries ────────────────────────────────────────────────────
// All queries use the server client (service role).
// Never import this file from Client Components.

import { getServerClient } from "@/lib/supabase/server";
import type {
  LeadRow,
  SiteVisitRow,
  ProjectRow,
  UnitRow,
  LeadInsert,
  SiteVisitInsert,
} from "@/lib/supabase/types";

// ── Result wrapper ────────────────────────────────────────────────────────────

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjectBySlug(slug: string): Promise<DbResult<ProjectRow>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Project not found" };
  }
  return { data: data as ProjectRow, error: null };
}

export async function getActiveProjects(): Promise<DbResult<ProjectRow[]>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ProjectRow[], error: null };
}

// ── Units ─────────────────────────────────────────────────────────────────────

export async function getUnitsByProject(projectId: string): Promise<DbResult<UnitRow[]>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("units")
    .select("*")
    .eq("project_id", projectId)
    .order("carpet_area_sqm", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as UnitRow[], error: null };
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function insertLead(lead: LeadInsert): Promise<DbResult<LeadRow>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(lead as any)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to insert lead" };
  }
  return { data: data as LeadRow, error: null };
}

export async function getLeadByPhone(phone: string): Promise<DbResult<LeadRow | null>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("leads")
    .select("*")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as LeadRow | null) ?? null, error: null };
}

// ── Site Visits ───────────────────────────────────────────────────────────────

export async function insertSiteVisit(visit: SiteVisitInsert): Promise<DbResult<SiteVisitRow>> {
  const db = getServerClient();
  const { data, error } = await db
    .from("site_visits")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(visit as any)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to insert site visit" };
  }
  return { data: data as SiteVisitRow, error: null };
}
