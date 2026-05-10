import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  /** Texto del eyebrow, ej. "Acceso operativo" */
  eyebrow?: string;
  /** Variante visual del panel lateral */
  side?: "nuclear" | "reactor" | "plasma";
}

const sideContent = {
  nuclear: {
    title: "El cerebro de tu CEDI, en una sola pantalla.",
    subtitle:
      "Inventario en tiempo real, FEFO/FIFO automático y trazabilidad por lote. Sin Excel, sin sorpresas.",
  },
  reactor: {
    title: "Bienvenido de vuelta, operador.",
    subtitle:
      "Tu turno empieza con KPIs vivos: SLA de despacho, ABC del mes y alertas de quiebre antes que ocurran.",
  },
  plasma: {
    title: "Cada segundo cuenta cuando tu inventario respira.",
    subtitle:
      "Recibe, ubica y despacha con escáner. Nuclear convierte 200 SKUs en una operación tranquila.",
  },
};

export function AuthShell({ children, eyebrow, side = "nuclear" }: AuthShellProps) {
  const copy = sideContent[side];
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Background ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-nuclear opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--gradient-nuclear)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 size-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: "var(--gradient-reactor)" }}
      />

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Visual side */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 bg-foreground/[0.02] p-10 lg:flex">
          <Link to="/" className="relative z-10 flex items-center">
            <NuclearLogo withWordmark />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-md space-y-6"
          >
            <LiveBadge label="Operación en vivo · LATAM" tone="nuclear" />
            <h2 className="font-display text-balance text-4xl font-semibold leading-tight tracking-tight">
              <span className="text-gradient-nuclear">{copy.title}</span>
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              {copy.subtitle}
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                { icon: ShieldCheck, text: "Multi-tenant con aislamiento por organización" },
                { icon: Zap, text: "FEFO / FIFO / ROP dinámico sin tocar Excel" },
                { icon: Sparkles, text: "IA logística para sugerir rotación y reposición" },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/60 text-foreground shadow-soft">
                    <f.icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-foreground/90">{f.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <p className="relative z-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Krevo · Hecho con orgullo en LATAM
          </p>
        </aside>

        {/* Form side */}
        <main className="flex w-full items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center lg:hidden"
              aria-label="Ir al inicio"
            >
              <NuclearLogo withWordmark />
            </Link>

            {eyebrow ? (
              <span
                className={cn(
                  "mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-foreground/[0.02] px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground",
                )}
              >
                <span className="size-1.5 rounded-full bg-[var(--nuclear)]" />
                {eyebrow}
              </span>
            ) : null}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
