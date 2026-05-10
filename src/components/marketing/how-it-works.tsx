import { motion } from "framer-motion";
import { Building2, Cog, PackageOpen, Rocket } from "lucide-react";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";

const steps = [
  {
    n: "01",
    icon: Building2,
    title: "Crea tu tenant",
    desc: "Registra tu empresa en menos de 2 minutos. Te asignamos un espacio aislado con tu plan base.",
  },
  {
    n: "02",
    icon: Cog,
    title: "Configura bodegas y SKUs",
    desc: "Importa desde Excel o crea desde cero. Define zonas, racks, niveles y parámetros logísticos.",
  },
  {
    n: "03",
    icon: PackageOpen,
    title: "Opera en tiempo real",
    desc: "Tus operarios usan la PWA, tus gerentes ven el dashboard. Todo sincronizado al instante.",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Optimiza con IA logística",
    desc: "ROP dinámico, ABC automático y alertas FEFO te dicen qué hacer antes de que sea tarde.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-surface-2/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Cómo funciona"
          title={
            <>
              De Excel al control real en <span className="text-gradient-nuclear">4 pasos</span>.
            </>
          }
        />

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="font-mono text-xs text-nuclear">{s.n}</span>
              <s.icon className="mt-4 size-6 text-foreground" strokeWidth={1.5} />
              <h3 className="font-display mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
