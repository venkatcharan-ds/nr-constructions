// ── Attribution helpers ───────────────────────────────────────────────────────
// Extracts UTM params, device type, and referrer from a Request object.
// Used in both Server Actions and Route Handlers.

export interface Attribution {
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  user_agent: string | null;
  device_type: "mobile" | "tablet" | "desktop" | null;
}

export function parseAttribution(request: Request): Attribution {
  const url = new URL(request.url);
  const params = url.searchParams;
  const ua = request.headers.get("user-agent") ?? null;

  return {
    page_url: request.headers.get("referer") ?? null,
    referrer: request.headers.get("origin") ?? null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    user_agent: ua,
    device_type: detectDevice(ua),
  };
}

export function detectDevice(ua: string | null): "mobile" | "tablet" | "desktop" | null {
  if (!ua) return null;
  const lower = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(lower)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(lower)) return "mobile";
  return "desktop";
}

// ── Attribution from plain headers (Server Actions don't receive a Request) ──

export interface ClientAttribution {
  page_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  user_agent?: string | null;
  device_type?: "mobile" | "tablet" | "desktop" | null;
}
