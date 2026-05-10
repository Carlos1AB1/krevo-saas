import { useMemo, useState } from "react";
import { Calculator, Search, TrendingUp, Settings2, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { products } from "@/lib/wms-mock";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function StockPoliciesView() {
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState<"all" | "insumo" | "terminado">("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.toLowerCase().includes(q.toLowerCase());

      const isFinished =
        p.category === "Dulces" ||
        p.category === "Café Molido" ||
        p.category === "Café en Grano";

      if (filterType === "insumo") {
        return matchesSearch && !isFinished;
      }
      if (filterType === "terminado") {
        return matchesSearch && isFinished;
      }
      return matchesSearch;
    });
  }, [q, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight leading-none text-foreground">
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
              Probabilísticos (Modelo Q / P)
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

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Label htmlFor="search-policies-sku" className="sr-only">
            Buscar SKU para ajustar modelo matemático
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-policies-sku"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar SKU para ajustar modelo matemático..."
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
              filterType === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType("insumo")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
              filterType === "insumo"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Insumos (Modelo Q/P)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("terminado")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
              filterType === "terminado"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Prod. Terminado (FEFO)
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
              <tr>
                <th className="px-4 py-3">SKU / Nombre</th>
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
              {filtered.map((p: any) => {
                const isFinished =
                  p.category === "Dulces" ||
                  p.category === "Café Molido" ||
                  p.category === "Café en Grano" ||
                  p.category === "Producto Terminado";
                const isModelP = !isFinished && (p.abc === "B" || p.abc === "C");
                const leadTime = p.leadTimeL || 0;
                const demandaAnual = p.demandaAnual || 0;
                const cp = p.costoPedidoCp || 0;
                const h = p.costoMantenimientoH || 0;
                const eoq = (cp > 0 && h > 0 && demandaAnual > 0) ? Math.floor(Math.sqrt((2 * cp * demandaAnual) / h)) : 0;
                
                const periodoP = (demandaAnual > 0) ? Math.max(1, Math.round((eoq / demandaAnual) * 312)) : 0;
                const dDiaria = demandaAnual / 312;
                const nivelObjetivoT = Math.round(dDiaria * (periodoP + leadTime) + (p.rop * 0.8));

                return (
                  <tr key={p.sku} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs truncate max-w-[150px]">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium">
                        {p.category}
                      </span>
                      <p className={cn(
                        "text-[10px] mt-1 font-semibold",
                        isFinished ? "text-nuclear" : isModelP ? "text-warning" : "text-info"
                      )}>
                        {isFinished ? "100% Rotativo FEFO" : isModelP ? "Mod. P (Periódico)" : "Mod. Q (Continuo)"}
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
                    <td className="px-4 py-3 text-right font-mono text-xs">{demandaAnual} un/año</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                      {isFinished ? (
                        <span className="text-muted-foreground italic text-[11px]">No Aplica (FEFO)</span>
                      ) : isModelP ? (
                        <span className="text-warning">{periodoP} días (P)</span>
                      ) : (
                        <span className="text-info">{eoq} un (Q*)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isFinished ? (
                         <span className="px-2 py-1 bg-surface-2 rounded font-mono font-bold text-xs text-muted-foreground">-</span>
                      ) : isModelP ? (
                         <span className="px-2 py-1 bg-warning/10 text-warning rounded font-mono font-bold text-xs" title="Nivel Objetivo (T)">
                           {nivelObjetivoT} (T)
                         </span>
                      ) : (
                         <span className="px-2 py-1 bg-info/10 text-info rounded font-mono font-bold text-xs" title="Punto de Reorden (ROP)">
                           {p.rop} (ROP)
                         </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => setSelectedProduct({ ...p, leadTime, demandaAnual, cp, h, eoq, isFinished, isModelP, periodoP, nivelObjetivoT })}
                      >
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

      <Sheet open={!!selectedProduct} onOpenChange={(v) => !v && setSelectedProduct(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedProduct && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selectedProduct.sku}</p>
                <SheetTitle className="font-display text-xl text-foreground">{selectedProduct.name}</SheetTitle>
                <SheetDescription>
                  Parámetros de política y parametrización matemática logístico (RF-INV-08)
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Categorization Alert */}
                {selectedProduct.isFinished ? (
                  <div className="rounded-lg border border-nuclear/30 bg-nuclear/5 p-4 border-l-4 border-l-nuclear">
                    <h3 className="text-sm font-semibold text-nuclear mb-1 flex items-center gap-2">
                      <ShieldCheck className="size-4" /> Política: FEFO Rotativo (Producto Terminado)
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este artículo es un **Producto Terminado** (perecedero o de rotación rápida). Para mitigar riesgos de caducidad en el café o arequipe, el sistema bloquea modelos probabilísticos Q/P y aplica una política de picking basada estrictamente en **FEFO (First Expired, First Out)**.
                    </p>
                  </div>
                ) : selectedProduct.isModelP ? (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 border-l-4 border-l-warning">
                    <h3 className="text-sm font-semibold text-warning mb-1 flex items-center gap-2">
                      <Settings2 className="size-4" /> Política: Modelo P (Revisión Periódica)
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este insumo es Tipo B o C. Para minimizar costos administrativos, se gestiona bajo el **Modelo P (Revisión Periódica)**. El inventario se revisa cada cierto intervalo (P) y se realiza un pedido variable hasta alcanzar el Nivel Objetivo (T).
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-info/30 bg-info/5 p-4 border-l-4 border-l-info">
                    <h3 className="text-sm font-semibold text-info mb-1 flex items-center gap-2">
                      <Settings2 className="size-4" /> Política: Modelo Q / ROP Probabilístico (Insumo)
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este artículo es un **Insumo de Alta Rotación/Valor (Tipo A)**. Dado que su escasez detiene la producción, se gestiona bajo el **Modelo Q (Revisión Continua)** con cálculo de EOQ fijo y reposición al alcanzar el ROP.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 border border-border rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Clasificación ABC</span>
                    <p className="text-lg font-bold text-foreground mt-1">{selectedProduct.abc}</p>
                  </div>
                  <div className="p-3 bg-muted/20 border border-border rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Lead Time (L)</span>
                    <p className="text-lg font-bold text-foreground mt-1">{selectedProduct.leadTime} Días</p>
                  </div>
                </div>

                {selectedProduct.isFinished ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Trazabilidad de Rotación FEFO</h3>
                    <div className="rounded-lg border border-border p-3 space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground">Próximo Lote a Vencer</span>
                        <span className="font-mono font-semibold text-destructive">LOT-A90 (12 días)</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground">Estado de Vida Útil</span>
                        <span className="text-success font-semibold">Óptimo (85% remanente)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Criterio de Picking</span>
                        <span className="font-semibold text-nuclear">Bloqueo automático de Lotes Nuevos</span>
                      </div>
                    </div>
                  </div>
                ) : selectedProduct.isModelP ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Cálculos Matemáticos (Modelo P)</h3>
                    <div className="rounded-lg border border-border p-4 space-y-3 text-xs bg-muted/10">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div>
                          <p className="font-medium text-foreground">Periodo de Revisión (P)</p>
                          <p className="text-[10px] text-muted-foreground">Días a esperar para la revisión</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-warning">{selectedProduct.periodoP} días</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div>
                          <p className="font-medium text-foreground">Nivel Objetivo de Inventario (T)</p>
                          <p className="text-[10px] text-muted-foreground">Cantidad a la que se debe reponer (und)</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-warning">{selectedProduct.nivelObjetivoT} un</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Stock de Seguridad (Ss)</p>
                          <p className="text-[10px] text-muted-foreground">Ajustado al periodo de revisión</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-success">
                          {Math.floor(selectedProduct.rop * 0.8)} un
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Cálculos Matemáticos (EOQ / ROP)</h3>
                    <div className="rounded-lg border border-border p-4 space-y-3 text-xs bg-muted/10">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div>
                          <p className="font-medium text-foreground">Demanda Anual (D)</p>
                          <p className="text-[10px] text-muted-foreground">Extraído de Archivos PN</p>
                        </div>
                        <span className="font-mono text-sm font-bold">{selectedProduct.demandaAnual} un/año</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div>
                          <p className="font-medium text-foreground">Cantidad Óptima de Pedido (EOQ)</p>
                          <p className="text-[10px] text-muted-foreground">Fórmula de Harris-Wilson</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-info">{selectedProduct.eoq} un</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <div>
                          <p className="font-medium text-foreground">Punto de Reorden (ROP)</p>
                          <p className="text-[10px] text-muted-foreground">Demanda en Lead Time + Stock de Seg.</p>
                        </div>
                        <span className="font-mono text-sm font-bold">{selectedProduct.rop} un</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Stock de Seguridad (Ss)</p>
                          <p className="text-[10px] text-muted-foreground">Servicio al 95% (Z = 1.645)</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-success">
                          {Math.floor(selectedProduct.rop * 0.2)} un
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                    Cerrar Detalle
                  </Button>
                  <Button variant="nuclear">
                    {selectedProduct.isFinished ? "Ver Trazabilidad Lotes" : "Ajustar Parámetros"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
