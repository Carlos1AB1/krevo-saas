import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Package,
  Loader2,
  ArrowDownToLine,
  Factory,
  Truck,
} from "lucide-react";
import { currentMonthRange, isWithinRange } from "@/lib/date-range";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { getProducts, getLots, getMovements } from "@/features/inventory/inventory.api";
import { getReceipts, getDispatches } from "@/features/logistics/logistics.api";
import { getOrders } from "@/features/production/production.api";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analítica · Krevo" }] }),
  component: () => (
    <RequirePermission action="read" subject="inventory">
      <AnalyticsPage />
    </RequirePermission>
  ),
});

const chartConfig = {
  stock: { label: "Stock", color: "hsl(var(--color-nuclear, 24 95% 53%))" },
  cumulative: { label: "Acumulado %", color: "hsl(var(--destructive))" },
  receipts: { label: "Recepciones", color: "hsl(142 76% 36%)" },
  dispatches: { label: "Despachos", color: "hsl(217 91% 60%)" },
};

interface ParetoItem {
  sku: string;
  name: string;
  stock: number;
  cumulative: number;
  abc: string;
}

function AnalyticsPage() {
  const monthRange = useMemo(() => currentMonthRange(), []);

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["inventory", "products", { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const { data: lotsData } = useQuery({
    queryKey: ["inventory", "lots", { limit: 100, status: "ACTIVE" }],
    queryFn: () => getLots({ limit: 100, status: "ACTIVE" }),
  });

  const { data: movementsData } = useQuery({
    queryKey: ["inventory", "movements", { limit: 200, from: monthRange.from, to: monthRange.to }],
    queryFn: () =>
      getMovements({ limit: 200, from: monthRange.from, to: monthRange.to }),
  });

  const { data: receiptsData } = useQuery({
    queryKey: ["logistics", "receipts", { limit: 100 }],
    queryFn: () => getReceipts({ limit: 100 }),
  });

  const { data: dispatchesData } = useQuery({
    queryKey: ["logistics", "dispatches", { limit: 100 }],
    queryFn: () => getDispatches({ limit: 100 }),
  });

  const { data: completedOrdersData } = useQuery({
    queryKey: ["production", "orders", { status: "COMPLETED", limit: 100 }],
    queryFn: () => getOrders({ status: "COMPLETED", limit: 100 }),
  });

  const products = productsData?.data ?? [];
  const lots = lotsData?.data ?? [];

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    lots.forEach((l) => {
      map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity);
    });
    return map;
  }, [lots]);

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) => {
        const stock = stockByProduct.get(p.id) ?? 0;
        return p.isActive && stock < p.minStock;
      }),
    [products, stockByProduct],
  );

  const receiptsThisMonth = useMemo(
    () =>
      (receiptsData?.data ?? []).filter((r) =>
        isWithinRange(r.createdAt, monthRange.start, monthRange.end),
      ).length,
    [receiptsData, monthRange],
  );

  const dispatchesThisMonth = useMemo(
    () =>
      (dispatchesData?.data ?? []).filter((d) =>
        isWithinRange(d.createdAt, monthRange.start, monthRange.end),
      ).length,
    [dispatchesData, monthRange],
  );

  const completedOrders = useMemo(
    () =>
      (completedOrdersData?.data ?? []).filter((o) => {
        const ref = o.completedAt ?? o.createdAt;
        return isWithinRange(ref, monthRange.start, monthRange.end);
      }).length,
    [completedOrdersData, monthRange],
  );

  const paretoItems: ParetoItem[] = useMemo(() => {
    const sorted = [...products]
      .filter((p) => p.isActive)
      .sort(
        (a, b) =>
          (stockByProduct.get(b.id) ?? 0) - (stockByProduct.get(a.id) ?? 0),
      )
      .slice(0, 8);

    const totalStock = sorted.reduce(
      (s, p) => s + (stockByProduct.get(p.id) ?? 0),
      0,
    );
    let cumulative = 0;

    return sorted.map((p) => {
      const stock = stockByProduct.get(p.id) ?? 0;
      const pct = totalStock > 0 ? Math.round((stock / totalStock) * 100) : 0;
      cumulative += pct;
      return {
        sku: p.sku,
        name: p.name,
        stock,
        cumulative: Math.min(cumulative, 100),
        abc: p.abcClass,
      };
    });
  }, [products, stockByProduct]);

  const activityChart = useMemo(() => {
    const receiptMovements =
      movementsData?.data.filter((m) => m.type === "RECEIPT").length ?? 0;
    const dispatchMovements =
      movementsData?.data.filter((m) => m.type === "DISPATCH").length ?? 0;

    return [
      { label: "Recepciones", receipts: receiptsThisMonth, movements: receiptMovements },
      { label: "Despachos", dispatches: dispatchesThisMonth, movements: dispatchMovements },
      {
        label: "Producción",
        receipts: completedOrders,
        dispatches: 0,
      },
    ];
  }, [movementsData, receiptsThisMonth, dispatchesThisMonth, completedOrders]);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Analítica operativa
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Inventario, logística y producción · datos en tiempo real
          </p>
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
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                  label="Órdenes completadas"
                  value={completedOrders}
                  icon={Factory}
                  hint="GET /production/orders?status=COMPLETED"
                />
                <KpiCard
                  label="Recepciones del mes"
                  value={receiptsThisMonth}
                  icon={ArrowDownToLine}
                  hint={`${(receiptsData?.data ?? []).filter((r) => r.status === "PENDING").length} pendientes de aprobar`}
                />
                <KpiCard
                  label="Despachos del mes"
                  value={dispatchesThisMonth}
                  icon={Truck}
                  hint="Documentos logísticos creados en el mes"
                />
                <KpiCard
                  label="Stock bajo"
                  value={lowStockProducts.length}
                  icon={AlertTriangle}
                  hint={
                    lowStockProducts.length > 0
                      ? lowStockProducts
                          .slice(0, 2)
                          .map((p) => p.sku)
                          .join(", ")
                      : "Todos los SKUs sobre mínimo"
                  }
                />
              </div>

              {lowStockProducts.length > 0 && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-warning">
                      {lowStockProducts.length} producto(s) bajo stock mínimo
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lowStockProducts
                        .map(
                          (p) =>
                            `${p.sku}: ${(stockByProduct.get(p.id) ?? 0).toLocaleString("es-CO")} / mín ${p.minStock}`,
                        )
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                  <h2 className="font-semibold text-base flex items-center gap-2 mb-1">
                    <TrendingUp className="size-4 text-nuclear" /> Actividad del mes
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Recepciones, despachos y órdenes completadas
                  </p>
                  <ChartContainer config={chartConfig} className="h-[220px] w-full aspect-auto">
                    <ComposedChart data={activityChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="receipts" fill="var(--color-receipts)" radius={[4, 4, 0, 0]} name="Recepciones" />
                      <Bar dataKey="dispatches" fill="var(--color-dispatches)" radius={[4, 4, 0, 0]} name="Despachos" />
                    </ComposedChart>
                  </ChartContainer>
                </div>

                {paretoItems.length > 0 && (
                  <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                    <h2 className="font-semibold text-base flex items-center gap-2 mb-1">
                      <BarChart3 className="size-4 text-nuclear" /> Pareto ABC · stock
                    </h2>
                    <p className="text-xs text-muted-foreground mb-4">
                      Top productos por volumen en inventario
                    </p>
                    <ChartContainer config={chartConfig} className="h-[220px] w-full aspect-auto">
                      <ComposedChart data={paretoItems} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="sku" tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tickLine={false} axisLine={false} width={40} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="left" dataKey="stock" fill="var(--color-stock)" radius={[4, 4, 0, 0]} name="Stock" />
                        <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" strokeWidth={2} dot={{ r: 3 }} name="Acumulado %" />
                      </ComposedChart>
                    </ChartContainer>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-4">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Package className="size-4 text-nuclear" /> Catálogo · análisis ABC
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-right">Mínimo</th>
                        <th className="px-4 py-3 text-center">Clase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                            Sin productos. Ejecuta el seed del backend para datos demo.
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => {
                          const stock = stockByProduct.get(p.id) ?? 0;
                          const isLow = stock < p.minStock;
                          return (
                            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                              <td className="px-4 py-3 font-medium">{p.name}</td>
                              <td className={cn("px-4 py-3 text-right font-mono", isLow && "text-warning font-semibold")}>
                                {stock.toLocaleString("es-CO")}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                {p.minStock.toLocaleString("es-CO")}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold font-mono",
                                    p.abcClass === "A"
                                      ? "bg-nuclear/10 text-nuclear"
                                      : p.abcClass === "B"
                                        ? "bg-warning/10 text-warning"
                                        : "bg-muted text-muted-foreground",
                                  )}
                                >
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
