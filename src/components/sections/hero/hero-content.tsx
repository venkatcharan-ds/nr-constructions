"use client";

import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroContainerVariants,
  heroItemVariants,
  heroItemReducedVariants,
  heroItemTransition,
} from "@/lib/motion/variants";
import { PROJECT } from "@/data/project";
import { HeroBadges } from "./hero-badges";
import { HeroStats } from "./hero-stats";
import { HeroCTA } from "./hero-cta";

export function HeroContent() {
  const rm = useReducedMotion();
  const item = rm ? heroItemReducedVariants : heroItemVariants;

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/*
        Flex spacer — grows to consume all vertical space above the content on tall
        screens (replicating the luxury bottom-anchor aesthetic), but never shrinks
        below the nav height so content can never overflow upward behind the nav.
        Desktop nav: h-nav (4.5rem). Mobile nav: h-mobile-nav (4rem).
      */}
      <div className="flex-1 min-h-mobile-nav lg:min-h-nav" aria-hidden="true" />

      {/* ── Main content — anchored toward lower-left ──────────────────── */}
      <div className="container-site pb-space-6 sm:pb-space-8 md:pb-space-9 lg:pb-space-10 xl:pb-space-11 pointer-events-auto">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div
            variants={item}
            transition={heroItemTransition}
            className="inline-flex items-center gap-space-2 mb-space-5"
          >
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
              "text-heading-1 md:text-display-2 lg:text-display-1",
              "mb-space-5",
            )}
          >
            {PROJECT.hero.headline}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={item}
            transition={heroItemTransition}
            className="text-body-lg text-ivory/75 text-pretty max-w-lg mb-space-6"
          >
            {PROJECT.hero.subheading}
          </motion.p>

          {/* Badges */}
          <motion.div variants={item} transition={heroItemTransition} className="mb-space-7">
            <HeroBadges />
          </motion.div>

          {/* Glass CTA panel — price + action buttons */}
          <motion.div
            variants={item}
            transition={heroItemTransition}
            className={cn(
              "glass-dark rounded-2xl p-space-5",
              "flex flex-col sm:flex-row sm:items-center gap-space-5",
            )}
          >
            <HeroStats />
            <div className="sm:border-l sm:border-ivory/20 sm:pl-space-5 sm:ml-auto shrink-0">
              <HeroCTA />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ───────────────────────────────────────────── */}
      <div className="absolute bottom-space-6 left-1/2 -translate-x-1/2 pointer-events-none hidden md:flex flex-col items-center gap-space-2">
        <motion.div
          animate={rm ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5 text-ivory/50" />
        </motion.div>
      </div>
    </div>
  );
}
