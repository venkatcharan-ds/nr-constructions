import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 * Resolves conflicts (e.g. `p-2` + `p-4` → `p-4`) via tailwind-merge,
 * and handles conditional classes via clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in Indian numbering system.
 * 6100000 → "₹61 Lakhs"
 * 10000000 → "₹1 Crore"
 */
export function formatPrice(
  amount: number,
  options: { compact?: boolean; showSymbol?: boolean } = {},
): string {
  const { compact = true, showSymbol = true } = options;
  const symbol = showSymbol ? "₹" : "";

  if (!compact) {
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  }

  if (amount >= 10_000_000) {
    const crores = amount / 10_000_000;
    const formatted =
      crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2);
    return `${symbol}${formatted} Crore${crores !== 1 ? "s" : ""}`;
  }

  if (amount >= 100_000) {
    const lakhs = amount / 100_000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `${symbol}${formatted} Lakhs`;
  }

  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

/**
 * Format a price range.
 * formatPriceRange(6100000, 6500000) → "₹61 – 65 Lakhs"
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatPrice(min);

  const minLakhs = min / 100_000;
  const maxLakhs = max / 100_000;

  if (minLakhs >= 1 && maxLakhs < 100) {
    return `₹${minLakhs % 1 === 0 ? minLakhs.toFixed(0) : minLakhs.toFixed(1)} – ${maxLakhs % 1 === 0 ? maxLakhs.toFixed(0) : maxLakhs.toFixed(1)} Lakhs`;
  }

  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/**
 * Format square meters to a readable string.
 * 102 → "102 sqm (1,098 sqft)"
 */
export function formatArea(sqm: number, sqft?: number): string {
  const sqftValue = sqft ?? Math.round(sqm * 10.764);
  return `${sqm} sqm (${sqftValue.toLocaleString("en-IN")} sqft)`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns true if the code is running on the client (browser).
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Delay for a given number of milliseconds.
 * Only use in non-critical paths.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
