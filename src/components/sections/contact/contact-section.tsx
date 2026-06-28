"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Phone,
  Mail,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  fadeUpTransition,
} from "@/lib/motion/variants";
import { SectionHeader } from "@/components/ui/section-header";
import { COMPANY } from "@/data/company";
import { submitSiteVisit } from "@/lib/actions/submit-site-visit";
import { detectDevice } from "@/lib/db/attribution";
import { trackEvent } from "@/components/analytics/google-analytics";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  preferred_date: z.string().optional(),
  message: z.string().max(500).optional(),
  website: z.literal("").optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getMaxDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

function whatsAppUrl(msg: string): string {
  return `https://wa.me/${COMPANY.contact.whatsapp.number}?text=${encodeURIComponent(msg)}`;
}

// ── Contact link card ─────────────────────────────────────────────────────────

function ContactCard({
  href,
  external,
  icon: Icon,
  label,
  value,
  trackLabel,
}: {
  href: string;
  external?: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  trackLabel?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={() => trackLabel && trackEvent({ action: "contact_click", category: "Contact", label: trackLabel })}
      className={cn(
        "flex items-center gap-space-4 p-space-5 rounded-xl",
        "border border-ivory/10 bg-ivory/5",
        "hover:border-laterite/40 hover:bg-ivory/10",
        "transition-all duration-fast group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-deep-water",
      )}
    >
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-laterite/20 group-hover:bg-laterite/30 transition-colors duration-fast shrink-0">
        <Icon className="w-5 h-5 text-laterite" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-micro text-stone uppercase tracking-micro mb-0.5">{label}</p>
        <p className="text-body-md font-medium text-ivory truncate">{value}</p>
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ContactSection() {
  const rm = useReducedMotion();
  const item = rm ? fadeUpReducedVariants : fadeUpVariants;
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();

      const result = await submitSiteVisit({
        name: values.name,
        phone: values.phone,
        message: values.message ?? undefined,
        preferred_date: values.preferred_date ?? null,
        page_url: typeof window !== "undefined" ? window.location.href : null,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
        user_agent: ua,
        device_type: detectDevice(ua),
      });

      if (!result.success) throw new Error(result.error);
      setSubmitted(true);
      trackEvent({ action: "site_visit_booked", category: "Contact", label: "contact_form" });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-deep-water py-space-9 md:py-space-10"
    >
      <div className="container-site">
        <div className="lg:grid lg:grid-cols-2 lg:gap-space-10 items-start">

          {/* ── Left: contact info ──────────────────────────────────── */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <SectionHeader
              eyebrow="Book a Site Visit"
              heading="Talk to Us Directly"
              subheading="No automated replies. When you call or message, you speak to the builder."
              light
              prefersReducedMotion={rm}
            />

            <div className="space-y-space-3">
              <ContactCard
                href={COMPANY.contact.phone.primaryTel}
                icon={Phone}
                label="Call Us"
                value={COMPANY.contact.phone.primaryFormatted}
                trackLabel="phone_primary"
              />
              <ContactCard
                href={COMPANY.contact.phone.secondaryTel}
                icon={Phone}
                label="Alternate"
                value={COMPANY.contact.phone.secondaryFormatted}
                trackLabel="phone_secondary"
              />
              <ContactCard
                href={`mailto:${COMPANY.contact.email}`}
                icon={Mail}
                label="Email"
                value={COMPANY.contact.email}
                trackLabel="email"
              />
              <ContactCard
                href={whatsAppUrl(COMPANY.contact.whatsapp.defaultMessage)}
                external
                icon={MessageCircle}
                label="WhatsApp"
                value="Chat instantly"
                trackLabel="whatsapp"
              />
            </div>

            {/* Address */}
            <motion.div
              variants={item}
              transition={{ ...fadeUpTransition, delay: 0.3 }}
              className="mt-space-5 flex items-start gap-space-3 p-space-4 rounded-xl border border-ivory/10 bg-ivory/5"
            >
              <MapPin className="w-4 h-4 text-laterite shrink-0 mt-0.5" aria-hidden="true" />
              <address className="not-italic text-body-sm text-stone">
                {COMPANY.contact.address.line1}<br />
                {COMPANY.contact.address.line2}<br />
                {COMPANY.contact.address.city} – {COMPANY.contact.address.pincode}
              </address>
            </motion.div>
          </motion.div>

          {/* ── Right: booking form ─────────────────────────────────── */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-space-9 lg:mt-0"
          >
            <div className="p-space-7 rounded-2xl border border-ivory/10 bg-ivory/5">
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ──────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center py-space-9 gap-space-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle2 className="w-14 h-14 text-success" aria-hidden="true" />
                    </motion.div>
                    <div>
                      <h3 className="font-display text-heading-3 text-ivory mb-space-2">
                        Thank you!
                      </h3>
                      <p className="text-body-md text-stone">
                        We&apos;ll be in touch shortly to confirm your site visit.
                      </p>
                    </div>
                    <p className="text-body-sm text-stone/60">
                      Or call us now at{" "}
                      <a
                        href={COMPANY.contact.phone.primaryTel}
                        className="text-laterite hover:text-laterite-light transition-colors"
                      >
                        {COMPANY.contact.phone.primaryFormatted}
                      </a>
                    </p>
                  </motion.div>
                ) : (
                  /* ── Form ───────────────────────────────────────── */
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-label tracking-label uppercase text-laterite mb-space-6">
                      Request a Site Visit
                    </p>

                    {/* Name */}
                    <div className="mb-space-5">
                      <label htmlFor="contact-name" className="block text-body-sm text-stone mb-space-2">
                        Your Name <span className="text-laterite" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        aria-required="true"
                        aria-describedby={errors.name ? "name-err" : undefined}
                        {...register("name")}
                        placeholder="Full name"
                        className={cn(
                          "w-full px-space-4 py-space-3 rounded-lg",
                          "bg-ivory/5 border text-ivory placeholder:text-stone/40",
                          "focus:outline-none focus:ring-2 focus:ring-laterite",
                          "transition-all duration-fast text-body-sm",
                          errors.name ? "border-error" : "border-ivory/15",
                        )}
                      />
                      {errors.name && (
                        <p id="name-err" role="alert" className="mt-space-2 text-micro text-error">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mb-space-5">
                      <label htmlFor="contact-phone" className="block text-body-sm text-stone mb-space-2">
                        Mobile Number <span className="text-laterite" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        aria-required="true"
                        aria-describedby={errors.phone ? "phone-err" : undefined}
                        {...register("phone")}
                        placeholder="10-digit mobile number"
                        className={cn(
                          "w-full px-space-4 py-space-3 rounded-lg",
                          "bg-ivory/5 border text-ivory placeholder:text-stone/40",
                          "focus:outline-none focus:ring-2 focus:ring-laterite",
                          "transition-all duration-fast text-body-sm num-tabular",
                          errors.phone ? "border-error" : "border-ivory/15",
                        )}
                      />
                      {errors.phone && (
                        <p id="phone-err" role="alert" className="mt-space-2 text-micro text-error">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Preferred date */}
                    <div className="mb-space-5">
                      <label htmlFor="contact-date" className="block text-body-sm text-stone mb-space-2">
                        Preferred Visit Date <span className="text-stone/50">(optional)</span>
                      </label>
                      <input
                        id="contact-date"
                        type="date"
                        min={getTomorrowDate()}
                        max={getMaxDate()}
                        {...register("preferred_date")}
                        className={cn(
                          "w-full px-space-4 py-space-3 rounded-lg",
                          "bg-ivory/5 border border-ivory/15 text-ivory",
                          "focus:outline-none focus:ring-2 focus:ring-laterite",
                          "transition-all duration-fast text-body-sm num-tabular",
                          "[color-scheme:dark]",
                        )}
                      />
                    </div>

                    {/* Message */}
                    <div className="mb-space-6">
                      <label htmlFor="contact-message" className="block text-body-sm text-stone mb-space-2">
                        Message <span className="text-stone/50">(optional)</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows={3}
                        {...register("message")}
                        placeholder="Any questions or preferred visit time…"
                        className={cn(
                          "w-full px-space-4 py-space-3 rounded-lg resize-none",
                          "bg-ivory/5 border border-ivory/15 text-ivory placeholder:text-stone/40",
                          "focus:outline-none focus:ring-2 focus:ring-laterite",
                          "transition-all duration-fast text-body-sm",
                        )}
                      />
                    </div>

                    {/* Honeypot — hidden from humans, bots fill it */}
                    <div aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 overflow-hidden">
                      <label htmlFor="contact-website">Website</label>
                      <input
                        id="contact-website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        {...register("website")}
                      />
                    </div>

                    {serverError && (
                      <p role="alert" className="mb-space-4 text-body-sm text-error">
                        {serverError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-space-3",
                        "px-space-6 py-space-4 rounded-md",
                        "bg-laterite text-ivory",
                        "text-label tracking-label uppercase font-medium",
                        "shadow-accent transition-all duration-fast",
                        "hover:bg-laterite-dark hover:shadow-lg",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laterite focus-visible:ring-offset-2 focus-visible:ring-offset-deep-water",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                          Book a Site Visit
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
