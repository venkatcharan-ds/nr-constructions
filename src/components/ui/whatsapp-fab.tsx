"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { trackEvent } from "@/components/analytics/google-analytics";

const ENQUIRY_MESSAGE =
  "Hello! I'm interested in the Roshan Apartments in Goa. Could you share more details about availability and pricing?";

/**
 * Globally fixed WhatsApp floating action button.
 * Rendered once in the marketing layout so it appears above every section.
 * z-toast (500) places it above the sticky nav (z-sticky 200) and
 * any modal (z-modal 400), ensuring it is always reachable.
 */
export function WhatsAppFab() {
  const { url } = useWhatsApp(ENQUIRY_MESSAGE);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp — enquire about Roshan Apartments"
      onClick={() =>
        trackEvent({
          action: "whatsapp_click",
          category: "FAB",
          label: "floating_action_button",
        })
      }
      className={cn(
        /* Fixed to viewport — outside every scroll / overflow context */
        "fixed bottom-space-6 right-space-5 lg:right-space-8",
        "z-toast",
        /* Shape */
        "flex items-center justify-center",
        "w-14 h-14 rounded-full",
        /* WhatsApp brand colour — mapped as a design token */
        "bg-whatsapp text-white",
        /* Elevation */
        "shadow-xl",
        /* Interaction */
        "transition-transform duration-fast",
        "hover:scale-110 active:scale-95",
        /* Keyboard focus */
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
      )}
    >
      <MessageCircle className="w-6 h-6" aria-hidden="true" />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
