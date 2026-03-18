"use client";

import { useTranslations } from "next-intl";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";

export function FeaturedProducts() {
  const t = useTranslations("Products");
  const products = getFeaturedProducts();

  return (
    <section className="py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header - editorial style */}
        <div className="mb-10 sm:mb-16 text-center">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
            {t("title")}
          </p>
          <div className="mx-auto h-px w-12 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
