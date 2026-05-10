import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Krevo" },
      {
        name: "description",
        content: "Política de privacidad y tratamiento de datos de Krevo.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Política de Privacidad
        </h1>
        <p className="font-mono mt-2 text-xs uppercase tracking-widest text-muted-foreground">
          Última actualización · 2026-05-09
        </p>
        <div className="prose prose-lg dark:prose-invert mt-10 text-base leading-relaxed text-muted-foreground">
          <p>
            Krevo cumple con la Ley 1581 de 2012 de Colombia y prácticas internacionales de
            protección de datos. Esta sección será reemplazada por el documento legal definitivo
            antes del lanzamiento público.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
