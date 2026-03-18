"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/general/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 30;
const SHIPPING_COST = 3.5;

export function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);

  const t = useTranslations("Cart");
  const tProducts = useTranslations("Products");
  const tCommon = useTranslations("Common");

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold text-foreground">{t("empty")}</h1>
        <p className="max-w-md text-center text-muted-foreground">
          {t("emptyDescription")}
        </p>
        <Button
          asChild
          className="bg-terracotta text-white hover:bg-terracotta/90 transition-colors duration-300"
        >
          <Link href="/products">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:mb-8 sm:text-3xl">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Cart items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-0">
            {items.map((item, index) => {
              const name = tProducts(`${item.product.slug}.name`);
              const image = item.product.images[0];
              const lineTotal = item.product.price * item.quantity;

              return (
                <div key={item.product.id}>
                  <div className="flex items-start gap-3 py-4 sm:items-center sm:gap-4">
                    {/* Product image */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand sm:h-20 sm:w-20">
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold text-foreground transition-colors duration-300 hover:text-terracotta"
                        >
                          {name}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {tCommon("currency")}
                          {item.product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-0 rounded-lg border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors duration-300 hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors duration-300 hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="min-w-[70px] text-right font-semibold text-foreground">
                          {tCommon("currency")}
                          {lineTotal.toFixed(2)}
                        </span>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 -m-1.5 text-muted-foreground transition-colors duration-300 hover:text-red-500"
                          aria-label={t("remove")}
                        >
                          <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              asChild
              className="transition-colors duration-300"
            >
              <Link href="/products">{t("continueShopping")}</Link>
            </Button>
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("subtotal").replace(":", "")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">
                  {tCommon("currency")}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="font-medium">
                  {isFreeShipping
                    ? t("shippingFree")
                    : `${tCommon("currency")}${SHIPPING_COST.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{t("total")}</span>
                <span className="text-lg font-bold text-terracotta">
                  {tCommon("currency")}
                  {total.toFixed(2)}
                </span>
              </div>
              <Button
                asChild
                className="mt-2 w-full bg-terracotta text-white hover:bg-terracotta/90 transition-colors duration-300"
                disabled={items.length === 0}
              >
                <Link href="/checkout">{t("checkout")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
