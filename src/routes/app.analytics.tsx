import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BarChart3, TrendingUp, AlertTriangle, Package, Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { cn } from "@/lib/utils";
import { getProducts } from "@/features/inventory/inventory.api";
import { getLots } from "@/features/inventory/inventory.api";
import { getMovements } from "@/features/inventory/inventory.api";
import { getReceipts } from "@/features/logistics/logistics.api";
import { differenceInDays, parseISO, startOfMonth } from "date-fns";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analítica · Krevo" }] }),
  component: AnalyticsPage,
});

// ── Pareto Chart (keeps the visual, data from real products+lots) ────────────

interface ParetoItem {
  sku: string;
  name: string;
  totalStock: number;
  percentage: number;
  cumulative: number;
  abc: string;
}

function ParetoChart({ items }: { items: ParetoItem[] }) {
  if (items.length === 0) return null;
  const chartHeight = 210;
  const paddingLeft = 45;
  const paddingRight = 65;
  const paddingTop = 25;
  const maxVal = items[0].totalStock;
  const totalItems = items.length;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
          <BarChart3 className="size-4 text-nuclear" /> Curva de Pareto · Análisis ABC por Stock Actual
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Top {Math.min(totalItems, 8)} productos ordenados por stock total. Clase A = mayor volumen en inventario.
        </p>
      </div>
      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 800 280" className="w-full h-auto select-none overflow-visible">
          <defs>
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-nuclear, #f97316)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--color-nuclear, #f97316)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="var(--color-nuclear, #f97316)" />
            </linearGradient>
          </defs>
          {[0, 20, 40, 60, 80, 100].map((pct, idx) => {
            const y = paddingTop + ((100 - pct) / 100) * (chartHeight - paddingTop);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={800 - paddingRight} y2={y}
                  stroke="currentColor" strokeOpacity={pct === 80 ? "0.2" : "0.07"} strokeWidth="1" strokeDasharray={pct === 80 ? "0" : "4 4"} />
                <text x={paddingLeft - 10} y={y + 4} className="fill-muted-foreground text-[10px] font-mono" textAnchor="end">{pct}%</text>
              </g>
            );
          })}
          {(() => {
            const y80 = paddingTop + ((100 - 80) / 100) * (chartHeight - paddingTop);
            return (
              <g>
                <line x1={paddingLeft} y1={y80} x2={800 - paddingRight} y2={y80} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 3" />
                <text x={800 - paddingRight + 8} y={y80 + 3.5} className="fill-destructive text-[10px] font-bold" textAnchor="start">Umbral 80%</text>
              </g>
            );
          })()}
          {(() => {
            const chartWidth = 800 - paddingLeft - paddingRight;
            const barWidth = (chartWidth / totalItems) * 0.45;
            const gap = (chartWidth / totalItems) * 0.55;
            const points = items.map((item, idx) => {
              const x = paddingLeft + idx * (barWidth + gap) + (barWidth / 2) + (gap / 2);
              const barHeight = maxVal > 0 ? (item.totalStock / maxVal) * (chartHeight - paddingTop) : 0;
              const barY = chartHeight - barHeight;
              const lineY = paddingTop + ((100 - item.cumulative) / 100) * (chartHeight - paddingTop);
              return { x, barY, barHeight, lineY, barX: x - barWidth / 2, ...item };
            });
            const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.lineY}`).join(" ");
            return (
              <>
                {points.map((p, idx) => (
                  <g key={idx} className="group/bar cursor-pointer">
                    <rect x={p.barX} y={p.barY} width={barWidth} height={p.barHeight}
                      fill="url(#bar-gradient)" rx="3"
                      className="transition-all duration-300 group-hover/bar:fill-nuclear" />
                    <text x={p.x} y={p.barY - 6} className="fill-foreground text-[9px] font-bold font-mono opacity-0 group-hover/bar:opacity-100 transition-opacity" textAnchor="middle">
                      {p.totalStock.toLocaleString("es-CO")}
                    </text>
                    <text x={p.x} y={chartHeight + 15} className="fill-foreground text-[10px] font-semibold" textAnchor="middle">
                      {p.sku.length > 8 ? p.sku.slice(0, 8) : p.sku}
                    </text>
                    <text x={p.x} y={chartHeight + 28}
                      className={cn("text-[9px] font-bold font-mono", p.abc === "A" ? "fill-nuclear" : p.abc === "B" ? "fill-warning" : "fill-muted-foreground")}
                      textAnchor="middle">Zona {p.abc}</text>
                  </g>
                ))}
                <path d={pathData} fill="none" stroke="url(#line-gradient)" strokeWidth="3" className="stroke-nuclear" />
                {points.map((p, idx) => (
                  <g key={`pt-${idx}`} className="group/pt cursor-pointer">
                    <circle cx={p.x} cy={p.lineY} r="5" className="fill-background stroke-nuclear stroke-[3]" />
                    <text x={p.x} y={p.lineY - 11} className="fill-foreground text-[10px] font-extrabold font-mono" textAnchor="middle">
                      {p.cumulative}%
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

function AnalyticsPage() {
  const firstOfMonth = startOfMonth(new Date()).toISOString();

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["inventory", "products", { limit: 100}],
    queryFn: () => getProducts({ limit: 100}),
  });

  const { data: lotsData } = useQuery({
    queryKey: ["inventory", "lots", { limit: 100, status: "ACTIVE" }],
    queryFn: () => getLots({ limit: 100, status: "ACTIVE" }),
  });

  const { data: receiptsData } = useQuery({
    queryKey: ["inventory", "movements", { type: "RECEIPT", limit: 200, from: firstOfMonth }],
    queryFn: () => getMovements({ type: "RECEIPT", limit: 200, from: firstOfMonth }),
  });

  const { data: dispatchData } = useQuery({
    queryKey: ["inventory", "movements", { type: "DISPATCH", limit: 200, from: firstOfMonth }],
    queryFn: () => getMovements({ type: "DISPATCH", limit: 200, from: firstOfMonth }),
  });

  const { data: receiptsLogData } = useQuery({
    queryKey: ["logistics", "receipts", { limit: 100 }],
    queryFn: () => getReceipts({ limit: 100 }),
  });

  const products = productsData?.data ?? [];
  const lots = lotsData?.data ?? [];

  // Stock per product
  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    lots.forEach((l) => {
      map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity);
    });
    return map;
  }, [lots]);

  // Lots expiring in ≤ 30 days
  const expiringLots = useMemo(() =>
    lots.filter((l) => {
      if (!l.expirationDate) return false;
      const d = differenceInDays(parseISO(l.expirationDate), new Date());
      return d >= 0 && d <= 30;
    }), [lots]);

  // ABC data for Pareto (sort: A > B > C, then by stock desc within each class)
  const paretoItems: ParetoItem[] = useMemo(() => {
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
      return { sku: p.sku, name: p.name, totalStock: ts, percentage: pct, cumulative: Math.min(cumulative, 100), abc: p.abcClass };
    });
  }, [products, stockByProduct]);

  const activeProducts = products.filter((p) => p.isActive).length;
  const classA = products.filter((p) => p.abcClass === "A").length;
  const receiptCount = receiptsData?.total ?? 0;
  const dispatchCount = dispatchData?.total ?? 0;

  // Summary KPIs
  const pendingReceipts = (receiptsLogData?.data ?? []).filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Analítica ABC / Pareto</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Inteligencia logística · datos en tiempo real</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">

          {loadingProducts ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Calculando analítica…
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard label="SKUs Activos" value={activeProducts} icon={Package}
                  hint={`${classA} clase A · ${products.length - activeProducts} inactivos`} />
                <KpiCard label="Lotes Activos" value={lots.length} icon={BarChart3}
                  hint={`${expiringLots.length} vencen en ≤ 30 días`} />
                <KpiCard label="Entradas este mes" value={receiptCount} icon={ArrowDownToLine}
                  delta={pendingReceipts > 0 ? undefined : undefined}
                  hint={`${pendingReceipts} recepciones pendientes de aprobar`} />
                <KpiCard label="Salidas este mes" value={dispatchCount} icon={ArrowUpFromLine}
                  hint="Movimientos DISPATCH del mes en curso" />
              </div>

              {/* Expiring Lots Alert */}
              {expiringLots.length > 0 && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-warning">{expiringLots.length} lote(s) próximos a vencer</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {expiringLots.slice(0, 3).map((l) => `${l.product.sku} · Lote ${l.lotNumber}`).join(" · ")}
                      {expiringLots.length > 3 && ` · +${expiringLots.length - 3} más`}
                    </p>
                  </div>
                </div>
              )}

              {/* Pareto Chart */}
              {paretoItems.length > 0 && <ParetoChart items={paretoItems} />}

              {/* ABC Table */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-4">
                  <h2 className="text-base font-semibold">Análisis ABC · Catálogo de Productos</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Clasificación de valor por volumen de stock actual.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Stock Actual</th>
                        <th className="px-4 py-3 text-right">Lotes</th>
                        <th className="px-4 py-3 text-center">Clase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {products.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Sin productos registrados.</td></tr>
                      ) : (
                        [...products]
                          .sort((a, b) => {
                            const order: Record<string, number> = { A: 0, B: 1, C: 2 };
                            return (order[a.abcClass] ?? 3) - (order[b.abcClass] ?? 3);
                          })
                          .map((p) => {
                            const stock = stockByProduct.get(p.id) ?? 0;
                            const lotCount = lots.filter((l) => l.productId === p.id).length;
                            return (
                              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                                <td className="px-4 py-3 font-medium">{p.name}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{p.category?.name ?? "—"}</td>
                                <td className="px-4 py-3 text-right font-mono">{stock.toLocaleString("es-CO")}</td>
                                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{lotCount}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold font-mono",
                                    p.abcClass === "A" ? "bg-nuclear/10 text-nuclear" :
                                    p.abcClass === "B" ? "bg-warning/10 text-warning" :
                                    "bg-muted text-muted-foreground")}>
                                    {p.abcClass}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
