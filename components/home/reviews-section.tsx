"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";

const reviews = [
  { key: "review1", rating: 5 },
  { key: "review2", rating: 5 },
  { key: "review3", rating: 5 },
  { key: "review4", rating: 4 },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < count
              ? "fill-terracotta text-terracotta"
              : "fill-none text-warm-gray/30"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const t = useTranslations("Reviews");

  return (
    <section className="py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header - editorial style matching FeaturedProducts */}
        <div className="mb-10 sm:mb-16 text-center">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
            {t("label")}
          </p>
          <div className="mx-auto h-px w-12 bg-border" />
          <h2 className="mt-6 font-serif text-3xl font-semibold text-charcoal md:text-4xl">
            {t("title")}
          </h2>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reviews.map(({ key, rating }) => (
            <div
              key={key}
              className="group relative rounded-sm border border-border/40 bg-cream p-5 sm:p-8 transition-all duration-300 hover:border-terracotta/20 hover:shadow-sm"
            >
              <Quote className="absolute right-4 top-4 size-6 text-sand sm:right-6 sm:top-6 sm:size-8" strokeWidth={1} />

              <Stars count={rating} />

              <p className="mt-5 text-[15px] font-light leading-relaxed text-charcoal/80">
                &ldquo;{t(`${key}.text`)}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-sand text-[13px] font-medium text-charcoal">
                  {t(`${key}.name`).charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-charcoal">
                    {t(`${key}.name`)}
                  </p>
                  <p className="text-[11px] text-warm-gray">
                    {t(`${key}.location`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
