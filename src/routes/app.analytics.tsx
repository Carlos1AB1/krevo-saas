import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [{ title: "Analítica · Nuclear WMS" }],
  }),
  component: AnalyticsPage,
});

const mockPareto = [
  {
    sku: "CQ-ARE-125",
    name: "Arequipe Sabor a Café x 125g",
    value: 45000000,
    percentage: 35,
    cumulative: 35,
    abc: "A",
  },
  {
    sku: "CQ-GAL-100",
    name: "Galletas con Sabor a Café x 100g",
    value: 30000000,
    percentage: 25,
    cumulative: 60,
    abc: "A",
  },
  {
    sku: "CQ-CUY-ART",
    name: "Cuyabrito Café con Coco 250g",
    value: 15000000,
    percentage: 12,
    cumulative: 72,
    abc: "A",
  },
  {
    sku: "CQ-ARE-500",
    name: "Arequipe Sabor a Café x 500g",
    value: 10000000,
    percentage: 8,
    cumulative: 80,
    abc: "A",
  },
  {
    sku: "CQ-BON-CAF",
    name: "Bombones de Café x 20 und",
    value: 8000000,
    percentage: 6,
    cumulative: 86,
    abc: "B",
  },
  {
    sku: "CQ-CAF-GNO",
    name: "Café Tostado en Grano x 500g",
    value: 6000000,
    percentage: 5,
    cumulative: 91,
    abc: "B",
  },
  {
    sku: "CQ-ARE-250",
    name: "Arequipe Sabor a Café x 250g",
    value: 5000000,
    percentage: 4,
    cumulative: 95,
    abc: "B",
  },
  {
    sku: "CQ-ANC-001",
    name: "Ancheta Puntos de Venta",
    value: 3000000,
    percentage: 3,
    cumulative: 98,
    abc: "C",
  },
];

function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Analítica ABC/Pareto</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Inteligencia logística y reportes de rotación.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              label="Valor Inventario Clase A"
              value={100}
              prefix="$"
              suffix="M COP"
              delta={12.5}
              icon={TrendingUp}
              hint="80% del valor total (20% de SKUs)"
            />
            <KpiCard
              label="Mermas (Últ. Mes)"
              value={1.2}
              prefix="$"
              suffix="M COP"
              delta={-4.1}
              icon={AlertTriangle}
              hint="Principalmente productos perecederos"
            />
            <KpiCard
              label="Rotación Promedio"
              value={14}
              suffix=" Días"
              delta={2}
              icon={BarChart3}
              hint="Mejora de 2 días frente al mes anterior"
            />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4 sm:p-5">
              <h3 className="font-semibold leading-none tracking-tight">Análisis ABC</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Distribución de valor de inventario clasificado por rotación (Pareto).
              </p>
            </div>

            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3 text-right">Valor Movido</th>
                      <th className="px-4 py-3 text-right">% Acumulado</th>
                      <th className="px-4 py-3 text-center">Clasificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {mockPareto.map((item) => (
                      <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-right">${item.value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{item.cumulative}%</span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-nuclear"
                                style={{ width: `${item.cumulative}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold font-mono ${item.abc === "A" ? "bg-nuclear/10 text-nuclear" : item.abc === "B" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}
                          >
                            {item.abc}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
