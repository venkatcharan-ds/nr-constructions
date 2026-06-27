"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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
import { COMPANY } from "@/data/company";
import { PROJECT } from "@/data/project";
import { LOCATION } from "@/data/location";
import { GALLERY_IMAGES } from "@/data/gallery";

const supportImage = GALLERY_IMAGES.find((img) => img.id === "ext-angle-1")!;

const VALUE_ICONS: Record<string, string> = {
  transparency: "01",
  quality: "02",
  timeliness: "03",
  service: "04",
};

export function AboutSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const imgVariants = rm ? sectionReducedVariants : sectionVariants;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-surface-primary py-space-9 md:py-space-10"
    >
      <div className="container-site">
        <div className="lg:grid lg:grid-cols-2 lg:gap-space-10 items-start">

          {/* ── Left: text content ───────────────────────────────────── */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <SectionHeader
              eyebrow="About the Project"
              heading="Homes Built to Last"
              subheading={PROJECT.aboutHighlight}
              prefersReducedMotion={rm}
            />

            {/* About paragraphs */}
            <div className="space-y-space-4 mb-space-7">
              {COMPANY.about.map((para, i) => (
                <motion.p
                  key={i}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: i * 0.06 }}
                  className="text-body-md text-stone text-pretty"
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Key facts strip */}
            <motion.div
              variants={item}
              transition={fadeUpTransition}
              className="grid grid-cols-3 gap-space-4 mb-space-6 p-space-5 rounded-xl bg-fog border border-border-default"
            >
              {[
                { label: "Ready", value: "Now" },
                { label: "Building", value: "G+4" },
                { label: "Price", value: "₹61L+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-heading-3 tracking-heading text-onyx num-tabular">
                    {stat.value}
                  </p>
                  <p className="text-micro text-stone uppercase tracking-micro mt-space-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Location chip */}
            <motion.div
              variants={item}
              transition={fadeUpTransition}
              className="inline-flex items-center gap-space-2 px-space-4 py-space-2 rounded-lg border border-border-default bg-fog"
            >
              <MapPin className="w-4 h-4 text-laterite shrink-0" aria-hidden="true" />
              <span className="text-body-sm text-onyx font-medium">
                {PROJECT.address.line1}, {PROJECT.address.city}
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right: image + values ────────────────────────────────── */}
          <div className="mt-space-9 lg:mt-0 space-y-space-5">

            {/* Supporting image */}
            <motion.div
              variants={imgVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...sectionTransition, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-lg aspect-[3/4]"
            >
              <Image
                src={supportImage.url}
                alt={supportImage.altText}
                fill
                placeholder="blur"
                blurDataURL={supportImage.blurDataURL}
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-center"
                quality={85}
              />
              {/* Bottom caption */}
              <div className="absolute bottom-0 inset-x-0 overlay-hero pointer-events-none" aria-hidden="true" />
              <div className="absolute bottom-space-4 left-space-4">
                <p className="text-body-sm font-medium text-ivory">{PROJECT.name}</p>
                <p className="text-micro text-stone/80">{PROJECT.subtitle}</p>
              </div>
            </motion.div>

            {/* Values grid */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 gap-space-3"
            >
              {COMPANY.values.map((v, i) => (
                <motion.div
                  key={v.id}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: i * 0.07 }}
                  className={cn(
                    "group p-space-5 rounded-xl border border-border-default bg-surface-card",
                    "hover:shadow-md hover:border-laterite/30 hover:-translate-y-0.5",
                    "transition-all duration-normal cursor-default",
                  )}
                >
                  <div className="flex items-center justify-between mb-space-3">
                    <CheckCircle2 className="w-5 h-5 text-laterite group-hover:scale-110 transition-transform duration-fast" aria-hidden="true" />
                    <span className="font-display text-heading-2 text-fog tracking-heading select-none">
                      {VALUE_ICONS[v.id] ?? "—"}
                    </span>
                  </div>
                  <h3 className="text-body-md font-medium text-onyx mb-space-2">{v.title}</h3>
                  <p className="text-body-sm text-stone">{v.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Connectivity strip */}
            <motion.div
              variants={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={fadeUpTransition}
              className="p-space-5 rounded-xl bg-onyx"
            >
              <p className="text-label tracking-label uppercase text-laterite mb-space-3">
                Connectivity
              </p>
              <ul className="space-y-space-2">
                {LOCATION.connectivitySummary.map((line) => (
                  <li key={line} className="flex items-center gap-space-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-laterite shrink-0" aria-hidden="true" />
                    <span className="text-body-sm text-stone">{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
