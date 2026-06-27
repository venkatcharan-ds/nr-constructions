"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroImageVariants,
  heroImageReducedVariants,
  heroImageTransition,
  floatingCardVariants,
  floatingCardReducedVariants,
  floatingCard1Transition,
  floatingCard2Transition,
} from "@/lib/motion/variants";
import { PROJECT } from "@/data/project";
import { getHeroImage } from "@/data/gallery";

const heroImage = getHeroImage();

export function HeroImage() {
  const rm = useReducedMotion();
  const imgVariants = rm ? heroImageReducedVariants : heroImageVariants;
  const cardVariants = rm ? floatingCardReducedVariants : floatingCardVariants;

  return (
    <>
      {/* ── Full-bleed background image ────────────────────────────────── */}
      <motion.div
        variants={imgVariants}
        initial="hidden"
        animate="visible"
        transition={heroImageTransition}
        className="absolute inset-0"
      >
        <Image
          src={heroImage.url}
          alt={heroImage.altText}
          fill
          priority
          placeholder="blur"
          blurDataURL={heroImage.blurDataURL}
          sizes="100vw"
          className="object-cover object-center"
          quality={90}
        />
      </motion.div>

      {/* ── Cinematic gradient overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 overlay-cinematic pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Floating card: Ready to Move ──────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={floatingCard1Transition}
        className="absolute top-28 md:top-36 right-5 md:right-8 glass-dark rounded-2xl px-space-4 py-space-3 flex items-center gap-space-3 z-raised"
        aria-hidden="true"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
        </span>
        <div>
          <p className="text-body-sm font-medium text-ivory leading-none mb-space-1">
            Ready to Move
          </p>
          <p className="text-micro text-stone">{PROJECT.floatingCardStatus}</p>
        </div>
      </motion.div>

      {/* ── Floating card: Starting price ─────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={floatingCard2Transition}
        className="absolute top-48 md:top-60 right-5 md:right-8 glass-dark rounded-2xl px-space-4 py-space-3 z-raised min-w-[140px]"
        aria-hidden="true"
      >
        <p className="text-micro text-stone/80 uppercase tracking-micro mb-space-1">
          Starting from
        </p>
        <p className="font-display text-heading-3 tracking-heading text-laterite num-tabular">
          {formatPrice(PROJECT.pricing.min)}
        </p>
        <p className="text-micro text-stone mt-space-1">
          {PROJECT.pricing.floatingLabel}
        </p>
      </motion.div>
    </>
  );
}
