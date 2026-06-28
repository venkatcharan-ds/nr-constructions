"use server";

import { z } from "zod/v4";
import { insertSiteVisit, insertLead, getLeadByPhone, getProjectBySlug } from "@/lib/db/queries";

// ── Input schema ──────────────────────────────────────────────────────────────

const submitSiteVisitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.email().optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  preferred_date: z.string().optional().nullable(), // ISO date string YYYY-MM-DD
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

export async function submitSiteVisit(
  input: SubmitSiteVisitInput,
): Promise<SubmitSiteVisitResult> {
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

  // 2. Resolve project_id
  const PROJECT_SLUG = "roshan-apartments";
  let projectId: string | null = null;
  const projResult = await getProjectBySlug(PROJECT_SLUG);
  if (projResult.data) projectId = projResult.data.id;

  // 3. Upsert lead: find existing or create new
  let leadId: string | null = null;
  const existingLead = await getLeadByPhone(phone);
  if (existingLead.data) {
    leadId = existingLead.data.id;
  } else {
    const newLead = await insertLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      message: message?.trim() || null,
      source: "website",
      page_url: attribution.page_url ?? null,
      referrer: attribution.referrer ?? null,
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      utm_term: attribution.utm_term ?? null,
      utm_content: attribution.utm_content ?? null,
      user_agent: attribution.user_agent ?? null,
      device_type: attribution.device_type ?? null,
      project_id: projectId,
      status: "new",
    });
    if (newLead.data) leadId = newLead.data.id;
  }

  // 4. Insert site visit
  const result = await insertSiteVisit({
    lead_id: leadId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    message: message?.trim() || null,
    preferred_date: preferred_date ?? null,
    source: "website",
    page_url: attribution.page_url ?? null,
    referrer: attribution.referrer ?? null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_term: attribution.utm_term ?? null,
    utm_content: attribution.utm_content ?? null,
    user_agent: attribution.user_agent ?? null,
    device_type: attribution.device_type ?? null,
    project_id: projectId,
    is_confirmed: false,
  });

  if (!result.data) {
    console.error("[submitSiteVisit] DB error:", result.error);
    return {
      success: false,
      error: "Unable to book your visit. Please call us directly on +91 94053 32937.",
    };
  }

  return { success: true, visitId: result.data.id, leadId };
}
