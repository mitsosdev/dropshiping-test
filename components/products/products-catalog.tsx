"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAllProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/general/utils";
import { Button } from "@/components/ui/button";

const categories = ["all", "kitchen", "lifestyle", "tech", "organization"] as const;

export function ProductsCatalog() {
  const t = useTranslations("Products");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const allProducts = getAllProducts();
  const filteredProducts =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="mb-6 text-center font-serif text-2xl font-semibold text-charcoal sm:mb-8 sm:text-3xl md:text-4xl">
        {t("title")}
      </h1>

      {/* Category filter tabs */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-300",
              activeCategory === cat
                ? "bg-terracotta text-white hover:bg-terracotta/90"
                : "hover:border-terracotta hover:text-terracotta"
            )}
            onClick={() => setActiveCategory(cat)}
          >
            {t(`categories.${cat}`)}
          </Button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="transition-all duration-300 animate-in fade-in"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No products found in this category.
        </p>
      )}
    </section>
  );
}
