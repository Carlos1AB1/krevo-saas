import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const kardexMock = [
  {
    id: "M-1001",
    date: "2026-05-10 08:30",
    type: "entrada",
    product: "CQ-ARE-125 (Arequipe 125g)",
    document: "REC-2901",
    lot: "L-2031",
    prevStock: 1040,
    currentStock: 1240,
    qty: 200,
    user: "Juan Pérez",
    cost: 4500,
  },
  {
    id: "M-1002",
    date: "2026-05-09 14:15",
    type: "salida",
    product: "CQ-GAL-100 (Galletas 100g)",
    document: "SHP-1049",
    lot: "L-7712",
    prevStock: 120,
    currentStock: 96,
    qty: 24,
    user: "Carlos Mejía",
    cost: 3200,
  },
  {
    id: "M-1003",
    date: "2026-05-09 10:20",
    type: "traslado",
    product: "CQ-CAF-01M (Café 500g)",
    document: "TRF-402",
    lot: "L-3340",
    prevStock: 240,
    currentStock: 240,
    qty: 0,
    user: "Laura M.",
    note: "Armenia -> Circasia",
  },
  {
    id: "M-1004",
    date: "2026-05-08 17:45",
    type: "ajuste",
    product: "CQ-INS-AZU (Azúcar 50kg)",
    document: "AJ-081",
    lot: "L-4408",
    prevStock: 25,
    currentStock: 24,
    qty: -1,
    user: "Jorge R.",
    note: "Ajuste por avería",
  },
  {
    id: "M-1005",
    date: "2026-05-08 09:12",
    type: "salida",
    product: "CQ-ARE-125 (Arequipe 125g)",
    document: "SHP-1048",
    lot: "L-2031",
    prevStock: 1240,
    currentStock: 1040,
    qty: 200,
    user: "Carlos Mejía",
    cost: 4500,
  },
];

export function StockKardexView() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return kardexMock.filter(
      (m) =>
        m.product.toLowerCase().includes(q.toLowerCase()) ||
        m.document.toLowerCase().includes(q.toLowerCase()) ||
        m.lot.toLowerCase().includes(q.toLowerCase()),
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight leading-none">Kárdex Digital</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de movimientos, trazabilidad por lote y saldos (RF-INV-02 y RF-INV-03).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 size-4" /> Exportar Kárdex
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por producto, lote, OT o documento..."
            className="pl-9 bg-background"
          />
        </div>
        <Button variant="secondary" size="icon">
          <Filter className="size-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Producto / Lote</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3 text-right">Cant. Movimiento</th>
                <th className="px-4 py-3 text-right">Saldo Actual</th>
                <th className="px-4 py-3">Usuario responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                    {m.date}
                  </td>
                  <td className="px-4 py-3">
                    {m.type === "entrada" && (
                      <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        <ArrowUpRight className="size-3" /> Entrada
                      </span>
                    )}
                    {m.type === "salida" && (
                      <span className="inline-flex items-center gap-1 rounded bg-info/10 px-2 py-1 text-xs font-medium text-info">
                        <ArrowDownRight className="size-3" /> Salida
                      </span>
                    )}
                    {m.type === "traslado" && (
                      <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                        <RefreshCcw className="size-3" /> Traslado
                      </span>
                    )}
                    {m.type === "ajuste" && (
                      <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        <RefreshCcw className="size-3" /> Ajuste
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-xs">{m.product}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Lote: {m.lot}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{m.document}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {m.qty > 0 ? `+${m.qty}` : m.qty}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-xs font-semibold">{m.currentStock}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {m.user}
                    {m.note && <p className="text-[10px] text-muted-foreground mt-0.5">{m.note}</p>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron movimientos registrados en el Kárdex.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
