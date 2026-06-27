"use server";

import { z } from "zod/v4";
import { insertLead, getLeadByPhone } from "@/lib/db/queries";
import type { ClientAttribution } from "@/lib/db/attribution";
import { detectDevice } from "@/lib/db/attribution";

// ── Input schema ──────────────────────────────────────────────────────────────

const submitLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.email().optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  // Attribution — all optional; sent by the client
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

export type SubmitLeadInput = z.infer<typeof submitLeadSchema>;

// ── Result type ───────────────────────────────────────────────────────────────

export type SubmitLeadResult =
  | { success: true; leadId: string; isReturn: boolean }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Server Action ─────────────────────────────────────────────────────────────

export async function submitLead(
  input: SubmitLeadInput,
): Promise<SubmitLeadResult> {
  // 1. Validate
  const parsed = submitLeadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() ?? "form";
      fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  const { name, phone, email, message, ...attribution } = parsed.data;

  // 2. Deduplicate — if we already have a lead with this phone, skip insert
  const existing = await getLeadByPhone(phone);
  if (existing.data) {
    return { success: true, leadId: existing.data.id, isReturn: true };
  }

  // 3. Resolve project_id (Roshan Apartments slug is the only active project)
  const PROJECT_SLUG = "roshan-apartments";
  let projectId: string | null = null;
  try {
    const { getProjectBySlug } = await import("@/lib/db/queries");
    const proj = await getProjectBySlug(PROJECT_SLUG);
    if (proj.data) projectId = proj.data.id;
  } catch {
    // project lookup failure is non-fatal
  }

  // 4. Insert
  const result = await insertLead({
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

  if (!result.data) {
    console.error("[submitLead] DB error:", result.error);
    return { success: false, error: "Unable to save your enquiry. Please call us directly." };
  }

  return { success: true, leadId: result.data.id, isReturn: false };
}
