import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/features/auth/usePermissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpFromLine, Search, Filter, Truck, PackageCheck,
  AlertCircle, Loader2, XCircle, Box,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  getDispatches, approveDispatch, type DispatchResponse,
} from "@/features/logistics/logistics.api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/shipments")({
  head: () => ({ meta: [{ title: "Despachos · Krevo" }] }),
  component: ShipmentsPage,
});

function statusColor(status: DispatchResponse["status"]) {
  if (status === "APPROVED") return "var(--color-success)";
  if (status === "PENDING") return "var(--color-warning)";
  return "var(--color-destructive)";
}

function ShipmentsPage() {
  const can = usePermissions();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<DispatchResponse | null>(null);
  const [q, setQ] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["logistics", "dispatches", { limit: 50 }],
    queryFn: () => getDispatches({ limit: 50 }),
  });

  const dispatches = data?.data ?? [];

  const filtered = dispatches.filter((d) => {
    const ql = q.toLowerCase();
    if (!ql) return true;
    return (
      (d.destination ?? "").toLowerCase().includes(ql) ||
      d.id.toLowerCase().includes(ql) ||
      d.status.toLowerCase().includes(ql)
    );
  });

  const approveMutation = useMutation({
    mutationFn: approveDispatch,
    onSuccess: () => {
      toast.success("Despacho aprobado — inventario actualizado");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["logistics", "dispatches"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const isWorking = approveMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Despachos (Outbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Órdenes de salida de inventario hacia destinos o producción.
          </p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Filter className="mr-2 size-4" /> Filtrar
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por destino, ID o estado…"
              className="pl-9 h-10 bg-card shadow-sm" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando despachos…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar los despachos.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No hay despachos registrados.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <div key={d.id}
                  className="relative flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                  <div className="h-1 w-full" style={{ backgroundColor: statusColor(d.status) }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase text-muted-foreground font-mono">
                          {d.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h2 className="mt-1 text-base font-semibold leading-tight">
                          {d.destination ?? "Sin destino"}
                        </h2>
                      </div>
                      {d.status === "APPROVED" && <PackageCheck className="size-5 text-success" />}
                      {d.status === "PENDING" && <AlertCircle className="size-5 text-warning animate-pulse" />}
                      {(d.status === "PICKING") && <XCircle className="size-5 text-info" />}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Líneas</span>
                        <span className="font-medium">{d.lines.length} producto(s)</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Creado por</span>
                        <span className="font-medium">{d.createdBy.firstName} {d.createdBy.lastName}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-muted-foreground">Fecha</span>
                        <span className="font-mono text-xs">
                          {format(parseISO(d.createdAt), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelected(d)}>
                        Ver detalle
                      </Button>
                      {d.status === "PENDING" && can("manage", "logistics") && (
                        <Button size="sm" className="w-full text-xs" onClick={() => setSelected(d)}>
                          Aprobar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selected.id.slice(0, 8).toUpperCase()}</p>
                <SheetTitle>{selected.destination ?? "Sin destino"}</SheetTitle>
                <SheetDescription>
                  Estado: {selected.status === "PENDING" ? "Pendiente" : selected.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                  {" · "}{selected.lines.length} línea(s)
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Box className="size-4" /> Líneas de Despacho
                  </h4>
                  <div className="rounded-lg border border-border overflow-hidden text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground text-xs font-medium">
                        <tr>
                          <th className="px-3 py-2">Producto / Lote</th>
                          <th className="px-3 py-2 text-right">Solicitado</th>
                          <th className="px-3 py-2 text-right">Despachado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selected.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="px-3 py-2">
                              <span className="block font-medium">{line.productName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{line.productSku}</span>
                              {line.lotNumber && (
                                <span className="text-[10px] text-muted-foreground block">Lote: {line.lotNumber}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{line.requestedQty}</td>
                            <td className="px-3 py-2 text-right font-mono">{line.pickedQty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selected.notes && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{selected.notes}</p>
                )}

                {selected.status === "PENDING" && can("manage", "logistics") && (
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="nuclear" disabled={isWorking} onClick={() => approveMutation.mutate(selected.id)}>
                      {approveMutation.isPending
                        ? <><Loader2 className="mr-2 size-4 animate-spin" /> Aprobando…</>
                        : <><ArrowUpFromLine className="mr-2 size-4" /> Aprobar Despacho</>}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
