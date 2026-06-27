"use client";

import Link from "next/link";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsApp } from "@/hooks/use-whatsapp";

const VISIT_MESSAGE =
  "Hello, I'd like to schedule a site visit for your 2 BHK apartments in Corlim, Goa.";

/**
 * Hero CTA button pair.
 * Primary: Book Site Visit → /contact
 * Secondary: WhatsApp chat with pre-filled message
 *
 * Client Component — needs useWhatsApp (generates URL on mount).
 * Animated as a single stagger child by parent HeroContent.
 */
export function HeroCTA() {
  const { url: whatsappUrl } = useWhatsApp(VISIT_MESSAGE);

  return (
    <div className="flex flex-wrap items-center gap-space-4">
      {/* Primary CTA */}
      <Link
        href="/contact"
        className={cn(
          "inline-flex items-center gap-space-3",
          "px-space-6 py-space-4 rounded-md",
          "bg-laterite text-ivory",
          "text-label tracking-label uppercase font-medium",
          "shadow-accent",
          "transition-all duration-fast",
          "hover:bg-laterite-dark hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
        )}
      >
        <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
        Book Site Visit
      </Link>

      {/* Secondary CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with NR Constructions on WhatsApp"
        className={cn(
          "inline-flex items-center gap-space-3",
          "px-space-6 py-space-4 rounded-md",
          "border border-ivory/30 text-ivory",
          "text-label tracking-label uppercase font-medium",
          "transition-all duration-fast",
          "hover:border-ivory/70 hover:bg-ivory/8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/60",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
        )}
      >
        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );
}
