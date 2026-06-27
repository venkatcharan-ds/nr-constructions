"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
  accordionVariants,
  accordionReducedVariants,
  accordionTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { FAQ_ITEMS } from "@/data/faq";

export function FaqSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
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
            eyebrow="FAQ"
            heading="Common Questions"
            subheading="Everything you need to know before booking a site visit."
            align="center"
            prefersReducedMotion={rm}
          />

          <div className="max-w-2xl mx-auto" role="list">
            {FAQ_ITEMS.map((faq, i) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  variants={item}
                  transition={{ ...fadeUpTransition, delay: i * 0.04 }}
                  role="listitem"
                  className={cn(
                    "border-b border-border-default",
                    i === 0 && "border-t",
                  )}
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className={cn(
                      "w-full flex items-center justify-between text-left",
                      "py-space-5 gap-space-4",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-inset",
                      "transition-colors duration-fast",
                    )}
                  >
                    <span
                      className={cn(
                        "text-body-md font-medium",
                        isOpen ? "text-laterite" : "text-onyx",
                      )}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                        "border transition-all duration-fast",
                        isOpen
                          ? "border-laterite bg-laterite text-ivory"
                          : "border-border-default bg-surface-card text-stone",
                      )}
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${faq.id}`}
                        variants={rm ? accordionReducedVariants : accordionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={accordionTransition}
                        className="overflow-hidden"
                      >
                        <p className="text-body-md text-stone pb-space-5 text-pretty">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
