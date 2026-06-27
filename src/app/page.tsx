/**
 * Temporary root page.
 * Replaced by the marketing homepage in Milestone 3.
 * Exists only to satisfy Next.js's requirement for a root page.tsx
 * and to verify the token system renders correctly end-to-end.
 */
export default function RootPage() {
  return (
    <main className="min-h-screen bg-surface-primary flex items-center justify-center px-space-5">
      <div className="text-center">
        <p className="text-label tracking-label uppercase text-stone">
          NR Constructions
        </p>
        <h1 className="font-display text-heading-1 text-onyx mt-space-3 text-balance">
          Coming Soon
        </h1>
        <p className="text-body-md text-stone mt-space-4">
          Premium 2 BHK Apartments · Corlim, Goa
        </p>
      </div>
    </main>
  );
}
