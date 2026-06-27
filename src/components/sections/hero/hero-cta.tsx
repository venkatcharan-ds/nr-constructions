"use client";

import Link from "next/link";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { PROJECT } from "@/data/project";
import { trackEvent } from "@/components/analytics/google-analytics";

/**
 * Hero CTA button pair driven by PROJECT.hero from the data layer.
 * Primary: Book Site Visit → /contact
 * Secondary: WhatsApp chat with PROJECT.hero.visitMessage
 */
export function HeroCTA() {
  const { url: whatsappUrl } = useWhatsApp(PROJECT.hero.visitMessage);

  return (
    <div className="flex flex-wrap items-center gap-space-4">
      {/* Primary CTA */}
      <Link
        href="/contact"
        onClick={() => trackEvent({ action: "cta_click", category: "Hero", label: "book_site_visit" })}
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
        {PROJECT.hero.ctaPrimary}
      </Link>

      {/* Secondary CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${PROJECT.name} on WhatsApp`}
        onClick={() => trackEvent({ action: "whatsapp_click", category: "Hero", label: "hero_cta" })}
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
        {PROJECT.hero.ctaSecondary}
      </a>
    </div>
  );
}
