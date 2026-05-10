import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { cn } from "@/lib/utils";

const plans: {
  name: string;
  price: string;
  period: string;
  pitch: string;
  features: string[];
  cta: string;
  popular?: boolean;
}[] = [
  {
    name: "Básico",
    price: "$ 149.000",
    period: "COP / mes",
    pitch: "Para una bodega que arranca el control real.",
    features: ["1 bodega · 3 usuarios", "Hasta 1.000 SKUs", "FEFO/FIFO + Kárdex", "Soporte email"],
    cta: "Empezar con el plan Básico",
  },
  {
    name: "Pro",
    price: "$ 449.000",
    period: "COP / mes",
    pitch: "Para empresas en crecimiento que necesitan IA logística.",
    features: [
      "Hasta 5 bodegas · 25 usuarios",
      "SKUs ilimitados",
      "ROP dinámico + Pareto ABC",
      "Tiempo real + WebSockets",
      "PWA operario",
      "Soporte prioritario",
    ],
    cta: "Empezar 14 días gratis",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "A medida",
    period: "Hablemos",
    pitch: "Para operaciones que no pueden parar.",
    features: [
      "Bodegas y usuarios ilimitados",
      "SLA 99.95%",
      "SSO / SAML",
      "Onboarding dedicado",
      "Cloud privado opcional",
    ],
    cta: "Contactar ventas",
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Precios en COP"
          title={
            <>
              Paga por lo que <span className="text-gradient-nuclear">realmente usas</span>.
            </>
          }
          description="Sin sorpresas. Sin contratos forzados. Cancela cuando quieras."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.name}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border bg-card p-7 shadow-[var(--shadow-soft)] transition-all",
                p.popular
                  ? "border-nuclear shadow-[var(--shadow-nuclear)] lg:-translate-y-3 lg:scale-[1.02]"
                  : "border-border hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
              )}
            >
              {p.popular ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--nuclear) 18%, transparent) 0%, transparent 60%)",
                  }}
                />
              ) : null}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  {p.popular ? (
                    <span className="font-mono rounded-full bg-plasma px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-plasma-foreground">
                      Más popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.pitch}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {p.price}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-nuclear" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button
                    asChild
                    variant={p.popular ? "plasma" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    <Link to={p.name === "Enterprise" ? "/contact" : "/register"}>{p.cta}</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
