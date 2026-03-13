"use client";

import { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/stores/cart-store";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/general/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  UtensilsCrossed,
  Lamp,
  Zap,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  kitchen: <UtensilsCrossed className="h-12 w-12" />,
  lifestyle: <Lamp className="h-12 w-12" />,
  tech: <Zap className="h-12 w-12" />,
  home: <Package className="h-12 w-12" />,
};

const categoryGradients: Record<string, string> = {
  kitchen: "from-teal-500/80 to-teal-700/80",
  lifestyle: "from-orange-400/80 to-teal-500/80",
  tech: "from-teal-400/80 to-orange-500/80",
  home: "from-orange-500/80 to-teal-600/80",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const addItem = useCartStore((s) => s.addItem);

  const name = t(`${product.slug}.name`);
  const shortDescription = t(`${product.slug}.shortDescription`);
  const icon = categoryIcons[product.category] ?? <Package className="h-12 w-12" />;
  const gradient = categoryGradients[product.category] ?? "from-teal-500/80 to-orange-500/80";

  return (
    <Card
      className={cn(
        "group overflow-hidden border border-border/50 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg"
      )}
    >
      {/* Image placeholder area */}
      <Link href={`/products/${product.slug}`}>
        <div
          className={cn(
            "relative flex h-56 items-center justify-center bg-linear-to-br",
            gradient
          )}
        >
          <div className="text-white/90 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-orange-500 text-white hover:bg-orange-600">
              {t("featured")}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-col gap-3 p-5">
        <Link href={`/products/${product.slug}`} className="group/link">
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground transition-colors duration-300 group-hover/link:text-teal-600">
            {name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-teal-600">
            {tCommon("currency")}
            {product.price.toFixed(2)}
          </span>

          {product.inStock ? (
            <Button
              size="sm"
              className="bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              {t("addToCart")}
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              {t("outOfStock")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
