"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { formatPrice } from "@/lib/utils";
import {
  staggerContainerVariants,
  sectionVariants,
  sectionReducedVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
  sectionTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { PROJECT } from "@/data/project";
import { GALLERY_IMAGES } from "@/data/gallery";

const interiorImage = GALLERY_IMAGES.find((img) => img.id === "int-living")!;

const UNIT_FEATURES = [
  "2 Bedrooms with built-in wardrobes",
  "Spacious Living & Dining area",
  "Modular Kitchen with granite counter",
  "2 Bathrooms — attached & common",
  "Private Balcony",
  "Covered Parking — 1 per unit",
];

export function SpecsSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const imgVariants = rm ? sectionReducedVariants : sectionVariants;

  return (
    <section
      id="specifications"
      aria-labelledby="specs-heading"
      className="bg-onyx py-space-9 md:py-space-10"
    >
      <div className="container-site">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeader
            eyebrow="Apartment Specifications"
            heading="Two Spacious Configurations"
            subheading="Both variants offer identical amenities and finishes. Choose the layout that fits your family best."
            light
            prefersReducedMotion={rm}
          />

          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-space-8 items-start">

            {/* ── Left: unit cards + specs grid ───────────────────── */}
            <div>
              {/* Unit cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4 mb-space-7">
                {PROJECT.units.map((unit, i) => (
                  <motion.div
                    key={unit.areaSqm}
                    variants={item}
                    transition={{ ...fadeUpTransition, delay: i * 0.1 }}
                    className={cn(
                      "relative rounded-xl border border-ivory/10 bg-ivory/5 p-space-6",
                      "hover:border-laterite/30 hover:bg-ivory/8 transition-all duration-normal",
                    )}
                  >
                    {/* Type label */}
                    <div className="flex items-start justify-between mb-space-5">
                      <div>
                        <p className="text-label tracking-label uppercase text-laterite mb-space-1">
                          Unit Type {i === 0 ? "A" : "B"}
                        </p>
                        <h3 className="font-display text-heading-2 tracking-heading text-ivory">
                          {unit.bhk} BHK
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-micro text-stone uppercase tracking-micro mb-space-1">
                          Carpet Area
                        </p>
                        <p className="font-display text-heading-3 text-ivory num-tabular">
                          {unit.areaSqm} sqm
                        </p>
                        <p className="text-micro text-stone">
                          ({unit.areaSqft.toLocaleString("en-IN")} sqft)
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-ivory/10 pt-space-5 mb-space-5">
                      <p className="text-micro text-stone uppercase tracking-micro mb-space-1">Price</p>
                      <p className="font-display text-heading-1 tracking-heading text-laterite num-tabular">
                        {formatPrice(unit.price)}
                      </p>
                      <p className="text-micro text-stone mt-space-1">
                        all-inclusive · no hidden charges
                      </p>
                    </div>

                    <ul className="space-y-space-2">
                      {UNIT_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-space-3">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-body-sm text-stone">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Key specs grid */}
              <motion.div
                variants={item}
                transition={fadeUpTransition}
                className="rounded-xl border border-ivory/10 bg-ivory/5 p-space-6 mb-space-7"
              >
                <p className="text-label tracking-label uppercase text-laterite mb-space-5">
                  Building & Finish Specifications
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-space-6 gap-y-space-5">
                  {PROJECT.keySpecs.map((spec) => (
                    <div key={spec.id}>
                      <p className="text-micro text-stone/60 uppercase tracking-micro mb-space-1">
                        {spec.label}
                      </p>
                      <p className="text-body-sm font-medium text-ivory">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA row */}
              <motion.div
                variants={item}
                transition={fadeUpTransition}
                className="flex flex-wrap items-center gap-space-4"
              >
                <Link
                  href="#contact"
                  className={cn(
                    "inline-flex items-center gap-space-3",
                    "px-space-6 py-space-4 rounded-md",
                    "bg-laterite text-ivory",
                    "text-label tracking-label uppercase font-medium",
                    "shadow-accent transition-all duration-fast",
                    "hover:bg-laterite-dark hover:shadow-lg",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
                  )}
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Book a Site Visit
                </Link>
                <p className="text-body-sm text-stone">
                  Price:{" "}
                  <span className="text-ivory font-medium num-tabular">
                    {formatPrice(PROJECT.pricing.min)}
                  </span>
                </p>
              </motion.div>
            </div>

            {/* ── Right: interior image ────────────────────────────── */}
            <motion.div
              variants={imgVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...sectionTransition, delay: 0.2 }}
              className="hidden lg:block mt-0 sticky top-space-8"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[3/4]">
                <Image
                  src={interiorImage.url}
                  alt={interiorImage.altText}
                  fill
                  placeholder="blur"
                  blurDataURL={interiorImage.blurDataURL}
                  sizes="380px"
                  className="object-cover object-center"
                  quality={85}
                />
                <div className="absolute inset-0 overlay-hero pointer-events-none" aria-hidden="true" />
                <div className="absolute bottom-space-4 left-space-4 right-space-4">
                  <p className="text-body-sm font-medium text-ivory mb-space-1">Living Room</p>
                  <p className="text-micro text-stone/80">
                    Premium vitrified tiles · Aluminium windows
                  </p>
                </div>
              </div>

              {/* Quick-action card below image */}
              <div className="mt-space-4 p-space-4 rounded-xl border border-ivory/10 bg-ivory/5">
                <p className="text-body-sm text-stone mb-space-3">
                  Want to see it in person?
                </p>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-space-2 text-laterite text-body-sm font-medium hover:text-laterite-light transition-colors duration-fast"
                >
                  Schedule a free site visit
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
