"use client";

import { useTranslations } from "next-intl";
import { CircleIcon } from "@/components/CircleIcon";
import { Truck, ShieldCheck, Lock, Clock } from "lucide-react";

const badges = [
  {
    icon: <Truck className="h-6 w-6" />,
    titleKey: "freeShipping" as const,
    descKey: "freeShippingDesc" as const,
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    titleKey: "guarantee" as const,
    descKey: "guaranteeDesc" as const,
  },
  {
    icon: <Lock className="h-6 w-6" />,
    titleKey: "securePayments" as const,
    descKey: "securePaymentsDesc" as const,
  },
  {
    icon: <Clock className="h-6 w-6" />,
    titleKey: "fastDelivery" as const,
    descKey: "fastDeliveryDesc" as const,
  },
];

export function TrustBadges() {
  const t = useTranslations("Trust");

  return (
    <section className="bg-muted py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.titleKey}
              className="flex flex-col items-center text-center"
            >
              <CircleIcon
                color="#0D9488"
                icon={badge.icon}
                size={56}
              />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {t(badge.titleKey)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(badge.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
