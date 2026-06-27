"use client";

import { useMemo } from "react";
import { buildWhatsAppUrl, CONTACT } from "@/config/site";

interface UseWhatsAppReturn {
  /** The full WhatsApp click-to-chat URL with pre-filled message. */
  url: string;
  /** The raw WhatsApp number (for aria-label usage). */
  number: string;
}

/**
 * Returns the WhatsApp click-to-chat URL for the given message.
 * Memoised — only recomputes when the message changes.
 *
 * @param message - Optional override for the pre-filled message.
 *                  Defaults to the site-wide WhatsApp default message.
 */
export function useWhatsApp(message?: string): UseWhatsAppReturn {
  const url = useMemo(() => buildWhatsAppUrl(message), [message]);

  return {
    url,
    number: CONTACT.whatsapp.number,
  };
}
