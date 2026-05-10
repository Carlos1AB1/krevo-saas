import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { FinalCTA } from "@/components/marketing/final-cta";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Características — Nuclear WMS" },
      {
        name: "description",
        content:
          "Multi-tenant, FEFO/FIFO, ROP dinámico, Pareto ABC, tiempo real, PWA operario y más. Todas las capacidades de Nuclear WMS.",
      },
      { property: "og:title", content: "Características — Nuclear WMS" },
      { property: "og:description", content: "Todo lo que un CEDI moderno necesita, integrado." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main>
        <BentoFeatures />
        <HowItWorks />
        <InteractiveDemo />
        <ComparisonTable />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
