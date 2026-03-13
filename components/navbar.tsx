"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { ShoppingCart, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/general/utils";
import { NestioLogo } from "@/components/nestio-logo";
import { MusicPlayer } from "@/components/music-player";

const navLinks = [
  { href: "/products" as const, key: "products" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLocale = () => {
    const next = locale === "en" ? "el" : "en";
    router.replace(pathname, { locale: next });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="transition-opacity duration-300 hover:opacity-70">
          <NestioLogo size="sm" />
        </Link>

        {/* Desktop nav links - minimal, spaced, uppercase */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                "text-[13px] font-medium uppercase tracking-[0.15em] transition-colors duration-300",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLocale}
            className="text-[12px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
            aria-label="Toggle language"
          >
            {locale === "en" ? "EL" : "EN"}
          </button>

          <MusicPlayer />

          <div className="mx-1 h-4 w-px bg-border" />

          <Link href="/cart" className="relative group">
            <ShoppingCart className="size-[18px] text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-terracotta text-[9px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile right actions */}
        <div className="flex items-center gap-2 md:hidden">
          <MusicPlayer />
          <Link href="/cart" className="relative">
            <ShoppingCart className="size-[18px] text-muted-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-terracotta text-[9px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label="Open menu"
              >
                <Menu className="size-5 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 bg-background border-l border-border/40"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  <NestioLogo size="sm" />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-10 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 text-[13px] font-medium uppercase tracking-[0.15em] transition-colors duration-300",
                      pathname === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>

              <div className="mt-8 border-t border-border/40 pt-6 px-4">
                <button
                  onClick={toggleLocale}
                  className="flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <Globe className="size-4" />
                  {locale === "en" ? "Ελληνικά" : "English"}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
