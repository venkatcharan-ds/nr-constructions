import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { insertLead, insertSiteVisit, getLeadByPhone, getProjectBySlug } from "@/lib/db/queries";
import { parseAttribution } from "@/lib/db/attribution";

// ── Rate limiting (in-memory, per-IP) ────────────────────────────────────────
// 5 submissions per IP per 15 minutes. Resets on server restart.

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

// ── Validation ────────────────────────────────────────────────────────────────

const bodySchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.email().optional().or(z.literal("")).optional(),
  message: z.string().max(1000).optional(),
  // Honeypot — must be empty; bots fill it automatically
  website: z.literal("").optional(),
});

// ── POST /api/contact ─────────────────────────────────────────────────────────
// Accepts enquiry submissions from both the contact form and any external
// integrations. Persists a lead and a site_visit row to Supabase.

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // 3. Validate (includes honeypot check)
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  // Honeypot triggered — silently accept but don't persist
  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  const { name, phone, email, message } = parsed.data;

  // 4. Attribution from request headers
  const attr = parseAttribution(request);

  // 5. Resolve project
  let projectId: string | null = null;
  const projResult = await getProjectBySlug("roshan-apartments");
  if (projResult.data) projectId = projResult.data.id;

  // 6. Upsert lead
  let leadId: string | null = null;
  const existing = await getLeadByPhone(phone);
  if (existing.data) {
    leadId = existing.data.id;
  } else {
    const lead = await insertLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      message: message?.trim() || null,
      source: "website",
      ...attr,
      project_id: projectId,
      status: "new",
    });
    if (lead.data) leadId = lead.data.id;
    if (lead.error) {
      console.error("[POST /api/contact] lead insert error:", lead.error);
    }
  }

  // 7. Insert site visit booking
  const visit = await insertSiteVisit({
    lead_id: leadId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    message: message?.trim() || null,
    preferred_date: null,
    source: "website",
    ...attr,
    project_id: projectId,
    is_confirmed: false,
  });

  if (visit.error) {
    console.error("[POST /api/contact] visit insert error:", visit.error);
    return NextResponse.json(
      { success: false, error: "Unable to save your booking. Please call us directly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, visitId: visit.data!.id });
}
