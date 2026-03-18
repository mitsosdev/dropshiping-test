"use client";

import { useTranslations } from "next-intl";
import { Gem, Leaf, Heart } from "lucide-react";

const highlights = [
  { icon: Gem, key: "curated" },
  { icon: Leaf, key: "quality" },
  { icon: Heart, key: "care" },
] as const;

export function WhyNestio() {
  const t = useTranslations("WhyNestio");

  return (
    <section className="border-t border-border/40 py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left - Heading */}
          <div>
            <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
              {t("label")}
            </p>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-charcoal md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-[15px] font-light leading-relaxed text-warm-gray">
              {t("description")}
            </p>
          </div>

          {/* Right - Highlight cards */}
          <div className="space-y-8">
            {highlights.map(({ icon: Icon, key }) => (
              <div key={key} className="flex gap-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand">
                  <Icon className="size-5 text-terracotta" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-charcoal">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-1 text-[13px] font-light leading-relaxed text-warm-gray">
                    {t(`${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
