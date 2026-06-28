"use server";

import { z } from "zod/v4";
import { getServerClient } from "@/lib/supabase/server";

// ── Input schema ──────────────────────────────────────────────────────────────

const submitSiteVisitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.email().optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  preferred_date: z.string().optional().nullable(),
  // Attribution
  page_url: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  utm_term: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  device_type: z.enum(["mobile", "tablet", "desktop"]).optional().nullable(),
});

export type SubmitSiteVisitInput = z.infer<typeof submitSiteVisitSchema>;

// ── Result type ───────────────────────────────────────────────────────────────

export type SubmitSiteVisitResult =
  | { success: true; visitId: string; leadId: string | null }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Server Action ─────────────────────────────────────────────────────────────
// Calls the SECURITY DEFINER RPC `submit_site_visit_booking` which atomically:
//   1. Resolves the project by slug
//   2. Finds or creates a lead (deduplicates by phone)
//   3. Inserts the site_visit row
// The anon key is sufficient — the RPC runs with elevated DB privileges internally.

export async function submitSiteVisit(
  input: SubmitSiteVisitInput,
): Promise<SubmitSiteVisitResult> {
  try {
    // 1. Validate
    const parsed = submitSiteVisitSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString() ?? "form";
        fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
      }
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const { name, phone, email, message, preferred_date, ...attribution } = parsed.data;

    // 2. Call RPC — single round-trip, handles lead upsert + visit insert
    const db = getServerClient();
    const { data, error } = await db.rpc("submit_site_visit_booking", {
      p_name:           name.trim(),
      p_phone:          phone.trim(),
      p_email:          email?.trim() || null,
      p_message:        message?.trim() || null,
      p_preferred_date: preferred_date || null,
      p_source:         "website",
      p_page_url:       attribution.page_url ?? null,
      p_referrer:       attribution.referrer ?? null,
      p_utm_source:     attribution.utm_source ?? null,
      p_utm_medium:     attribution.utm_medium ?? null,
      p_utm_campaign:   attribution.utm_campaign ?? null,
      p_utm_term:       attribution.utm_term ?? null,
      p_utm_content:    attribution.utm_content ?? null,
      p_user_agent:     attribution.user_agent ?? null,
      p_device_type:    attribution.device_type ?? null,
      p_project_slug:   "roshan-apartments",
    });

    if (error || !data) {
      console.error("[submitSiteVisit] RPC error:", error?.message);
      return {
        success: false,
        error: "Unable to book your visit. Please call us directly on +91 94053 32937.",
      };
    }

    const result = data as { visit_id: string; lead_id: string };
    return { success: true, visitId: result.visit_id, leadId: result.lead_id ?? null };

  } catch (err) {
    console.error("[submitSiteVisit] Unexpected error:", err);
    return {
      success: false,
      error: "Unable to book your visit. Please call us directly on +91 94053 32937.",
    };
  }
}
