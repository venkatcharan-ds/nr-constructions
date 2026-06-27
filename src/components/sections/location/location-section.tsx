"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Waves,
  Bus,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { LOCATION } from "@/data/location";
import type { LandmarkType } from "@/data/location";

const TYPE_META: Record<LandmarkType, { label: string; Icon: LucideIcon; color: string }> = {
  essential: { label: "Essentials", Icon: ShoppingCart, color: "text-laterite" },
  education: { label: "Education", Icon: GraduationCap, color: "text-success" },
  healthcare: { label: "Healthcare", Icon: HeartPulse, color: "text-error" },
  leisure: { label: "Leisure", Icon: Waves, color: "text-laterite-light" },
  transport: { label: "Transport", Icon: Bus, color: "text-stone" },
};

const TYPE_ORDER: LandmarkType[] = ["essential", "transport", "education", "healthcare", "leisure"];

export function LocationSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    meta: TYPE_META[type],
    landmarks: LOCATION.landmarks.filter((l) => l.type === type),
  })).filter((g) => g.landmarks.length > 0);

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="bg-surface-primary py-space-9 md:py-space-10"
    >
      <div className="container-site">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeader
            eyebrow="Location & Connectivity"
            heading="In the Heart of North Goa"
            subheading="Corlim sits at the crossroads of Panjim, the highway, and Goa's best beaches — well-connected without the city noise."
            prefersReducedMotion={rm}
          />

          {/* ── Connectivity pills ─────────────────────────────────── */}
          <motion.div
            variants={item}
            transition={fadeUpTransition}
            className="flex flex-wrap gap-space-3 mb-space-8"
          >
            {LOCATION.connectivitySummary.map((line) => (
              <div
                key={line}
                className="inline-flex items-center gap-space-2 px-space-4 py-space-2 rounded-lg border border-border-default bg-fog"
              >
                <MapPin className="w-3.5 h-3.5 text-laterite shrink-0" aria-hidden="true" />
                <span className="text-body-sm text-onyx">{line}</span>
              </div>
            ))}
          </motion.div>

          {/* ── Landmark groups ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-5">
            {grouped.map((group, gi) => {
              const { Icon, label, color } = group.meta;
              return (
                <motion.div
                  key={group.type}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: gi * 0.07 }}
                  className="p-space-5 rounded-xl border border-border-default bg-surface-card"
                >
                  <div className="flex items-center gap-space-3 mb-space-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-fog">
                      <Icon className={cn("w-4 h-4", color)} aria-hidden="true" />
                    </span>
                    <p className="text-label tracking-label uppercase text-onyx font-medium">
                      {label}
                    </p>
                  </div>
                  <ul className="space-y-space-3">
                    {group.landmarks.map((lm) => (
                      <li key={lm.id} className="flex items-baseline justify-between gap-space-3">
                        <span className="text-body-sm text-onyx">{lm.name}</span>
                        <span className="text-micro text-stone shrink-0 num-tabular">
                          {lm.distance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* ── Address strip ──────────────────────────────────────── */}
          <motion.div
            variants={item}
            transition={fadeUpTransition}
            className="mt-space-8 p-space-5 rounded-xl bg-fog border border-border-default flex flex-wrap items-center gap-space-4"
          >
            <MapPin className="w-5 h-5 text-laterite shrink-0" aria-hidden="true" />
            <div>
              <p className="text-body-sm font-medium text-onyx">
                Plot No. 14, Roshan Apartments, La Oceana Colony
              </p>
              <p className="text-body-sm text-stone">Dona Paula, Goa — 403004</p>
            </div>
            <a
              href={`https://www.google.com/maps?q=${LOCATION.coordinates.lat},${LOCATION.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-auto text-label tracking-label uppercase text-laterite",
                "hover:text-laterite-dark underline-offset-2 hover:underline",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
              )}
            >
              Get Directions
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
