import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail, MessageSquare, Phone } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacto — Nuclear WMS" },
      {
        name: "description",
        content:
          "Solicita una demo personalizada de Nuclear WMS. Te respondemos en menos de 24 horas hábiles.",
      },
      { property: "og:title", content: "Contacto — Nuclear WMS" },
      { property: "og:description", content: "Solicita tu demo de Nuclear WMS." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: POST /v1/contact-requests una vez el backend esté listo
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
  };
  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-5xl px-6 py-20">
          <SectionHeading
            eyebrow="Hablemos"
            title={
              <>
                Cuéntanos sobre tu <span className="text-gradient-nuclear">CEDI</span>.
              </>
            }
            description="Te respondemos en menos de 24 horas hábiles, en español y sin formularios eternos."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            {/* Side info */}
            <div className="space-y-4">
              {[
                { icon: Mail, title: "Email", value: "hola@nuclearwms.co" },
                { icon: Phone, title: "Teléfono", value: "+57 (1) 555-0142" },
                { icon: MessageSquare, title: "WhatsApp", value: "+57 300 555 0142" },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-nuclear/10 text-nuclear">
                    <c.icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">{c.title}</p>
                    <p className="font-mono text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form
              className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" placeholder="María Restrepo" required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo corporativo</Label>
                    <Input id="email" type="email" placeholder="maria@empresa.co" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input id="empresa" placeholder="Empresa S.A.S." required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mensaje">¿Qué necesitas resolver?</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Tenemos 3 bodegas y queremos consolidar el inventario en tiempo real…"
                    rows={5}
                  />
                </div>
                <Button type="submit" variant="nuclear" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    "Enviar solicitud"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Al enviar aceptas nuestros{" "}
                  <Link
                    to="/legal/terms"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    términos
                  </Link>{" "}
                  y{" "}
                  <Link
                    to="/legal/privacy"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    política de privacidad
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
