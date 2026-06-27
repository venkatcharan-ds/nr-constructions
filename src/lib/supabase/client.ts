import { createClient } from "@supabase/supabase-js";

// ── Browser Supabase client (anon key, safe to expose) ───────────────────────
// Used only in Client Components that need real-time or storage.
// For mutations, prefer Server Actions (src/lib/actions/).

function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return createClient(url, key);
}

// Lazily initialised — safe to import without env vars present at build time.
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_client) _client = createBrowserClient();
  return _client;
}

// Convenience named export — call only at runtime (not at module top-level).
export const supabase = {
  get client() {
    return getSupabaseClient();
  },
};
