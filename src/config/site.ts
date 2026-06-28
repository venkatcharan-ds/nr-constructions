/**
 * Site-wide constants.
 * Single source of truth — never hardcode these values in components.
 */

export const SITE_CONFIG = {
  name: "NR Constructions",
  tagline: "Ready to Move. 2 BHK Apartments in Corlim, Goa.",
  description:
    "Premium ready-to-move 2 BHK apartments in Corlim, North Goa. Starting from ₹61 Lakhs. G+4 building with lift, covered parking, and premium interiors.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nrconstructionsgoa.com",
  ogImage: "/og/default.jpg",
} as const;

export const CONTACT = {
  phone: {
    primary: "9405332937",
    secondary: "9326309465",
    primaryFormatted: "+91 94053 32937",
    secondaryFormatted: "+91 93263 09465",
    primaryTel: "tel:+919405332937",
    secondaryTel: "tel:+919326309465",
  },
  email: "nagineni.r.rao@gmail.com",
  whatsapp: {
    number: "919405332937",
    defaultMessage:
      "Hi, I'm interested in a 2 BHK at NR Constructions, Corlim, Goa. Please share details.",
  },
  address: {
    line1: "Plot No.14, Roshan Apartments",
    line2: "La Oceana Colony, Dona Paula",
    city: "Goa",
    pincode: "403004",
    full: "Plot No.14, Roshan Apartments, La Oceana Colony, Dona Paula, Goa – 403004",
  },
} as const;

export const CURRENT_PROJECT_SLUG = "corlim" as const;

/** Build the WhatsApp click-to-chat URL with a pre-filled message. */
export function buildWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(
    message ?? CONTACT.whatsapp.defaultMessage,
  );
  return `https://wa.me/${CONTACT.whatsapp.number}?text=${text}`;
}
