"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/general/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 30;
const SHIPPING_COST = 3.5;

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: "greece" | "cyprus";
}

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const tProducts = useTranslations("Products");
  const tCommon = useTranslations("Common");

  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "greece",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackSuccess, setFallbackSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfo, boolean>>>({});

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ShippingInfo, boolean>> = {};
    if (!shipping.fullName.trim()) newErrors.fullName = true;
    if (!shipping.email.trim() || !shipping.email.includes("@"))
      newErrors.email = true;
    if (!shipping.phone.trim()) newErrors.phone = true;
    if (!shipping.address.trim()) newErrors.address = true;
    if (!shipping.city.trim()) newErrors.city = true;
    if (!shipping.postalCode.trim()) newErrors.postalCode = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            slug: item.product.slug,
            name: tProducts(`${item.product.slug}.name`),
            price: item.product.price,
            quantity: item.quantity,
            cjProductId: item.product.cjProductId || "",
            cjSku: item.product.cjSku || "",
          })),
          shipping,
        }),
      });

      const data = await res.json();

      if (data.fallback) {
        // No Stripe configured - show success message
        setFallbackSuccess(true);
        clearCart();
      } else if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch {
      // Silently handle error
    } finally {
      setIsProcessing(false);
    }
  }

  if (items.length === 0 && !fallbackSuccess) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold text-foreground">
          {tCart("empty")}
        </h1>
        <Button
          asChild
          className="bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
        >
          <Link href="/products">{tCart("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  if (fallbackSuccess) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
          <ShoppingCart className="h-10 w-10 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("successTitle")}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {t("successDescription")}
        </p>
        <p className="text-sm text-muted-foreground">{t("contactOrder")}</p>
        <Button
          asChild
          className="bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
        >
          <Link href="/">{t("backToHome")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">{t("title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Shipping info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("shippingInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName">{t("fullName")}</Label>
                  <Input
                    id="fullName"
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, fullName: e.target.value }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.fullName && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, email: e.target.value }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.email && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, phone: e.target.value }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.phone && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, address: e.target.value }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.address && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, city: e.target.value }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.city && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">{t("postalCode")}</Label>
                  <Input
                    id="postalCode"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        postalCode: e.target.value,
                      }))
                    }
                    className={cn(
                      "mt-1.5 transition-colors duration-300",
                      errors.postalCode && "border-red-500"
                    )}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("country")}</Label>
                  <div className="mt-1.5 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="greece"
                        checked={shipping.country === "greece"}
                        onChange={() =>
                          setShipping((s) => ({ ...s, country: "greece" }))
                        }
                        className="accent-teal-600"
                      />
                      <span>{t("greece")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="cyprus"
                        checked={shipping.country === "cyprus"}
                        onChange={() =>
                          setShipping((s) => ({ ...s, country: "cyprus" }))
                        }
                        className="accent-teal-600"
                      />
                      <span>{t("cyprus")}</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {items.map((item) => {
                  const name = tProducts(`${item.product.slug}.name`);
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {tCommon("currency")}
                        {lineTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tCart("subtotal")}
                  </span>
                  <span className="font-medium">
                    {tCommon("currency")}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tCart("shipping")}
                  </span>
                  <span className="font-medium">
                    {isFreeShipping
                      ? tCart("shippingFree")
                      : `${tCommon("currency")}${SHIPPING_COST.toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{t("total")}</span>
                  <span className="text-lg font-bold text-teal-600">
                    {tCommon("currency")}
                    {total.toFixed(2)}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="mt-2 w-full bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
                  disabled={isProcessing || items.length === 0}
                >
                  {isProcessing
                    ? t("processing")
                    : `${t("pay")} ${tCommon("currency")}${total.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
