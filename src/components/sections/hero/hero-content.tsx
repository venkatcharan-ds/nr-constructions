"use client";

import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroContainerVariants,
  heroItemVariants,
  heroItemReducedVariants,
  heroItemTransition,
  floatingCardVariants,
  floatingCardReducedVariants,
  floatingCard1Transition,
  floatingCard2Transition,
} from "@/lib/motion/variants";
import { PROJECT } from "@/data/project";
import { HeroBadges } from "./hero-badges";
import { HeroStats } from "./hero-stats";
import { HeroCTA } from "./hero-cta";

export function HeroContent() {
  const rm = useReducedMotion();
  const item = rm ? heroItemReducedVariants : heroItemVariants;
  const cardVariants = rm ? floatingCardReducedVariants : floatingCardVariants;

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/*
        Mobile: pt-mobile-nav lets content flow naturally from the top-third.
        Desktop: two equal flex-1 spacers vertically center the content block.
        The min-h-nav spacer ensures the heading never collides with the nav.
      */}

      {/* Top spacer — desktop only centering; mobile uses padding instead */}
      <div className="hidden md:block flex-1 min-h-nav" aria-hidden="true" />

      {/* ── Main content row ─────────────────────────────────────────────── */}
      <div className="container-site pointer-events-auto pt-mobile-nav pb-space-8 md:pt-0 md:pb-space-7">
        <div className="flex items-end gap-space-8 lg:gap-space-10">

          {/* ── Left column: narrative stack ─────────────────────────────── */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0"
          >
            {/* Eyebrow — location signal with laterite rule */}
            <motion.div
              variants={item}
              transition={heroItemTransition}
              className="flex items-center gap-space-3 mb-space-4"
            >
              <span className="block w-6 h-px bg-laterite shrink-0" aria-hidden="true" />
              <MapPin className="w-3.5 h-3.5 text-laterite shrink-0" aria-hidden="true" />
              <span className="text-label tracking-label uppercase text-laterite font-medium">
                {PROJECT.hero.eyebrow}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              transition={heroItemTransition}
              className={cn(
                "font-display tracking-display text-ivory text-balance text-shadow-hero",
                "text-heading-2 sm:text-heading-1 md:text-display-2 lg:text-display-1",
                "mb-space-4",
              )}
            >
              {PROJECT.hero.headline}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={item}
              transition={heroItemTransition}
              className="text-body-lg text-ivory/85 text-pretty max-w-lg mb-space-6"
            >
              {PROJECT.hero.subheading}
            </motion.p>

            {/* Badges */}
            <motion.div variants={item} transition={heroItemTransition} className="mb-space-7">
              <HeroBadges />
            </motion.div>

            {/* Glass CTA panel — action zone with laterite top border */}
            <motion.div
              variants={item}
              transition={heroItemTransition}
              className={cn(
                "glass-hero-panel rounded-xl p-space-5",
                "flex flex-col sm:flex-row sm:items-center gap-space-5",
              )}
            >
              <HeroStats />
              <div className="sm:border-l sm:border-ivory/15 sm:pl-space-5 sm:ml-auto shrink-0">
                <HeroCTA />
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right column: floating info cards — desktop only ──────────── */}
          <div className="hidden lg:flex flex-col gap-space-5 shrink-0 w-56 pb-space-5">
            {/* Status card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={floatingCard1Transition}
              className="glass-dark rounded-xl px-space-4 py-space-4 flex items-center gap-space-3"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <div>
                <p className="text-body-sm font-semibold text-ivory leading-none mb-space-1">
                  Ready to Move
                </p>
                <p className="text-micro text-ivory/60">{PROJECT.floatingCardStatus}</p>
              </div>
            </motion.div>

            {/* Price focal point card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={floatingCard2Transition}
              className="glass-price-card rounded-xl px-space-5 py-space-5"
            >
              <p className="text-micro text-ivory/60 uppercase tracking-micro mb-space-2">
                Starting from
              </p>
              <p
                className="font-display text-display-2 tracking-display text-laterite num-tabular leading-none mb-space-2"
                aria-label={`Starting from ${formatPrice(PROJECT.pricing.min)}`}
              >
                {formatPrice(PROJECT.pricing.min)}
              </p>
              <p className="text-label text-ivory/65 tracking-tight">
                {PROJECT.pricing.floatingLabel}
              </p>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom spacer — desktop centering */}
      <div className="hidden md:block flex-1" aria-hidden="true" />

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div className="absolute bottom-space-6 left-1/2 -translate-x-1/2 pointer-events-none hidden md:flex flex-col items-center gap-space-2">
        <span className="text-micro tracking-micro uppercase text-ivory/40">Scroll</span>
        <motion.div
          animate={rm ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 text-ivory/40" />
        </motion.div>
      </div>
    </div>
  );
}
