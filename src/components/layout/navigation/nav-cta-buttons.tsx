"use client";

import Link from "next/link";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT } from "@/config/site";
import { useWhatsApp } from "@/hooks/use-whatsapp";

interface NavCtaButtonsProps {
  /** Controls appearance — adapts between transparent hero and scrolled glass states. */
  isScrolled: boolean;
}

const BOOK_VISIT_MESSAGE =
  "Hello, I'd like to schedule a site visit for the Corlim apartments.";

/**
 * Desktop navigation call-to-action buttons.
 *
 * Three actions in order of priority:
 *   1. WhatsApp — lowest friction, opens chat with pre-filled message
 *   2. Phone — direct call
 *   3. Book a Visit — primary conversion action (laterite filled button)
 *
 * The ghost/outline style of (1) and (2) adapts to both transparent and
 * glass nav states. The filled CTA (3) is always laterite.
 */
export function NavCtaButtons({ isScrolled }: NavCtaButtonsProps) {
  const { url: whatsappUrl } = useWhatsApp(BOOK_VISIT_MESSAGE);

  const ghostClasses = cn(
    "flex items-center gap-space-2 px-space-4 py-space-2",
    "text-label tracking-label uppercase font-medium rounded",
    "border transition-all duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
  );

  const ghostScrolledClasses =
    "border-onyx/30 text-onyx hover:border-laterite hover:text-laterite focus-visible:ring-offset-ivory";
  const ghostHeroClasses =
    "border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory/10 focus-visible:ring-offset-transparent";

  return (
    <div className="flex items-center gap-space-3">
      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp with NR Constructions at ${CONTACT.whatsapp.number}`}
        className={cn(
          ghostClasses,
          isScrolled ? ghostScrolledClasses : ghostHeroClasses,
        )}
      >
        <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      {/* Phone */}
      <a
        href={CONTACT.phone.primaryTel}
        aria-label={`Call NR Constructions at ${CONTACT.phone.primary}`}
        className={cn(
          ghostClasses,
          isScrolled ? ghostScrolledClasses : ghostHeroClasses,
        )}
      >
        <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{CONTACT.phone.primary}</span>
      </a>

      {/* Book a Visit — primary CTA */}
      <Link
        href="/contact"
        className={cn(
          "flex items-center gap-space-2 px-space-5 py-space-2",
          "text-label tracking-label uppercase font-medium rounded",
          "bg-laterite text-ivory",
          "transition-all duration-fast",
          "hover:bg-laterite-dark",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
          isScrolled
            ? "focus-visible:ring-offset-ivory"
            : "focus-visible:ring-offset-transparent",
        )}
      >
        <CalendarCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Book a Visit</span>
      </Link>
    </div>
  );
}
