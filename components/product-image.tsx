"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/general/utils";
import { Product } from "@/types/product";
import { Package, UtensilsCrossed, Lamp, Zap, LayoutGrid, Heart } from "lucide-react";

const categoryIcons = {
  kitchen: UtensilsCrossed,
  lifestyle: Lamp,
  tech: Zap,
  organization: LayoutGrid,
  home: Package,
  wellness: Heart,
} as const;

const sizeConfig = {
  sm: { container: "h-56", icon: "h-10 w-10" },
  md: { container: "h-72", icon: "h-14 w-14" },
  lg: { container: "aspect-square", icon: "h-16 w-16 sm:h-20 sm:w-20" },
} as const;

interface ProductImageProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductImage({
  product,
  size = "sm",
  className,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);

  const imageSrc = product.images?.[0];
  const hasImage = !!imageSrc && !imgError;
  const IconComponent = categoryIcons[product.category] ?? Package;
  const { container, icon } = sizeConfig[size];

  if (hasImage) {
    return (
      <div className={cn("relative overflow-hidden bg-sand", container, className)}>
        <Image
          src={imageSrc}
          alt={product.slug}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          sizes={
            size === "lg"
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
      </div>
    );
  }

  // Minimal placeholder with warm sand background
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-sand",
        container,
        className
      )}
    >
      <div className="text-warm-gray/40 transition-transform duration-300 group-hover:scale-110">
        <IconComponent className={icon} strokeWidth={1} />
      </div>
    </div>
  );
}
