import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api";

interface ApiPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingInterval: string;
  maxUsers: number | null;
  maxProducts: number | null;
  features: Record<string, unknown> | null;
}

interface PlanDisplay {
  name: string;
  price: string;
  period: string;
  pitch: string;
  features: string[];
  cta: string;
  to: "/register" | "/contact";
  popular?: boolean;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getPeriod(interval: string, currency: string): string {
  if (currency !== "COP") return `/ ${interval.toLowerCase()}`;
  return interval === "YEARLY" ? "COP / año" : "COP / mes";
}

function getFeatures(plan: ApiPlan): string[] {
  if (!plan.features) return [];
  const f = plan.features as Record<string, unknown>;
  if (Array.isArray(f.items)) return f.items as string[];
  return [];
}

function mapPlan(plan: ApiPlan): PlanDisplay {
  const code = plan.code.toLowerCase();
  const isEnterprise = code === "enterprise";
  return {
    name: plan.name,
    price: isEnterprise ? "A medida" : formatPrice(plan.priceCents, plan.currency),
    period: isEnterprise ? "Hablemos" : getPeriod(plan.billingInterval, plan.currency),
    pitch: plan.description ?? "",
    features: getFeatures(plan),
    cta: isEnterprise ? "Contactar ventas" : "Empezar 14 días gratis",
    to: isEnterprise ? "/contact" : "/register",
    popular: code === "pro",
  };
}

export function PricingPreview() {
  const [plans, setPlans] = useState<PlanDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/billing/plans"))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch plans");
        return res.json();
      })
      .then((data: ApiPlan[]) => setPlans(data.map(mapPlan)))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-7"
              >
                <div className="mb-4 h-5 w-24 rounded bg-muted" />
                <div className="mb-6 h-4 w-48 rounded bg-muted" />
                <div className="mb-6 h-10 w-32 rounded bg-muted" />
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 w-full rounded bg-muted" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                      <Link to={p.to}>{p.cta}</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
