import { motion } from "framer-motion";
import { Boxes, AlertTriangle, TrendingUp, Truck, Clock, ArrowRight, Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";

const fefoAlerts = [
  { sku: "SKU-0451", name: "Acetaminofén 500mg", lot: "L-2031", days: 7, qty: 480 },
  { sku: "SKU-0892", name: "Yogur Natural 1L", lot: "L-7712", days: 12, qty: 96 },
  { sku: "SKU-1207", name: "Vacuna Antigripal", lot: "L-3340", days: 18, qty: 240 },
  { sku: "SKU-0334", name: "Leche Deslactosada", lot: "L-9921", days: 22, qty: 720 },
];

const ropAlerts = [
  { sku: "SKU-0118", name: "Detergente Premium 3L", stock: 24, rop: 80 },
  { sku: "SKU-2204", name: "Café Premium 500g", stock: 12, rop: 50 },
  { sku: "SKU-3001", name: "Toalla absorbente 6un", stock: 5, rop: 40 },
];

// ABC Pareto data — top 8 SKUs
const paretoData = [
  { sku: "SKU-0451", value: 28, cum: 28 },
  { sku: "SKU-0892", value: 18, cum: 46 },
  { sku: "SKU-1207", value: 14, cum: 60 },
  { sku: "SKU-0334", value: 10, cum: 70 },
  { sku: "SKU-0118", value: 8, cum: 78 },
  { sku: "SKU-2204", value: 6, cum: 84 },
  { sku: "SKU-3001", value: 5, cum: 89 },
  { sku: "SKU-0099", value: 4, cum: 93 },
];

export function DashboardContent() {
  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Centro de Distribución · Bogotá Norte
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Buenos días, Carlos.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esto es lo que está pasando hoy en tu CEDI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge label="Sincronizado · 12s" />
          <Button variant="outline" size="sm" asChild>
            <Link to="/app">Ver reporte</Link>
          </Button>
          <Button variant="nuclear" size="sm">
            <Activity className="size-4" />
            Iniciar conteo cíclico
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          tone="nuclear"
          label="Inventario activo"
          value={184230}
          delta={3.4}
          icon={Boxes}
          hint="Unidades en piso"
        />
        <KpiCard
          tone="reactor"
          label="OTIF (7d)"
          value={97.8}
          suffix="%"
          format={(n) => n.toFixed(1)}
          delta={1.2}
          icon={Truck}
          hint="On-Time In-Full"
        />
        <KpiCard
          tone="plasma"
          label="Tiempo medio recepción"
          value={14.2}
          suffix=" min"
          format={(n) => n.toFixed(1)}
          delta={-8.5}
          icon={Clock}
          hint="Por orden de compra"
        />
        <KpiCard
          tone="default"
          label="Alertas críticas"
          value={9}
          icon={AlertTriangle}
          hint="FEFO + ROP combinados"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pareto/ABC */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:col-span-2"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Análisis Pareto · ABC
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">
                El 20% de tus SKUs explica el 80% de los movimientos
              </h2>
            </div>
            <Link to="/app" className="text-xs font-semibold text-nuclear hover:underline">
              Ver completo →
            </Link>
          </div>
          <ParetoChart data={paretoData} />
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Legend dot="bg-nuclear" label="Clase A · top movers" />
            <Legend dot="bg-reactor" label="Clase B · medio" />
            <Legend dot="bg-muted-foreground/40" label="Clase C · cola larga" />
            <Legend dot="bg-plasma" label="% acumulado" outline />
          </div>
        </motion.section>

        {/* FEFO Alerts */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Alertas FEFO
              </p>
              <h2 className="mt-1 font-display text-base font-semibold tracking-tight">
                Lotes próximos a vencer
              </h2>
            </div>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
              {fefoAlerts.length} lotes
            </span>
          </div>
          <ul className="space-y-2">
            {fefoAlerts.map((a) => (
              <li
                key={a.lot}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-2.5 transition-colors hover:bg-accent"
              >
                <span
                  className={
                    "grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-bold " +
                    (a.days <= 7
                      ? "bg-destructive/15 text-destructive"
                      : a.days <= 14
                        ? "bg-warning/15 text-warning"
                        : "bg-info/15 text-info")
                  }
                >
                  {a.days}d
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {a.sku} · {a.lot} · {a.qty} un
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {/* ROP + Ops */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Punto de reorden (ROP)
              </p>
              <h2 className="mt-1 font-display text-base font-semibold tracking-tight">
                SKUs por debajo del umbral dinámico
              </h2>
            </div>
            <Button variant="outline" size="sm">
              Generar OC sugerida
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">ROP</th>
                  <th className="px-3 py-2 text-right">Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ropAlerts.map((r) => {
                  const cov = ((r.stock / r.rop) * 100).toFixed(0);
                  return (
                    <tr key={r.sku} className="transition-colors hover:bg-accent/50">
                      <td className="px-3 py-2 font-mono text-xs">{r.sku}</td>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-right font-mono text-destructive">{r.stock}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        {r.rop}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="ml-auto flex max-w-[140px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-destructive"
                              style={{ width: `${Math.min(100, Number(cov))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {cov}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Operación de hoy
          </p>
          <h2 className="mt-1 font-display text-base font-semibold tracking-tight">
            Pulso del CEDI
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <PulseItem
              icon={TrendingUp}
              label="Recepciones programadas"
              value="7 OCs · 312 cajas"
            />
            <PulseItem icon={Truck} label="Despachos en ruta" value="14 órdenes · OTIF 97%" />
            <PulseItem icon={Activity} label="Operarios activos" value="12 / 18" />
            <PulseItem icon={AlertTriangle} label="Discrepancias abiertas" value="2 · revisar" />
          </ul>
        </motion.section>
      </div>
    </div>
  );
}

function Legend({ dot, label, outline }: { dot: string; label: string; outline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={"size-2 rounded-full " + (outline ? `border border-plasma ${dot}/0` : dot)}
      />
      {label}
    </span>
  );
}

function PulseItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background/60 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </li>
  );
}

function ParetoChart({ data }: { data: typeof paretoData }) {
  const W = 760;
  const H = 220;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const padR = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value));
  const barW = innerW / data.length - 8;

  const linePts = data.map((d, i) => {
    const x = padL + i * (innerW / data.length) + innerW / data.length / 2;
    const y = padT + innerH - (d.cum / 100) * innerH;
    return { x, y };
  });

  const linePath = linePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full min-w-[640px]">
        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padT + innerH - (g / 100) * innerH;
          return (
            <g key={g}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="2 4"
              />
              <text x={6} y={y + 3} className="fill-muted-foreground font-mono text-[9px]">
                {g}%
              </text>
            </g>
          );
        })}

        {/* bars */}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH * 0.9;
          const x = padL + i * (innerW / data.length) + 4;
          const y = padT + innerH - h;
          const cls = i < 2 ? "fill-nuclear" : i < 5 ? "fill-reactor" : "fill-muted-foreground/40";
          return (
            <g key={d.sku}>
              <rect x={x} y={y} width={barW} height={h} rx={3} className={cls} />
              <text
                x={x + barW / 2}
                y={H - padB + 14}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {d.sku.replace("SKU-", "")}
              </text>
            </g>
          );
        })}

        {/* cum line */}
        <path d={linePath} fill="none" className="stroke-plasma" strokeWidth={2} />
        {linePts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-plasma" />
        ))}
      </svg>
    </div>
  );
}
