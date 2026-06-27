"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
  lightboxBackdropVariants,
  lightboxImageVariants,
  lightboxReducedVariants,
  lightboxTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { GALLERY_IMAGES, getImagesByCategory } from "@/data/gallery";
import { trackEvent } from "@/components/analytics/google-analytics";
import type { ImageCategory } from "@/types";

type FilterTab = { label: string; value: ImageCategory | "all" };

const TABS: FilterTab[] = [
  { label: "All", value: "all" },
  { label: "Exterior", value: "exterior" },
  { label: "Interior", value: "interior" },
  { label: "Floor Plan", value: "floor-plan" },
];

export function GallerySection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;

  const [activeTab, setActiveTab] = useState<ImageCategory | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const triggerRef   = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const displayImages =
    activeTab === "all"
      ? [...GALLERY_IMAGES].sort((a, b) => a.sortOrder - b.sortOrder)
      : getImagesByCategory(activeTab as ImageCategory);

  const openLightbox = useCallback((index: number, trigger?: HTMLButtonElement | null) => {
    if (trigger) triggerRef.current = trigger;
    setLightboxIndex(index);
    trackEvent({ action: "gallery_open", category: "Gallery", label: displayImages[index]?.id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    // Restore focus to the image button that opened the lightbox
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + displayImages.length) % displayImages.length,
    );
  }, [displayImages.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % displayImages.length,
    );
  }, [displayImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIndex, prev, next, closeLightbox]);

  // Focus close button when lightbox opens; scroll active thumbnail into view
  useEffect(() => {
    if (lightboxIndex !== null) {
      requestAnimationFrame(() => closeButtonRef.current?.focus());
      thumbnailRefs.current[lightboxIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);

  const currentImage = lightboxIndex !== null ? displayImages[lightboxIndex] : null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
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
            eyebrow="Photo Gallery"
            heading="See It For Yourself"
            subheading="Browse every corner of Roshan Apartments — from the street facade to the balcony view."
            light
            prefersReducedMotion={rm}
          />

          {/* ── Filter tabs ─────────────────────────────────────────── */}
          <motion.div
            variants={item}
            transition={fadeUpTransition}
            role="tablist"
            aria-label="Gallery categories"
            className="flex flex-wrap gap-space-3 mb-space-7"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-space-4 py-space-2 rounded-lg text-label tracking-label uppercase",
                  "border transition-all duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
                  activeTab === tab.value
                    ? "bg-laterite text-ivory border-laterite"
                    : "bg-transparent text-stone border-ivory/10 hover:border-laterite/40 hover:text-ivory",
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* ── Masonry grid ────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="columns-2 md:columns-3 gap-space-3"
            >
              {displayImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: i * 0.04 }}
                  className="break-inside-avoid mb-space-3"
                >
                  <button
                    onClick={(e) => openLightbox(i, e.currentTarget)}
                    aria-label={`View ${img.altText}`}
                    className={cn(
                      "relative w-full overflow-hidden rounded-xl group",
                      "cursor-zoom-in block",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-onyx",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText}
                      width={img.width}
                      height={img.height}
                      placeholder="blur"
                      blurDataURL={img.blurDataURL}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                      className="w-full h-auto transition-transform duration-slow group-hover:scale-[1.04]"
                      quality={80}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-onyx/0 group-hover:bg-onyx/25 transition-colors duration-normal flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-fast glass-dark rounded-full p-space-3">
                        <ZoomIn className="w-5 h-5 text-ivory" aria-hidden="true" />
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {currentImage && lightboxIndex !== null && (
          <motion.div
            variants={rm ? lightboxReducedVariants : lightboxBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={lightboxTransition}
            className="fixed inset-0 z-modal bg-onyx/96 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* ── Top bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-space-5 py-space-4 shrink-0">
              <p className="text-micro text-stone num-tabular">
                {lightboxIndex + 1} / {displayImages.length}
              </p>
              <p className="text-body-sm text-stone/70 hidden sm:block max-w-sm truncate">
                {currentImage.altText}
              </p>
              <button
                ref={closeButtonRef}
                onClick={closeLightbox}
                aria-label="Close lightbox (Esc)"
                className={cn(
                  "w-9 h-9 rounded-full glass-dark flex items-center justify-center",
                  "hover:bg-ivory/10 transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                )}
              >
                <X className="w-4 h-4 text-ivory" aria-hidden="true" />
              </button>
            </div>

            {/* ── Main image ──────────────────────────────────────── */}
            <div
              className="flex-1 relative flex items-center justify-center px-space-8 md:px-space-10 min-h-0"
              onClick={closeLightbox}
            >
              {/* Prev */}
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image (←)"
                className={cn(
                  "absolute left-space-3 md:left-space-5 z-raised",
                  "w-10 h-10 rounded-full glass-dark flex items-center justify-center",
                  "hover:bg-ivory/10 transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                )}
              >
                <ChevronLeft className="w-5 h-5 text-ivory" aria-hidden="true" />
              </button>

              <motion.div
                key={lightboxIndex}
                variants={rm ? lightboxReducedVariants : lightboxImageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={lightboxTransition}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-full max-w-full"
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText}
                  width={currentImage.width}
                  height={currentImage.height}
                  placeholder="blur"
                  blurDataURL={currentImage.blurDataURL}
                  sizes="(min-width: 1280px) 900px, 90vw"
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                  quality={90}
                />
              </motion.div>

              {/* Next */}
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image (→)"
                className={cn(
                  "absolute right-space-3 md:right-space-5 z-raised",
                  "w-10 h-10 rounded-full glass-dark flex items-center justify-center",
                  "hover:bg-ivory/10 transition-colors duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                )}
              >
                <ChevronRight className="w-5 h-5 text-ivory" aria-hidden="true" />
              </button>
            </div>

            {/* ── Thumbnail strip ──────────────────────────────────── */}
            <div className="shrink-0 px-space-4 pb-space-5 pt-space-3">
              <div className="flex gap-space-2 overflow-x-auto scrollbar-none justify-start">
                {displayImages.map((img, i) => (
                  <button
                    key={img.id}
                    ref={(el) => { thumbnailRefs.current[i] = el; }}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === lightboxIndex ? "true" : undefined}
                    className={cn(
                      "relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden",
                      "transition-all duration-fast",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
                      i === lightboxIndex
                        ? "ring-2 ring-laterite ring-offset-2 ring-offset-onyx opacity-100"
                        : "opacity-40 hover:opacity-70",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText}
                      fill
                      sizes="64px"
                      className="object-cover"
                      quality={40}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
