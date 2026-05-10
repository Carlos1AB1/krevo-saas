import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { FinalCTA } from "@/components/marketing/final-cta";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre Nuclear WMS" },
      {
        name: "description",
        content:
          "Nuclear WMS nació para devolverle el control a las operaciones logísticas de LATAM. Construido en Colombia con estándares globales.",
      },
      { property: "og:title", content: "Sobre Nuclear WMS" },
      {
        property: "og:description",
        content: "Construido en Colombia para empresas que mueven el mundo.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 py-24">
          <SectionHeading
            eyebrow="Manifiesto"
            title={
              <>
                Construido para los que{" "}
                <span className="text-gradient-nuclear">mueven el mundo</span>.
              </>
            }
            description="Nuclear WMS nació de una conversación en una bodega de Bogotá: ¿por qué los WMS son tan caros, tan feos y tan complicados?"
            align="left"
          />
          <div className="prose prose-lg dark:prose-invert mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              Creemos que la logística es la espina dorsal de cualquier economía. Sin embargo,
              quienes la operan trabajan con herramientas hechas para otra época.
            </p>
            <p>
              Nuestra misión es simple:{" "}
              <span className="font-medium text-foreground">
                darle a cada centro de distribución la calidad de software que merece
              </span>
              , al precio que puede pagar, en el idioma que habla y en la moneda que usa.
            </p>
            <p>Hecho en Colombia. Diseñado para LATAM. Construido con estándares globales.</p>
          </div>
        </section>
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
