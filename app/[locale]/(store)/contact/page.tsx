import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/i18n/routing";
import { BasePageProps } from "@/types/page-props";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { STORE_EMAIL, STORE_PHONE, SOCIAL_LINKS } from "@/lib/general/constants";
import { ContactForm } from "@/components/contact/contact-form";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

const ContactPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <main className="pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.25em] text-terracotta">
            {t("label")}
          </p>
          <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-[15px] font-light text-warm-gray">
            {t("description")}
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left - Contact info */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand">
                  <Mail className="size-4.5 text-terracotta" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal">
                    {t("emailLabel")}
                  </p>
                  <a
                    href={`mailto:${STORE_EMAIL}`}
                    className="mt-1 block text-[14px] text-warm-gray transition-colors duration-300 hover:text-terracotta"
                  >
                    {STORE_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand">
                  <Phone className="size-4.5 text-terracotta" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal">
                    {t("phoneLabel")}
                  </p>
                  <a
                    href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                    className="mt-1 block text-[14px] text-warm-gray transition-colors duration-300 hover:text-terracotta"
                  >
                    {STORE_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand">
                  <Clock className="size-4.5 text-terracotta" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal">
                    {t("hoursLabel")}
                  </p>
                  <p className="mt-1 text-[14px] text-warm-gray">
                    {t("hoursValue")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand">
                  <MapPin className="size-4.5 text-terracotta" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal">
                    {t("locationLabel")}
                  </p>
                  <p className="mt-1 text-[14px] text-warm-gray">
                    {t("locationValue")}
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-10 border-t border-border/40 pt-8">
              <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal">
                {t("followUs")}
              </p>
              <div className="flex items-center gap-5">
                {Object.entries(SOCIAL_LINKS).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] capitalize text-warm-gray transition-colors duration-300 hover:text-terracotta"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Contact form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-20">
          <div className="h-[300px] overflow-hidden rounded-sm bg-sand md:h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.1742507256!2d23.7275!3d37.9838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU5JzAxLjciTiAyM8KwNDMnMzkuMCJF!5e0!3m2!1sen!2sgr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nestio Location"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
