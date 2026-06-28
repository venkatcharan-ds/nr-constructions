import { createClient } from "@supabase/supabase-js";

// ── Server Supabase client ─────────────────────────────────────────────────────
// Uses the anon key — all privileged operations (lead insert, site_visit insert)
// are handled by the SECURITY DEFINER RPC `submit_site_visit_booking`, so the
// service role key is not required and should not be added to this project.

function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

// Factory — call once per request (Server Actions, Route Handlers)
export function getServerClient() {
  return createServerClient();
}
