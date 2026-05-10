import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — Nuclear WMS" },
      { name: "description", content: "Términos de servicio de Nuclear WMS." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Términos y Condiciones
        </h1>
        <p className="font-mono mt-2 text-xs uppercase tracking-widest text-muted-foreground">
          Última actualización · 2026-05-09
        </p>
        <div className="prose prose-lg dark:prose-invert mt-10 text-base leading-relaxed text-muted-foreground">
          <p>
            El uso de Nuclear WMS está sujeto a los términos descritos en este documento. Esta
            sección será reemplazada por el contrato legal definitivo antes del lanzamiento público.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
