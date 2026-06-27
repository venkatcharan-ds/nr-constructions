import { createClient } from "@supabase/supabase-js";

// ── Server-only Supabase client (service role key) ────────────────────────────
// Never import this file from Client Components — it holds the service role key.
// The service role bypasses RLS; use it only in Server Actions and Route Handlers
// where you have already validated the request.

function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server environment variables. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    );
  }

  return createClient(url, key, {
    auth: {
      // Disable auto-refresh and session persistence on the server
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
