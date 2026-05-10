import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Precios — Nuclear WMS" },
      {
        name: "description",
        content:
          "Planes Básico, Pro y Enterprise en pesos colombianos. Sin contratos forzados, cancela cuando quieras.",
      },
      { property: "og:title", content: "Precios — Nuclear WMS" },
      { property: "og:description", content: "Planes en COP, claros y sin sorpresas." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main className="pt-12">
        <div className="mx-auto max-w-6xl px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft />
              Volver al inicio
            </Link>
          </Button>
        </div>
        <PricingPreview />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
