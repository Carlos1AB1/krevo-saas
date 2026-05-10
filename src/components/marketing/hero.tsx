import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";
import { AnimatedNumber } from "@/components/nuclear-ui/animated-number";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[120vh]"
        style={{ backgroundImage: "var(--gradient-nuclear)" }}
      />
      <div
        aria-hidden
        className="bg-grid-nuclear pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />
      {/* Conic orbit */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-20%] -z-10 size-[700px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ backgroundImage: "var(--gradient-reactor)", animation: "var(--animate-orbit)" }}
      />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <LiveBadge label="Reactor online · LATAM · COP" tone="success" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mx-auto mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-[5.25rem]"
        >
          El cerebro de tu <span className="text-gradient-nuclear">Centro de Distribución</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          WMS multi-tenant con IA logística. FEFO/FIFO, ROP dinámico, Pareto ABC y trazabilidad por
          lote — todo en tiempo real, listo para gerentes y operarios.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild variant="nuclear" size="xl">
            <Link to="/register">
              Empezar gratis
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/contact">
              <Sparkles className="text-nuclear" />
              Ver demo en 2 min
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-mono mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Sin tarjeta · 14 días Pro · Cancela cuando quieras
        </motion.p>

        {/* Dashboard mock flotante */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div
            aria-hidden
            className="absolute inset-x-10 -bottom-8 h-32 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, var(--nuclear) 40%, transparent), transparent)",
            }}
          />
          <DashboardMock />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const sparkline = [4, 9, 6, 12, 8, 14, 11, 18, 15, 22, 19, 26];
  const max = Math.max(...sparkline);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-4 shadow-[var(--shadow-elevated)] backdrop-blur sm:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <span className="font-mono ml-3 text-xs text-muted-foreground">
            app.nuclearwms.co/dashboard
          </span>
        </div>
        <LiveBadge label="LIVE" />
      </div>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Rotación", v: 8.4, s: "x", f: (n: number) => n.toFixed(1) },
          { l: "Servicio", v: 97.2, s: "%", f: (n: number) => n.toFixed(1) },
          { l: "Ocupación", v: 73, s: "%" },
          { l: "Alertas", v: 12 },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-border bg-background/60 p-3 text-left">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</p>
            <p className="font-display mt-1 text-2xl font-semibold tracking-tight">
              <AnimatedNumber value={k.v} suffix={k.s} format={k.f} />
            </p>
          </div>
        ))}
      </div>

      {/* Chart + side */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Movimientos · últimas 12 semanas
            </p>
            <span className="font-mono text-[10px] text-nuclear">+24.3%</span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-1.5">
            {sparkline.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${(v / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-sm bg-gradient-to-t from-nuclear/60 to-reactor"
              />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Alertas FEFO</p>
          <ul className="space-y-2 text-left text-xs">
            {[
              { sku: "SKU-0042", lote: "L-2418", days: 4, tone: "destructive" },
              { sku: "SKU-0117", lote: "L-2421", days: 9, tone: "warning" },
              { sku: "SKU-0089", lote: "L-2430", days: 21, tone: "info" },
            ].map((a) => (
              <li
                key={a.sku}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2"
              >
                <div>
                  <p className="font-mono text-foreground">{a.sku}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{a.lote}</p>
                </div>
                <span
                  className={
                    a.tone === "destructive"
                      ? "rounded-full bg-destructive/10 px-2 py-0.5 text-destructive"
                      : a.tone === "warning"
                        ? "rounded-full bg-warning/10 px-2 py-0.5 text-warning"
                        : "rounded-full bg-info/10 px-2 py-0.5 text-info"
                  }
                >
                  {a.days}d
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
