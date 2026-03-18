"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="min-h-[80vh] sm:min-h-[85vh] flex items-stretch overflow-hidden">
      {/* Left - Content on solid cream */}
      <div className="flex w-full items-center bg-cream px-5 py-16 sm:px-6 sm:py-20 md:w-1/2 lg:px-16">
        <div className="mx-auto max-w-lg">
          {/* Small label */}
          <p className="mb-6 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
            {t("label")}
          </p>

          {/* Main heading - large serif */}
          <h1 className="font-serif text-[2.25rem] font-semibold leading-[1.1] text-charcoal sm:text-5xl md:text-6xl lg:text-7xl">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-md text-base font-normal leading-relaxed text-charcoal/70">
            {t("subtitle")}
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border-b-2 border-charcoal pb-2 text-[13px] font-medium uppercase tracking-[0.2em] text-charcoal transition-all duration-300 hover:border-terracotta hover:text-terracotta"
            >
              {t("cta")}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Decorative line */}
          <div className="mt-16 h-px w-24 bg-terracotta/40" />
        </div>
      </div>

      {/* Right - Full image, no overlay */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
