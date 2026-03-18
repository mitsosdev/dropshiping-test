"use client";

import { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/stores/cart-store";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/general/utils";
import { ProductImage } from "@/components/product-image";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const addItem = useCartStore((s) => s.addItem);

  const name = t(`${product.slug}.name`);
  const shortDescription = t(`${product.slug}.shortDescription`);

  return (
    <div className="group">
      {/* Product image - clean, no border radius */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden bg-sand">
          <ProductImage product={product} size="sm" />
          <div className="absolute inset-0 bg-charcoal/0 transition-all duration-300 group-hover:bg-charcoal/5" />
        </div>
      </Link>

      {/* Product info - minimal */}
      <div className="mt-3 space-y-1.5 sm:mt-5 sm:space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-terracotta sm:text-lg">
            {name}
          </h3>
        </Link>

        <p className="hidden line-clamp-2 text-[13px] font-light leading-relaxed text-warm-gray sm:block">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between pt-1.5 sm:pt-3">
          <span className="text-sm font-medium tracking-wide text-foreground sm:text-base">
            {tCommon("currency")}
            {product.price.toFixed(2)}
          </span>

          {product.inStock ? (
            <button
              className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-300 hover:text-terracotta sm:gap-2 sm:text-[12px] sm:tracking-[0.15em]"
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="size-[14px]" />
              {t("addToCart")}
            </button>
          ) : (
            <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
              {t("outOfStock")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
