/**
 * Root loading state.
 *
 * Shown during client-side navigation while the incoming page's
 * Server Component data is resolving.
 *
 * At root level this is intentionally blank — the branded background
 * colour is enough to prevent a white flash. Page-specific loading
 * skeletons are added in each route's own loading.tsx.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen bg-surface-primary"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
