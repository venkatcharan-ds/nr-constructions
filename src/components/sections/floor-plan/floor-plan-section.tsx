"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  sectionVariants,
  sectionReducedVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
  sectionTransition,
  lightboxBackdropVariants,
  lightboxImageVariants,
  lightboxReducedVariants,
  lightboxTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { PROJECT } from "@/data/project";
import { GALLERY_IMAGES } from "@/data/gallery";
import { trackEvent } from "@/components/analytics/google-analytics";

const floorPlanImage = GALLERY_IMAGES.find((img) => img.category === "floor-plan")!;

export function FloorPlanSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const imgVariants = rm ? sectionReducedVariants : sectionVariants;

  const [selectedUnit, setSelectedUnit] = useState<0 | 1>(0);
  const [modalOpen, setModalOpen] = useState(false);

  const unit = PROJECT.units[selectedUnit];
  const openTriggerRef   = useRef<HTMLButtonElement | null>(null);
  const modalCloseRef    = useRef<HTMLButtonElement | null>(null);

  const openModal = useCallback((trigger: HTMLButtonElement) => {
    openTriggerRef.current = trigger;
    setModalOpen(true);
    trackEvent({ action: "floor_plan_view", category: "FloorPlan", label: "modal_open" });
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    requestAnimationFrame(() => openTriggerRef.current?.focus());
  }, []);

  // Focus close button when modal opens
  useEffect(() => {
    if (modalOpen) requestAnimationFrame(() => modalCloseRef.current?.focus());
  }, [modalOpen]);

  // Escape key to close
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  return (
    <section
      id="floor-plan"
      aria-labelledby="floor-plan-heading"
      className="bg-fog py-space-9 md:py-space-10"
    >
      <div className="container-site">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeader
            eyebrow="Floor Plan"
            heading="Thoughtfully Planned Spaces"
            subheading="A layout designed for family life — generous living areas, private bedrooms, and a balcony open to the sky."
            align="center"
            prefersReducedMotion={rm}
          />

          {/* ── Unit type selector ───────────────────────────────────── */}
          <motion.div
            variants={item}
            transition={fadeUpTransition}
            className="flex justify-center gap-space-3 mb-space-7"
            role="group"
            aria-label="Select unit type"
          >
            {PROJECT.units.map((u, i) => (
              <button
                key={u.areaSqm}
                onClick={() => setSelectedUnit(i as 0 | 1)}
                aria-pressed={selectedUnit === i}
                className={cn(
                  "flex items-center gap-space-3 px-space-5 py-space-4 rounded-xl",
                  "border transition-all duration-fast",
                  "text-body-sm font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
                  selectedUnit === i
                    ? "bg-onyx text-ivory border-onyx shadow-md"
                    : "bg-surface-card text-onyx border-border-default hover:border-laterite/40",
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-sm shrink-0 transition-colors duration-fast",
                    selectedUnit === i ? "bg-laterite" : "bg-stone/40",
                  )}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <p className={cn("text-micro uppercase tracking-micro mb-0.5", selectedUnit === i ? "text-stone" : "text-stone/60")}>
                    Type {i === 0 ? "A" : "B"}
                  </p>
                  <p>{u.areaSqm} sqm · {u.bhk} BHK</p>
                </div>
                <span className={cn(
                  "ml-auto text-micro font-medium num-tabular",
                  selectedUnit === i ? "text-laterite" : "text-stone",
                )}>
                  {formatPrice(u.price)}
                </span>
              </button>
            ))}
          </motion.div>

          {/* ── Floor plan image ─────────────────────────────────────── */}
          <motion.div
            variants={imgVariants}
            transition={{ ...sectionTransition, delay: 0.15 }}
            className="relative mx-auto max-w-3xl mb-space-6"
          >
            <button
              onClick={(e) => openModal(e.currentTarget)}
              aria-label="View floor plan full size"
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl",
                "border border-border-default bg-surface-card shadow-lg",
                "cursor-zoom-in block",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
              )}
            >
              <Image
                src={floorPlanImage.url}
                alt={floorPlanImage.altText}
                width={floorPlanImage.width}
                height={floorPlanImage.height}
                placeholder="blur"
                blurDataURL={floorPlanImage.blurDataURL}
                sizes="(min-width: 1024px) 768px, (min-width: 640px) 90vw, 100vw"
                className="w-full h-auto object-contain transition-transform duration-slow group-hover:scale-[1.02]"
                quality={90}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-onyx/0 group-hover:bg-onyx/10 transition-colors duration-normal flex items-end justify-end p-space-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-fast glass-dark rounded-lg px-space-3 py-space-2 flex items-center gap-space-2">
                  <Maximize2 className="w-4 h-4 text-ivory" aria-hidden="true" />
                  <span className="text-micro text-ivory">Full size</span>
                </div>
              </div>
            </button>

            {/* Unit details strip below the image */}
            <div className="mt-space-4 p-space-5 rounded-xl bg-surface-card border border-border-default flex flex-wrap items-center gap-x-space-7 gap-y-space-3">
              <div>
                <p className="text-micro text-stone uppercase tracking-micro mb-space-1">Configuration</p>
                <p className="text-body-md font-medium text-onyx">{unit.bhk} BHK</p>
              </div>
              <div>
                <p className="text-micro text-stone uppercase tracking-micro mb-space-1">Carpet Area</p>
                <p className="text-body-md font-medium text-onyx num-tabular">{unit.areaSqm} sqm <span className="text-stone text-body-sm font-normal">({unit.areaSqft.toLocaleString("en-IN")} sqft)</span></p>
              </div>
              <div>
                <p className="text-micro text-stone uppercase tracking-micro mb-space-1">Price</p>
                <p className="text-body-md font-medium text-laterite num-tabular">
                  {formatPrice(PROJECT.units[selectedUnit].price)}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <a
                  href={floorPlanImage.url}
                  download="roshan-apartments-floor-plan.webp"
                  onClick={() => trackEvent({ action: "floor_plan_download", category: "FloorPlan", label: "download_webp" })}
                  className={cn(
                    "inline-flex items-center gap-space-2",
                    "px-space-4 py-space-2 rounded-lg",
                    "border border-border-default bg-fog",
                    "text-body-sm text-onyx font-medium",
                    "hover:border-laterite/40 hover:bg-surface-card",
                    "transition-all duration-fast",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2",
                  )}
                >
                  <Download className="w-4 h-4 text-stone" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
          </motion.div>

          {/* ── Room list ────────────────────────────────────────────── */}
          <motion.p
            variants={item}
            transition={fadeUpTransition}
            className="text-body-sm text-stone text-center"
          >
            All units include: 2 Bedrooms · Living & Dining · Kitchen · 2 Bathrooms · Balcony
          </motion.p>
        </motion.div>
      </div>

      {/* ── Full-screen modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={rm ? lightboxReducedVariants : lightboxBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={lightboxTransition}
            className="fixed inset-0 z-modal bg-onyx/96 flex flex-col items-center justify-center p-space-5"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Floor plan full size"
          >
            <button
              ref={modalCloseRef}
              onClick={closeModal}
              aria-label="Close (Esc)"
              className={cn(
                "absolute top-space-5 right-space-5",
                "w-10 h-10 rounded-full glass-dark flex items-center justify-center",
                "hover:bg-ivory/10 transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite",
              )}
            >
              <X className="w-5 h-5 text-ivory" aria-hidden="true" />
            </button>

            <motion.div
              key="fp-modal"
              variants={rm ? lightboxReducedVariants : lightboxImageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={lightboxTransition}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl overflow-hidden bg-surface-card shadow-xl max-w-5xl w-full"
            >
              <Image
                src={floorPlanImage.url}
                alt={floorPlanImage.altText}
                width={floorPlanImage.width}
                height={floorPlanImage.height}
                className="w-full h-auto object-contain max-h-[85vh]"
                quality={95}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
