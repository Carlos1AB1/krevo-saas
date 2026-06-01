import { motion } from "framer-motion";
import {
  Boxes, AlertTriangle, TrendingUp, Truck, ArrowRight, Activity,
  Loader2, ArrowDownToLine, Package,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getProducts, getLots, getMovements } from "@/features/inventory/inventory.api";
import { getReceipts, getDispatches } from "@/features/logistics/logistics.api";
import { useAuth } from "@/features/auth/AuthProvider";
import { differenceInDays, parseISO, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

// ── Pareto Chart (real data) ──────────────────────────────────────────────────

interface ParetoItem { sku: string; value: number; cum: number; abc: string }

function ParetoChart({ data }: { data: ParetoItem[] }) {
  const W = 760;
  const H = 220;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const padR = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = innerW / data.length - 8;

  const linePts = data.map((d, i) => ({
    x: padL + i * (innerW / data.length) + innerW / data.length / 2,
    y: padT + innerH - (d.cum / 100) * innerH,
  }));
  const linePath = linePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full min-w-[640px]">
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padT + innerH - (g / 100) * innerH;
          return (
            <g key={g}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="2 4" />
              <text x={6} y={y + 3} className="fill-muted-foreground font-mono text-[9px]">{g}%</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * innerH * 0.9;
          const x = padL + i * (innerW / data.length) + 4;
          const y = padT + innerH - h;
          const cls = d.abc === "A" ? "fill-nuclear" : d.abc === "B" ? "fill-reactor" : "fill-muted-foreground/40";
          return (
            <g key={d.sku}>
              <rect x={x} y={y} width={barW} height={h} rx={3} className={cls} />
              <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                {d.sku.length > 8 ? d.sku.slice(0, 8) : d.sku}
              </text>
            </g>
          );
        })}
        <path d={linePath} fill="none" className="stroke-plasma" strokeWidth={2} />
        {linePts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-plasma" />
        ))}
      </svg>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Legend({ dot, label, outline }: { dot: string; label: string; outline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={"size-2 rounded-full " + (outline ? `border border-plasma ${dot}/0` : dot)} />
      {label}
    </span>
  );
}

