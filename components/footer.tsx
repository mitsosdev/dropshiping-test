"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { getFeaturedProducts } from "@/lib/data/products";
import { Facebook, Instagram } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15Z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");
  const tProducts = useTranslations("Products");
  const products = getFeaturedProducts();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <h3 className="mb-4 text-xl font-bold">Nestio</h3>
            <p className="text-sm text-background/70 leading-relaxed">
              {t("aboutText")}
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("products")}</h3>
            <ul className="space-y-2.5">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                  >
                    {tProducts(`${product.slug}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("support")}</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                >
                  {t("returns")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-background/70 transition-colors duration-300 hover:text-background"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("followUs")}</h3>
            <div className="flex gap-3">
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 transition-colors duration-300 hover:bg-background/20"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 transition-colors duration-300 hover:bg-background/20"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 transition-colors duration-300 hover:bg-background/20"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-background/10 pt-8 text-sm text-background/50 sm:flex-row sm:justify-between">
          <p>&copy; 2026 Nestio. {t("rights")}</p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
