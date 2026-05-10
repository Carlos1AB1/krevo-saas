import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [{ title: "Analítica · Krevo" }],
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

function ParetoChart() {
  const chartHeight = 210;
  const paddingLeft = 45;
  const paddingRight = 65;
  const paddingTop = 25;

  const totalItems = mockPareto.length;
  const maxVal = mockPareto[0].value;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
          <BarChart3 className="size-4 text-nuclear" /> Curva de Pareto (Análisis ABC 80/20)
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Visualización de la acumulación del valor del inventario. El 80% del valor total reside en los primeros 4 artículos (Zona A).
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
            <filter id="shadow-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map((percent, idx) => {
            const y = paddingTop + ((100 - percent) / 100) * (chartHeight - paddingTop);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={800 - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.07"
                  strokeWidth="1"
                  strokeDasharray={percent === 80 ? "0" : "4 4"}
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  className="fill-muted-foreground text-[10px] font-mono text-right"
                  textAnchor="end"
                >
                  {percent}%
                </text>
              </g>
            );
          })}

          {/* Pareto 80% Threshold Line */}
          {(() => {
            const y80 = paddingTop + ((100 - 80) / 100) * (chartHeight - paddingTop);
            return (
              <g>
                <line
                  x1={paddingLeft}
                  y1={y80}
                  x2={800 - paddingRight}
                  y2={y80}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={800 - paddingRight + 8}
                  y={y80 + 3.5}
                  className="fill-destructive text-[10px] font-bold"
                  textAnchor="start"
                >
                  Umbral 80% (Ley de Pareto)
                </text>
              </g>
            );
          })()}

          {/* Render columns and point connectors */}
          {(() => {
            const chartWidth = 800 - paddingLeft - paddingRight;
            const barWidth = (chartWidth / totalItems) * 0.45;
            const gap = (chartWidth / totalItems) * 0.55;

            const points = mockPareto.map((item, idx) => {
              const x = paddingLeft + idx * (barWidth + gap) + (barWidth / 2) + (gap / 2);
              const barHeight = (item.value / maxVal) * (chartHeight - paddingTop);
              const barY = chartHeight - barHeight;
              const lineY = paddingTop + ((100 - item.cumulative) / 100) * (chartHeight - paddingTop);
              return { x, barY, barHeight, lineY, barX: x - barWidth / 2, ...item };
            });

            const pathData = points
              .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.lineY}`)
              .join(" ");

            return (
              <>
                {/* Bars */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/bar cursor-pointer">
                    <rect
                      x={p.barX}
                      y={p.barY}
                      width={barWidth}
                      height={p.barHeight}
                      fill="url(#bar-gradient)"
                      rx="3"
                      className="transition-all duration-300 group-hover/bar:fill-nuclear"
                    />
                    <text
                      x={p.x}
                      y={p.barY - 6}
                      className="fill-foreground text-[9px] font-bold font-mono opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300"
                      textAnchor="middle"
                    >
                      ${(p.value / 1000000).toFixed(1)}M
                    </text>
                    <text
                      x={p.x}
                      y={chartHeight + 15}
                      className="fill-foreground text-[10px] font-semibold"
                      textAnchor="middle"
                    >
                      {p.sku.replace("CQ-", "")}
                    </text>
                    <text
                      x={p.x}
                      y={chartHeight + 28}
                      className={cn(
                        "text-[9px] font-bold font-mono",
                        p.abc === "A" ? "fill-nuclear" : p.abc === "B" ? "fill-warning" : "fill-muted-foreground"
                      )}
                      textAnchor="middle"
                    >
                      Zona {p.abc}
                    </text>
                  </g>
                ))}

                {/* Cumulative Percentage Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="url(#line-gradient)"
                  strokeWidth="3"
                  filter="url(#shadow-glow)"
                  className="stroke-nuclear"
                />

                {/* Interactive Points on Line */}
                {points.map((p, idx) => (
                  <g key={`point-${idx}`} className="group/pt cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.lineY}
                      r="5"
                      className="fill-background stroke-nuclear stroke-[3] group-hover/pt:r-7 transition-all duration-300"
                    />
                    <text
                      x={p.x}
                      y={p.lineY - 11}
                      className="fill-foreground text-[10px] font-extrabold font-mono opacity-100 group-hover/pt:text-nuclear"
                      textAnchor="middle"
                    >
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

function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Analítica ABC/Pareto</h1>
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

          {/* Pareto Chart Section */}
          <ParetoChart />

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4 sm:p-5">
              <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">Análisis ABC</h2>
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
