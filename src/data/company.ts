// ── Company data types ────────────────────────────────────────────────────────

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
}

export interface CompanyData {
  name: string;
  legalName: string;
  tagline: string;
  /** One-line description for meta tags and footer. */
  shortDescription: string;
  /** Multi-paragraph content for the About page. */
  about: string[];
  values: CompanyValue[];
  contact: {
    phone: {
      primary: string;
      primaryFormatted: string;
      primaryTel: string;
      secondary: string;
      secondaryFormatted: string;
      secondaryTel: string;
    };
    email: string;
    whatsapp: {
      number: string;
      defaultMessage: string;
    };
    address: {
      line1: string;
      line2: string;
      city: string;
      pincode: string;
      full: string;
    };
  };
}

// ── Authoritative company record ──────────────────────────────────────────────

export const COMPANY: CompanyData = {
  name: "NR Constructions",
  legalName: "NR Constructions",
  tagline: "Built with integrity. Finished with care.",
  shortDescription:
    "Premium ready-to-move 2 BHK apartments in Corlim, North Goa. Starting from ₹61 Lakhs.",

  about: [
    "NR Constructions is a Goa-based residential builder with a singular focus on quality and transparency. Every home we deliver is one we would be proud to live in ourselves.",
    "Our Corlim project — Roshan Apartments — is a G+4 building with spacious 2 BHK units of 102–103 sqm, lift access, covered parking, and finishes that speak for themselves. It is ready to move in today.",
    "We believe buying a home should feel straightforward. No hidden costs, no delays, no fine print. Just a good home at a fair price, delivered on our word.",
  ],

  values: [
    {
      id: "transparency",
      title: "Transparent Pricing",
      description:
        "The price you see is the price you pay. All-inclusive, no hidden charges.",
    },
    {
      id: "quality",
      title: "Build Quality",
      description:
        "RCC frame construction, premium sanitary fittings, and tiled flooring throughout.",
    },
    {
      id: "timeliness",
      title: "Ready to Move",
      description:
        "No waiting. The building is complete and units are ready for immediate possession.",
    },
    {
      id: "service",
      title: "Post-Sale Support",
      description:
        "We remain reachable after the sale for any concerns about your new home.",
    },
  ],

  contact: {
    phone: {
      primary: "9405332937",
      primaryFormatted: "+91 94053 32937",
      primaryTel: "tel:+919405332937",
      secondary: "9326309465",
      secondaryFormatted: "+91 93263 09465",
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
      full: "Plot No.14, Roshan Apartments, La Oceana Colony, Dona Paula, Goa–403004",
    },
  },
};
