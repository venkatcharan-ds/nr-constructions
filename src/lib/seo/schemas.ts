import { SITE_CONFIG, CONTACT } from "@/config/site";
import { FAQ_ITEMS } from "@/data/faq";

const BASE_URL = SITE_CONFIG.url;

// ── LocalBusiness + RealEstateListing ────────────────────────────────────────

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    name: "NR Constructions",
    description: SITE_CONFIG.description,
    url: BASE_URL,
    telephone: `+91${CONTACT.phone.primary}`,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${CONTACT.address.line1}, ${CONTACT.address.line2}`,
      addressLocality: "Corlim",
      addressRegion: "Goa",
      postalCode: CONTACT.address.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 15.5131,
      longitude: 73.8448,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
    hasMap: `https://www.google.com/maps?q=15.5131,73.8448`,
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Bank Transfer, Home Loan",
    areaServed: {
      "@type": "City",
      name: "Goa",
      containedInPlace: {
        "@type": "Country",
        name: "India",
      },
    },
  };
}

// ── Apartment Listing ─────────────────────────────────────────────────────────

export function buildApartmentListingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: "SK Royal & SK Elite — 2 BHK in Corlim, Goa",
    description:
      "Ready-to-move premium 2 BHK apartments in Corlim, North Goa. G+4 building with lift, covered parking. Available in 102 sqm and 103 sqm configurations starting ₹61 Lakhs.",
    url: BASE_URL,
    numberOfRooms: 4,
    floorSize: {
      "@type": "QuantitativeValue",
      minValue: 102,
      maxValue: 103,
      unitText: "SQM",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot No.14, SK Royal & SK Elite, La Oceana Colony",
      addressLocality: "Corlim",
      addressRegion: "North Goa",
      postalCode: "403110",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 15.5131,
      longitude: 73.8448,
    },
    offers: [
      {
        "@type": "Offer",
        name: "2 BHK — Type A (102 sqm)",
        price: "6100000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "NR Constructions" },
      },
      {
        "@type": "Offer",
        name: "2 BHK — Type B (103 sqm)",
        price: "6100000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "NR Constructions" },
      },
    ],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Passenger Lift", value: true },
      { "@type": "LocationFeatureSpecification", name: "Covered Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Power Backup", value: true },
      { "@type": "LocationFeatureSpecification", name: "24/7 Water Supply", value: true },
      { "@type": "LocationFeatureSpecification", name: "Security", value: true },
      { "@type": "LocationFeatureSpecification", name: "Modular Kitchen", value: true },
    ],
  };
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

export function buildBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "SK Royal & SK Elite",
        item: `${BASE_URL}/#about`,
      },
    ],
  };
}
