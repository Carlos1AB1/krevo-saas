import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCcw, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMovements, type MovementResponse } from "@/features/inventory/inventory.api";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

function movementTypeLabel(type: MovementResponse["type"]) {
  switch (type) {
    case "RECEIPT": return "entrada";
    case "DISPATCH": return "salida";
    case "TRANSFER": return "traslado";
    case "ADJUSTMENT": return "ajuste";
  }
}

export function StockKardexView() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "movements", { type: typeFilter || undefined, limit: 100 }],
    queryFn: () => getMovements({ limit: 100, type: typeFilter || undefined }),
  });

  const movements = data?.data ?? [];

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return movements.filter((m) => {
      const typeLabel = movementTypeLabel(m.type);
      if (!ql) return true;
      return (
        m.product.name.toLowerCase().includes(ql) ||
        m.product.sku.toLowerCase().includes(ql) ||
        (m.lot?.lotNumber ?? "").toLowerCase().includes(ql) ||
        (m.reference ?? "").toLowerCase().includes(ql) ||
        typeLabel.includes(ql)
      );
    });
  }, [movements, q]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    // Headers
    const headers = [
      "Fecha",
      "Hora",
      "Tipo",
      "SKU",
      "Producto",
      "Lote",
      "Referencia",
      "Cantidad",
      "Saldo",
      "Responsable",
      "Notas"
    ];

    // Rows
    const rows = filtered.map(m => {
      const d = parseISO(m.createdAt);
      return [
        format(d, "yyyy-MM-dd"),
        format(d, "HH:mm"),
        movementTypeLabel(m.type),
        m.product.sku,
        `"${m.product.name.replace(/"/g, '""')}"`,
        m.lot?.lotNumber || "",
        `"${(m.reference || "").replace(/"/g, '""')}"`,
        m.quantity.toString(),
        m.stockAfter.toString(),
        `"${m.createdBy.firstName} ${m.createdBy.lastName}"`,
        `"${(m.notes || "").replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kardex_export_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight leading-none">Kárdex Digital</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de movimientos, trazabilidad por lote y saldos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
          <FileText className="mr-2 size-4" /> Exportar Kárdex
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por producto, lote o referencia…" className="pl-9 bg-background" />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todos los tipos</option>
          <option value="RECEIPT">Entradas</option>
          <option value="DISPATCH">Salidas</option>
          <option value="ADJUSTMENT">Ajustes</option>
          <option value="TRANSFER">Traslados</option>
        </select>
        <Button variant="secondary" size="icon"><Filter className="size-4" /></Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Cargando movimientos…
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No fue posible cargar el Kárdex. Verifica que el servidor esté activo.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Producto / Lote</th>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3 text-right">Cant. Movimiento</th>
                  <th className="px-4 py-3 text-right">Saldo Actual</th>
                  <th className="px-4 py-3">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((m) => (
                  <MovementRow key={m.id} movement={m} />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MovementRow({ movement: m }: { movement: MovementResponse }) {
  const dateLabel = format(parseISO(m.createdAt), "yyyy-MM-dd HH:mm", { locale: es });
  const type = movementTypeLabel(m.type);

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{dateLabel}</td>
      <td className="px-4 py-3">
        {type === "entrada" && (
          <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">
            <ArrowUpRight className="size-3" /> Entrada
          </span>
        )}
        {type === "salida" && (
          <span className="inline-flex items-center gap-1 rounded bg-info/10 px-2 py-1 text-xs font-medium text-info">
            <ArrowDownRight className="size-3" /> Salida
          </span>
        )}
        {type === "traslado" && (
          <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
            <RefreshCcw className="size-3" /> Traslado
          </span>
        )}
        {type === "ajuste" && (
          <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <RefreshCcw className="size-3" /> Ajuste
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-xs">{m.product.sku} · {m.product.name}</p>
        {m.lot && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Lote: {m.lot.lotNumber}</p>}
      </td>
      <td className="px-4 py-3 font-mono text-xs">{m.reference ?? "—"}</td>
      <td className="px-4 py-3 text-right font-mono font-medium">
        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-xs font-semibold">{m.stockAfter}</span>
      </td>
      <td className="px-4 py-3 text-xs">
        {m.createdBy.firstName} {m.createdBy.lastName}
        {m.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{m.notes}</p>}
      </td>
    </tr>
  );
}
