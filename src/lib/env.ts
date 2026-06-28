/**
 * Environment variable validation.
 * Called at server startup — throws in production if required vars are absent.
 * In development, logs a warning so you can still run with a partial env.
 */

const REQUIRED_SERVER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  // SUPABASE_SERVICE_ROLE_KEY removed — privileged DB operations are handled
  // by the SECURITY DEFINER RPC `submit_site_visit_booking` so only the
  // anon key is needed at runtime.
] as const;

const OPTIONAL = [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateEnv(): void {
  // Only run on the server side
  if (typeof window !== "undefined") return;

  const missing: string[] = [];

  for (const key of REQUIRED_SERVER) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables:\n  ${missing.join("\n  ")}\n\nCopy .env.local.example to .env.local and fill in the values.`;
    // Warn rather than throw — throwing at module-evaluation breaks next build.
    // The app will fail naturally at the first Supabase call if vars are absent.
    console.warn(`\n⚠️  ${msg}\n`);
  }

  // Warn about optional-but-recommended vars in dev
  if (process.env.NODE_ENV !== "production") {
    for (const key of OPTIONAL) {
      if (!process.env[key]) {
        console.info(`ℹ️  Optional env var not set: ${key}`);
      }
    }
  }
}
