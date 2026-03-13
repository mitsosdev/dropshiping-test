"use client";

import { useTranslations } from "next-intl";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";

export function FeaturedProducts() {
  const t = useTranslations("Products");
  const products = getFeaturedProducts();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
