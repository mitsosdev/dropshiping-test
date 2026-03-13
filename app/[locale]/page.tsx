import { setRequestLocale } from "next-intl/server";
import { BasePageProps } from "@/types/page-props";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TrustBadges } from "@/components/home/trust-badges";
import Footer from "@/components/footer";

const Home = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <TrustBadges />
      <Footer />
    </main>
  );
};

export default Home;
