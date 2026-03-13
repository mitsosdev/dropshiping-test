"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function LifestyleBanner() {
  const t = useTranslations("Hero");

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left - Image */}
        <div className="relative h-[400px] md:h-[500px]">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=960&q=80&auto=format&fit=crop"
            alt="Modern home interior"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right - Content */}
        <div className="flex items-center bg-sand px-8 py-16 md:px-16 md:py-0">
          <div className="max-w-sm">
            <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
              {t("label")}
            </p>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-charcoal md:text-4xl">
              {t("subtitle")}
            </h2>
            <div className="mt-8">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:text-terracotta"
              >
                {t("cta")}
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
