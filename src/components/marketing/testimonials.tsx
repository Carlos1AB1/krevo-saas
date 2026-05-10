import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";

const testimonials = [
  {
    quote: "Reducimos un 38% el producto vencido en bodega. El FEFO de Nuclear lo cambió todo.",
    name: "María Fernanda Restrepo",
    role: "Gerente de Operaciones · Alimentos del Valle",
  },
  {
    quote: "Por fin tenemos una sola fuente de verdad. Mis cuatro bodegas hablan el mismo idioma.",
    name: "Carlos Andrés Gómez",
    role: "COO · Logística Andina",
  },
  {
    quote: "Los operarios lo aprendieron en 15 minutos. Eso ya dice todo del producto.",
    name: "Diana Patricia Vargas",
    role: "Supervisora CEDI Norte · Frigoríficos del Norte",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Voces del piso"
          title={
            <>
              Lo que dicen quienes <span className="text-gradient-nuclear">lo viven</span>.
            </>
          }
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <Quote className="size-6 text-nuclear/60" strokeWidth={1.5} />
              <blockquote className="mt-4 flex-1 text-base text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
