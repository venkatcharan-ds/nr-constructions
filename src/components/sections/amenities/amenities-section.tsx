"use client";

import { motion } from "framer-motion";
import {
  ArrowUpFromDot,
  Car,
  Wind,
  Droplets,
  Zap,
  ShieldCheck,
  TreePine,
  HardHat,
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
import { AMENITIES } from "@/data/amenities";
import type { AmenityIconName } from "@/data/amenities";

const ICON_MAP: Record<AmenityIconName, LucideIcon> = {
  "arrow-up-from-dot": ArrowUpFromDot,
  car: Car,
  wind: Wind,
  droplets: Droplets,
  zap: Zap,
  "shield-check": ShieldCheck,
  "tree-pine": TreePine,
  wifi: Zap,
  "hard-hat": HardHat,
  flame: Zap,
};

export function AmenitiesSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const sorted = [...AMENITIES].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      id="amenities"
      aria-labelledby="amenities-heading"
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
            eyebrow="Building Amenities"
            heading="Everything You Need"
            subheading="Every amenity is included in the sale price — no maintenance deposit surprises."
            prefersReducedMotion={rm}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4">
            {sorted.map((amenity, i) => {
              const Icon = ICON_MAP[amenity.icon];
              return (
                <motion.div
                  key={amenity.id}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: i * 0.05 }}
                  className={cn(
                    "group relative p-space-5 rounded-xl",
                    "border border-border-default bg-surface-card",
                    "hover:border-laterite/35 hover:shadow-lg hover:-translate-y-1",
                    "transition-all duration-normal cursor-default overflow-hidden",
                  )}
                >
                  {/* Background number — decorative */}
                  <span
                    className="absolute top-space-3 right-space-4 font-display text-[4rem] leading-none text-fog select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <span
                    className={cn(
                      "relative inline-flex items-center justify-center",
                      "w-11 h-11 rounded-xl mb-space-4",
                      "bg-laterite/10 group-hover:bg-laterite/20",
                      "transition-colors duration-fast",
                    )}
                  >
                    <Icon
                      className="w-5 h-5 text-laterite group-hover:scale-110 transition-transform duration-fast"
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="relative text-body-md font-medium text-onyx mb-space-2">
                    {amenity.name}
                  </h3>
                  <p className="relative text-body-sm text-stone">{amenity.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
