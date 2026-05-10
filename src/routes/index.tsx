import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";
import { RolesSection } from "@/components/marketing/roles-section";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krevo — El cerebro de tu Centro de Distribución" },
      {
        name: "description",
        content:
          "WMS multi-tenant con IA logística para LATAM: FEFO/FIFO, ROP dinámico, Pareto ABC, trazabilidad por lote y operación en tiempo real. Adiós Excel.",
      },
      { property: "og:title", content: "Krevo — El cerebro de tu CEDI" },
      {
        property: "og:description",
        content: "Adiós Excel. Hola control real. WMS multi-tenant con IA logística.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader transparentHero />
      <main>
        <Hero />
        <LogoCloud />
        <BentoFeatures />
        <HowItWorks />
        <InteractiveDemo />
        <RolesSection />
        <ComparisonTable />
        <PricingPreview />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
