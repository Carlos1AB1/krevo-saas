import { motion } from "framer-motion";
import {
  Boxes,
  Building2,
  ClipboardCheck,
  CreditCard,
  Layers,
  PackageCheck,
  Radio,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";

interface BentoItem {
  title: string;
  description: string;
  icon: LucideIcon;
  span: string;
  tone?: "nuclear" | "reactor" | "plasma";
  visual?: "stacks" | "pulse" | "barcode" | "abc" | "map" | "phone";
}

const items: BentoItem[] = [
  {
    title: "Multi-tenant nativo",
    description:
      "Aislamiento total por tenant_id. Cada empresa tiene su propio universo de datos, usuarios y bodegas.",
    icon: Building2,
    span: "md:col-span-2 md:row-span-2",
    tone: "nuclear",
    visual: "stacks",
  },
  {
    title: "FEFO / FIFO automático",
    description: "Trazabilidad por lote y vencimiento. Adiós producto vencido en bodega.",
    icon: PackageCheck,
    span: "md:col-span-1",
    visual: "barcode",
  },
  {
    title: "ROP dinámico",
    description: "Punto de reorden ajustado al lead time real y nivel de servicio Z.",
    icon: Layers,
    span: "md:col-span-1",
  },
  {
    title: "Pareto / ABC",
    description: "Clasificación automática para enfocar tu energía en lo que mueve el negocio.",
    icon: Boxes,
    span: "md:col-span-2",
    tone: "reactor",
    visual: "abc",
  },
  {
    title: "Tiempo real",
    description: "WebSockets en cada movimiento. Sin F5. Sin sorpresas.",
    icon: Radio,
    span: "md:col-span-1",
    visual: "pulse",
  },
  {
    title: "Mobile-first operario",
    description: "PWA instalable, offline en picking, escáner por cámara.",
    icon: Smartphone,
    span: "md:col-span-1",
    tone: "plasma",
    visual: "phone",
  },
  {
    title: "Pasarela COP",
    description: "ePayco y Wompi listos. Facturación recurrente sin dolor.",
    icon: CreditCard,
    span: "md:col-span-1",
  },
  {
    title: "Auditoría inmutable",
    description: "Cada cambio firmado, fechado y trazable. Tranquilidad regulatoria.",
    icon: ClipboardCheck,
    span: "md:col-span-1",
  },
];

const toneClass: Record<NonNullable<BentoItem["tone"]>, string> = {
  nuclear:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklab,var(--nuclear)_22%,transparent)_0%,transparent_60%)]",
  reactor:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_100%_100%,color-mix(in_oklab,var(--reactor)_28%,transparent)_0%,transparent_60%)]",
  plasma:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--plasma)_28%,transparent)_0%,transparent_60%)]",
};

export function BentoFeatures() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Plataforma"
          title={
            <>
              Una bodega. <span className="text-gradient-nuclear">Mil decisiones.</span> Cero caos.
            </>
          }
          description="Todo lo que un CEDI moderno necesita, integrado de origen y pensado para LATAM."
        />

        <div className="mt-12 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
                "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
                item.tone ? toneClass[item.tone] : "",
                item.span,
              )}
            >
              <div className="relative flex h-full flex-col">
                <span className="grid size-10 place-items-center rounded-lg border border-border bg-background/60 text-nuclear">
                  <item.icon className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                {item.visual ? <BentoVisual kind={item.visual} /> : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoVisual({ kind }: { kind: NonNullable<BentoItem["visual"]> }) {
  if (kind === "stacks") {
    return (
      <div className="relative mt-6 flex-1">
        <div className="font-mono space-y-2 text-xs">
          {["acme.co", "alpina.co", "frigorificos.co", "logix.co"].map((t, i) => (
            <div
              key={t}
              className="flex items-center justify-between rounded-md border border-border bg-background/50 p-2.5"
              style={{ marginLeft: `${i * 14}px` }}
            >
              <span className="text-foreground">{t}</span>
              <span className="text-muted-foreground">tenant_id #{1000 + i}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "barcode") {
    const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1];
    return (
      <div className="mt-5 flex h-16 items-end gap-0.5">
        {widths.map((w, i) => (
          <div key={i} className="bg-foreground" style={{ width: `${w * 3}px`, height: "100%" }} />
        ))}
      </div>
    );
  }
  if (kind === "abc") {
    const bars = [
      { h: 90, l: "A" },
      { h: 75, l: "A" },
      { h: 60, l: "A" },
      { h: 45, l: "B" },
      { h: 38, l: "B" },
      { h: 30, l: "B" },
      { h: 22, l: "C" },
      { h: 18, l: "C" },
      { h: 12, l: "C" },
    ];
    return (
      <div className="mt-6 flex h-28 items-end gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "w-full rounded-sm",
                b.l === "A" && "bg-nuclear",
                b.l === "B" && "bg-reactor",
                b.l === "C" && "bg-muted",
              )}
              style={{ height: `${b.h}%` }}
            />
            <span className="font-mono text-[9px] text-muted-foreground">{b.l}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "pulse") {
    return (
      <div className="mt-5 flex items-center gap-2">
        <span
          className="size-2 rounded-full bg-success"
          style={{ animation: "var(--animate-pulse-live)" }}
        />
        <span className="font-mono text-xs text-muted-foreground">socket.io · 12ms</span>
      </div>
    );
  }
  if (kind === "phone") {
    return (
      <div className="mt-5 flex justify-center">
        <div className="relative h-28 w-16 rounded-xl border-2 border-border bg-background p-1.5">
          <div className="size-full rounded-md bg-gradient-to-br from-nuclear/30 to-plasma/30" />
          <div className="absolute left-1/2 top-1.5 h-1 w-6 -translate-x-1/2 rounded-full bg-border" />
        </div>
      </div>
    );
  }
  return null;
}