function PulseItem({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
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

// ── Main Component ────────────────────────────────────────────────────────────

export function DashboardContent() {
  const { user } = useAuth();
  const firstOfMonth = useMemo(() => startOfMonth(new Date()).toISOString(), []);

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const { data: lotsData } = useQuery({
    queryKey: ["inventory", "lots", { limit: 100, status: "ACTIVE" }],
    queryFn: () => getLots({ limit: 100, status: "ACTIVE" }),
  });

  const { data: receiptMovData } = useQuery({
    queryKey: ["inventory", "movements", { type: "RECEIPT", limit: 1, from: firstOfMonth }],
    queryFn: () => getMovements({ type: "RECEIPT", limit: 1, from: firstOfMonth }),
  });

  const { data: adjustData } = useQuery({
    queryKey: ["inventory", "movements", { type: "ADJUSTMENT", limit: 1, from: firstOfMonth }],
    queryFn: () => getMovements({ type: "ADJUSTMENT", limit: 1, from: firstOfMonth }),
  });

  const { data: pendingReceiptsData } = useQuery({
    queryKey: ["logistics", "receipts", { status: "PENDING", limit: 1 }],
    queryFn: () => getReceipts({ status: "PENDING", limit: 1 }),
  });

  const { data: pendingDispatchesData } = useQuery({
    queryKey: ["logistics", "dispatches", { status: "PENDING", limit: 1 }],
    queryFn: () => getDispatches({ status: "PENDING", limit: 1 }),
  });

  const products = productsData?.data ?? [];
  const lots = lotsData?.data ?? [];

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    lots.forEach((l) => map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity));
    return map;
  }, [lots]);

  const totalUnits = useMemo(() => lots.reduce((s, l) => s + l.quantity, 0), [lots]);

  const fefoAlerts = useMemo(() =>
    lots
      .filter((l) => {
        if (!l.expirationDate) return false;
        const d = differenceInDays(parseISO(l.expirationDate), new Date());
        return d >= 0 && d <= 30;
      })
      .sort((a, b) => parseISO(a.expirationDate!).getTime() - parseISO(b.expirationDate!).getTime())
      .slice(0, 4),
    [lots]);

  const ropAlerts = useMemo(() =>
    products
      .filter((p) => p.isActive && p.minStock > 0 && (stockByProduct.get(p.id) ?? 0) < p.minStock)
      .map((p) => ({ ...p, stock: stockByProduct.get(p.id) ?? 0 }))
      .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock))
      .slice(0, 5),
    [products, stockByProduct]);

  const paretoData: ParetoItem[] = useMemo(() => {
    const classOrder: Record<string, number> = { A: 0, B: 1, C: 2 };
    const sorted = [...products]
      .sort((a, b) => {
        const co = classOrder[a.abcClass] - classOrder[b.abcClass];
        if (co !== 0) return co;
        return (stockByProduct.get(b.id) ?? 0) - (stockByProduct.get(a.id) ?? 0);
      })
      .slice(0, 8);
    const totalStock = sorted.reduce((s, p) => s + (stockByProduct.get(p.id) ?? 0), 0);
    let cumulative = 0;
    return sorted.map((p) => {
      const ts = stockByProduct.get(p.id) ?? 0;
      const pct = totalStock > 0 ? Math.round((ts / totalStock) * 100) : 0;
      cumulative += pct;
      return { sku: p.sku, value: pct, cum: Math.min(cumulative, 100), abc: p.abcClass };
    });
  }, [products, stockByProduct]);

  const activeProducts = products.filter((p) => p.isActive).length;
  const receiptMovCount = receiptMovData?.total ?? 0;
  const criticalAlerts = fefoAlerts.length + ropAlerts.length;
  const pendingReceipts = pendingReceiptsData?.total ?? 0;
  const pendingDispatches = pendingDispatchesData?.total ?? 0;
  const adjustCount = adjustData?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Centro de Distribución
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {greet()}, {user?.firstName ?? "…"}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esto es lo que está pasando hoy en tu CEDI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge label="Datos en tiempo real" />
          <Link to="/app/analytics" className="text-xs font-semibold text-nuclear hover:underline">
            Ver analítica completa →
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard tone="nuclear" label="Unidades en stock" value={totalUnits} icon={Boxes}
          hint={`${lots.length} lotes activos`} />
        <KpiCard tone="reactor" label="SKUs activos" value={activeProducts} icon={Package}
          hint={`${products.length} productos en catálogo`} />
        <KpiCard tone="plasma" label="Entradas este mes" value={receiptMovCount} icon={ArrowDownToLine}
          hint={`${pendingReceipts} recepciones pendientes`} />
        <KpiCard tone="default" label="Alertas críticas" value={criticalAlerts} icon={AlertTriangle}
          hint={`${fefoAlerts.length} FEFO · ${ropAlerts.length} bajo ROP`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pareto */}
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
                El 20% de tus SKUs concentra el 80% del stock
              </h2>
            </div>
            <Link to="/app/analytics" className="text-xs font-semibold text-nuclear hover:underline">
              Ver completo →
            </Link>
          </div>
          {paretoData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Cargando datos…
            </div>
          ) : (
            <ParetoChart data={paretoData} />
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Legend dot="bg-nuclear" label="Clase A · mayor volumen" />
            <Legend dot="bg-reactor" label="Clase B · volumen medio" />
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
          {fefoAlerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin lotes próximos a vencer.</p>
          ) : (
            <ul className="space-y-2">
              {fefoAlerts.map((a) => {
                const days = differenceInDays(parseISO(a.expirationDate!), new Date());
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-2.5 transition-colors hover:bg-accent">
                    <span className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-bold",
                      days <= 7 ? "bg-destructive/15 text-destructive" :
                      days <= 14 ? "bg-warning/15 text-warning" :
                      "bg-info/15 text-info"
                    )}>
                      {days}d
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{a.product.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {a.product.sku} · {a.lotNumber} · {a.quantity.toLocaleString("es-CO")} un
                      </p>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>
      </div>

      {/* ROP + Pulso */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:col-span-2"
        >
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Punto de reorden (ROP)
            </p>
            <h2 className="mt-1 font-display text-base font-semibold tracking-tight">
              SKUs por debajo del stock mínimo
            </h2>
          </div>
          {ropAlerts.length === 0 ? (
            <div className="rounded-lg border border-border py-8 text-center text-sm text-muted-foreground">
              Todos los SKUs están sobre el stock mínimo.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                    <th className="px-3 py-2 text-right">Mínimo</th>
                    <th className="px-3 py-2 text-right">Cobertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ropAlerts.map((r) => {
                    const cov = r.minStock > 0 ? ((r.stock / r.minStock) * 100).toFixed(0) : "0";
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-accent/50">
                        <td className="px-3 py-2 font-mono text-xs">{r.sku}</td>
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2 text-right font-mono text-destructive">{r.stock.toLocaleString("es-CO")}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.minStock.toLocaleString("es-CO")}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="ml-auto flex max-w-[140px] items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                              <div className="h-full rounded-full bg-destructive" style={{ width: `${Math.min(100, Number(cov))}%` }} />
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">{cov}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
            <PulseItem icon={TrendingUp} label="Recepciones pendientes" value={`${pendingReceipts} por aprobar`} />
            <PulseItem icon={Truck} label="Despachos pendientes" value={`${pendingDispatches} por aprobar`} />
            <PulseItem icon={Activity} label="Ajustes este mes" value={`${adjustCount} movimientos`} />
            <PulseItem icon={AlertTriangle} label="Alertas ROP" value={`${ropAlerts.length} SKUs bajo mínimo`} />
          </ul>
        </motion.section>
      </div>
    </div>
  );
}
