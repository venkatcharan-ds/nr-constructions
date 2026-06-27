"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  heroImageVariants,
  heroImageReducedVariants,
  heroImageTransition,
} from "@/lib/motion/variants";
import { getHeroImage } from "@/data/gallery";

const heroImage = getHeroImage();

export function HeroImage() {
  const rm = useReducedMotion();
  const imgVariants = rm ? heroImageReducedVariants : heroImageVariants;

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
          style={{ objectPosition: "var(--hero-image-position, 70% center)" }}
          className="object-cover"
          quality={90}
        />
      </motion.div>

      {/* ── Nav legibility vignette — top-down gradient for nav text over bright sky */}
      <div
        className="absolute inset-x-0 top-0 h-40 overlay-nav pointer-events-none z-raised"
        aria-hidden="true"
      />

      {/* ── Cinematic gradient overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 overlay-cinematic pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
