import { useMemo, useState } from "react";
import { Calculator, Search, TrendingUp, Settings2, BarChart3, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/wms-mock";

export function StockPoliciesView() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.toLowerCase().includes(q.toLowerCase()),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight leading-none">
            Políticas de Inventario y Modelos Logísticos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configuración ROP, Modelos Q/P, EOQ Matemático y ABC Dinámico (RF-INV-04 a RF-INV-08).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="mr-2 size-4" /> Recalcular ABC y ROP
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-medium text-sm text-muted-foreground">
            <TrendingUp className="size-4" /> Clasificación ABC Semestral
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Distribución del inventario basada en Rotación y Valor Acumulado.
          </p>
          <div className="flex items-end gap-2">
            <div className="bg-success/20 w-1/3 p-2 rounded text-center border border-success/30">
              <span className="block font-bold text-success">Clase A</span>
              <span className="text-[10px] text-muted-foreground">20% SKUs (80% valor)</span>
            </div>
            <div className="bg-warning/20 w-1/3 p-2 rounded text-center border border-warning/30">
              <span className="block font-bold text-warning">Clase B</span>
              <span className="text-[10px] text-muted-foreground">30% SKUs (15% valor)</span>
            </div>
            <div className="bg-info/20 w-1/3 p-2 rounded text-center border border-info/30">
              <span className="block font-bold text-info">Clase C</span>
              <span className="text-[10px] text-muted-foreground">50% SKUs (5% valor)</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-medium text-sm text-muted-foreground">
            <Settings2 className="size-4" /> Modelos de Reposición (Q/P)
          </div>
          <ul className="text-xs space-y-2 mt-2">
            <li className="flex gap-2">
              <span className="font-semibold text-nuclear w-18 shrink-0">Insumos:</span>{" "}
              Probabilitícos (Modelo Q / P)
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-nuclear w-18 shrink-0">Mat. Prima:</span> Revisión
              Continua (EOQ)
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-nuclear w-18 shrink-0">Pt. Termin:</span> FEFO /
              Bajo Pedido
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-medium text-sm text-muted-foreground">
            <ShieldAlert className="size-4" /> Inventario de Seguridad
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Basado en Desviación Estándar (σ) de la demanda y Nivel de Servicio (Z).
          </p>
          <div className="flex justify-between items-center bg-muted p-2 rounded-lg mt-3">
            <span className="text-xs font-semibold">Nivel de Servicio Z (95%)</span>
            <span className="font-mono text-sm font-bold text-nuclear">1.645</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar SKU para ajustar modelo matemático..."
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoría / Política</th>
                <th className="px-4 py-3 text-center">Clasif. ABC</th>
                <th className="px-4 py-3 text-right">Lead Time (L)</th>
                <th className="px-4 py-3 text-right">Demanda(D)/mes</th>
                <th className="px-4 py-3 text-right">T. Pedir (EOQ)</th>
                <th className="px-4 py-3 text-right">ROP Automat.</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((p) => {
                const isFinished =
                  p.category === "Dulces" ||
                  p.category === "Café Molido" ||
                  p.category === "Café en Grano";
                const leadTime = isFinished ? 2 : p.abc === "A" ? 5 : 15;
                const demanda = Math.floor(Math.random() * 500) + 100;
                const eoq = Math.floor(Math.sqrt((2 * p.cost * demanda) / (p.cost * 0.15)));

                return (
                  <tr key={p.sku} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs truncate max-w-[150px]">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                        {p.category}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {isFinished ? "100% FEFO" : "Mod. Revisión Q"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex font-bold items-center justify-center size-6 rounded-full text-xs ${p.abc === "A" ? "bg-success/20 text-success" : p.abc === "B" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}
                      >
                        {p.abc}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{leadTime} días</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{demanda} un</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-nuclear">
                      {isFinished ? "N/A" : eoq}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-1 bg-surface-2 rounded font-mono font-bold text-xs">
                        {p.rop}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
