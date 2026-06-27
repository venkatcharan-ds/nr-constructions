"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
} from "@/lib/motion/variants";
import { COMPANY } from "@/data/company";
import { PROJECT } from "@/data/project";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Specifications", href: "#specifications" },
  { label: "Amenities", href: "#amenities" },
  { label: "Floor Plan", href: "#floor-plan" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

function whatsAppUrl(msg: string): string {
  return `https://wa.me/${COMPANY.contact.whatsapp.number}?text=${encodeURIComponent(msg)}`;
}

export function Footer() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-water" aria-label="Site footer">
      {/* ── Top divider accent ─────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-laterite/40 to-transparent" aria-hidden="true" />

      <div className="container-site pt-space-9 md:pt-space-10 pb-space-7">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* ── Main grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-8 mb-space-9">

            {/* Col 1: Brand */}
            <motion.div variants={item} transition={fadeUpTransition}>
              <div className="flex items-center gap-space-3 mb-space-4">
                <div className="w-9 h-9 rounded-lg bg-laterite/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-laterite" aria-hidden="true" />
                </div>
                <p className="font-display text-heading-3 tracking-heading text-ivory">
                  {COMPANY.name}
                </p>
              </div>

              <p className="text-body-sm text-stone mb-space-4 max-w-xs text-pretty">
                {COMPANY.tagline}
              </p>
              <p className="text-body-sm text-stone/60 mb-space-6 max-w-xs text-pretty">
                {COMPANY.shortDescription}
              </p>

              {/* Contact links */}
              <div className="space-y-space-3">
                <a
                  href={COMPANY.contact.phone.primaryTel}
                  className="flex items-center gap-space-3 text-body-sm text-stone hover:text-ivory transition-colors duration-fast group"
                >
                  <Phone className="w-4 h-4 text-laterite/70 group-hover:text-laterite shrink-0 transition-colors duration-fast" aria-hidden="true" />
                  {COMPANY.contact.phone.primaryFormatted}
                </a>
                <a
                  href={COMPANY.contact.phone.secondaryTel}
                  className="flex items-center gap-space-3 text-body-sm text-stone hover:text-ivory transition-colors duration-fast group"
                >
                  <Phone className="w-4 h-4 text-laterite/70 group-hover:text-laterite shrink-0 transition-colors duration-fast" aria-hidden="true" />
                  {COMPANY.contact.phone.secondaryFormatted}
                </a>
                <a
                  href={`mailto:${COMPANY.contact.email}`}
                  className="flex items-center gap-space-3 text-body-sm text-stone hover:text-ivory transition-colors duration-fast group"
                >
                  <Mail className="w-4 h-4 text-laterite/70 group-hover:text-laterite shrink-0 transition-colors duration-fast" aria-hidden="true" />
                  {COMPANY.contact.email}
                </a>
                <a
                  href={whatsAppUrl(COMPANY.contact.whatsapp.defaultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-space-3 text-body-sm text-stone hover:text-ivory transition-colors duration-fast group"
                >
                  <MessageCircle className="w-4 h-4 text-laterite/70 group-hover:text-laterite shrink-0 transition-colors duration-fast" aria-hidden="true" />
                  WhatsApp
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-fast" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            {/* Col 2: Navigation */}
            <motion.div variants={item} transition={{ ...fadeUpTransition, delay: 0.08 }}>
              <p className="text-label tracking-label uppercase text-laterite mb-space-5">
                Quick Links
              </p>
              <nav aria-label="Footer navigation">
                <ul className="grid grid-cols-2 gap-x-space-4 gap-y-space-3">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-body-sm text-stone hover:text-ivory",
                          "transition-colors duration-fast",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-laterite rounded",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>

            {/* Col 3: Project details + address */}
            <motion.div variants={item} transition={{ ...fadeUpTransition, delay: 0.16 }}>
              <p className="text-label tracking-label uppercase text-laterite mb-space-5">
                Project Details
              </p>

              {/* Project key specs */}
              <div className="space-y-space-3 mb-space-5 pb-space-5 border-b border-ivory/10">
                {[
                  { label: "Project", value: PROJECT.name },
                  { label: "Configuration", value: "2 BHK" },
                  { label: "Building", value: "G+4 Floors" },
                  { label: "Starting Price", value: "₹61 Lakhs" },
                  { label: "Possession", value: "Ready to Move" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-space-3">
                    <span className="text-micro text-stone/60 shrink-0">{label}</span>
                    <span className="text-body-sm text-ivory font-medium text-right num-tabular">{value}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="flex items-start gap-space-3">
                <MapPin className="w-4 h-4 text-laterite/70 shrink-0 mt-0.5" aria-hidden="true" />
                <address className="not-italic text-body-sm text-stone">
                  {COMPANY.contact.address.line1}<br />
                  {COMPANY.contact.address.line2}<br />
                  {COMPANY.contact.address.city} – {COMPANY.contact.address.pincode}
                </address>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom bar ────────────────────────────────────────── */}
          <motion.div
            variants={item}
            transition={{ ...fadeUpTransition, delay: 0.2 }}
            className="pt-space-6 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-space-3"
          >
            <p className="text-micro text-stone/50 text-center sm:text-left">
              © {currentYear} {COMPANY.legalName}. All rights reserved.
            </p>
            <div className="flex items-center gap-space-5">
              <p className="text-micro text-stone/40">
                {PROJECT.address.city} · {PROJECT.address.pincode}
              </p>
              <span className="w-px h-3 bg-ivory/10" aria-hidden="true" />
              <p className="text-micro text-stone/40">
                Real Estate · Goa, India
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
