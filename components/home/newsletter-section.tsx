"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export function NewsletterSection() {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-charcoal py-14 sm:py-20 md:py-24">
      <div className="mx-auto max-w-xl px-6 text-center lg:px-8">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
          {t("label")}
        </p>
        <h2 className="font-serif text-3xl font-semibold text-cream md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-[14px] font-light leading-relaxed text-cream/60">
          {t("description")}
        </p>

        {submitted ? (
          <div className="mt-10">
            <p className="text-[14px] font-medium text-terracotta">
              {t("success")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 border border-cream/15 bg-transparent px-5 py-3.5 text-[13px] text-cream placeholder:text-cream/30 outline-none transition-colors duration-300 focus:border-terracotta"
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 bg-terracotta px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-terracotta/90"
              >
                <span>{t("button")}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
            <p className="mt-4 text-[11px] text-cream/30">
              {t("privacy")}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
