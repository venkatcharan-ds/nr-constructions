// ── FAQ types ─────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// ── FAQ content ───────────────────────────────────────────────────────────────

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "ready-to-move",
    question: "Is the building ready to move in?",
    answer:
      "Yes. SK Royal & SK Elite is fully constructed and complete. Units are available for immediate possession — there is no waiting period.",
  },
  {
    id: "price-inclusive",
    question: "Is the price all-inclusive? Are there hidden charges?",
    answer:
      "The listed price of ₹61 Lakhs is all-inclusive. There are no floor-rise charges, preferential location charges, or club membership fees. What you see is what you pay.",
  },
  {
    id: "unit-sizes",
    question: "What are the apartment sizes?",
    answer:
      "We offer two 2 BHK configurations: 102 sqm (1,098 sqft) and 103 sqm (1,109 sqft). Both include two bedrooms, a living/dining area, a kitchen, two bathrooms, and a balcony.",
  },
  {
    id: "lift",
    question: "Is there a lift in the building?",
    answer:
      "Yes. The building has a passenger lift serving all floors from ground to the fourth floor.",
  },
  {
    id: "parking",
    question: "Is parking included?",
    answer:
      "Yes. Each unit comes with one dedicated covered parking space included in the sale price.",
  },
  {
    id: "loan",
    question: "Can I get a home loan for this property?",
    answer:
      "Yes. The property is eligible for home loans from leading banks. We can assist you with documentation and connect you with our banking partners.",
  },
  {
    id: "rera",
    question: "Is the project RERA registered?",
    answer:
      "We are in the process of obtaining RERA registration. Please contact us directly for the latest status and documentation.",
  },
  {
    id: "site-visit",
    question: "Can I visit the site?",
    answer:
      "Absolutely. We welcome site visits by appointment. Use the Book Site Visit button or WhatsApp us to schedule a convenient time.",
  },
  {
    id: "location",
    question: "How far is the apartment from Panjim?",
    answer:
      "SK Royal & SK Elite is in Corlim, approximately 6 km from Panjim city centre — about a 10-minute drive. The location offers easy access to NH66, Goa University, and the airport.",
  },
  {
    id: "documentation",
    question: "What documents are required to book?",
    answer:
      "To reserve a unit you will need a government-issued photo ID, PAN card, and address proof. Our team will guide you through the full documentation process at the time of booking.",
  },
];
