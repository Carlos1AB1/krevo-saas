import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Play, CheckCircle, Loader2, Box, XCircle, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  getDispatches, approveDispatch, createDispatch, type DispatchResponse,
} from "@/features/logistics/logistics.api";
import { getProducts } from "@/features/inventory/inventory.api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/picking")({
  head: () => ({ meta: [{ title: "Picking · Krevo" }] }),
  component: PickingPage,
});

interface LineState {
  _key: string;
  productId: string;
  requestedQty: number;
}

function makeEmptyLine(): LineState {
  return { _key: Math.random().toString(36).slice(2), productId: "", requestedQty: 1 };
}

function PickingPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<DispatchResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineState[]>([makeEmptyLine()]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["logistics", "dispatches", { limit: 100 }],
    queryFn: () => getDispatches({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 200 }],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const products = productsData?.data ?? [];

  const allDispatches = data?.data ?? [];

  const filtered = allDispatches.filter((d) => {
    const ql = q.toLowerCase();
    if (!ql) return true;
    return (
      (d.destination ?? "").toLowerCase().includes(ql) ||
      d.id.toLowerCase().includes(ql)
    );
  });

  const pending   = filtered.filter((d) => d.status === "PENDING");
  const approved  = filtered.filter((d) => d.status === "APPROVED");
  const rejected  = filtered.filter((d) => d.status === "REJECTED");

  const approveMutation = useMutation({
    mutationFn: approveDispatch,
    onSuccess: () => {
      toast.success("Despacho procesado — inventario actualizado por FEFO");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["logistics", "dispatches"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: createDispatch,
    onSuccess: () => {
      toast.success("Orden de despacho creada");
      setCreateOpen(false);
      resetCreateForm();
      qc.invalidateQueries({ queryKey: ["logistics", "dispatches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetCreateForm() {
    setDestination("");
    setNotes("");
    setLines([makeEmptyLine()]);
  }

  function updateLine(key: string, patch: Partial<LineState>) {
    setLines((prev) => prev.map((l) => (l._key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l._key !== key) : prev));
  }

  function handleSubmitCreate() {
    const validLines = lines.filter((l) => l.productId && l.requestedQty > 0);
    if (validLines.length === 0) {
      toast.error("Agrega al menos una línea de producto");
      return;
    }
    createMutation.mutate({
      destination: destination || undefined,
      notes: notes || undefined,
      lines: validLines.map((l) => ({ productId: l.productId, requestedQty: l.requestedQty })),
    });
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Picking (Outbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Órdenes de despacho pendientes de procesar — consumo automático por FEFO.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" /> Filtros
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" /> Nuevo Despacho
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar despacho o destino…"
              className="pl-9 h-10 bg-card shadow-sm" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando órdenes…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar las órdenes de picking.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <SectionTitle label="Por Procesar" count={pending.length} tone="warning" />
              {pending.length === 0 && (
                <EmptyState message="No hay despachos pendientes." />
              )}
              <div className="space-y-3">
                {pending.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} onProcess={() => setSelected(d)} />
                ))}
              </div>

              <SectionTitle label="Procesados" count={approved.length} tone="success" />
              {approved.length === 0 && <EmptyState message="Sin despachos aprobados aún." />}
              <div className="space-y-3">
                {approved.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} />
                ))}
              </div>

              {rejected.length > 0 && (
                <>
                  <SectionTitle label="Rechazados" count={rejected.length} tone="destructive" />
                  <div className="space-y-3">
                    {rejected.map((d) => (
                      <DispatchCard key={d.id} dispatch={d} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Process Sheet */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selected.id.slice(0, 8).toUpperCase()}</p>
                <SheetTitle>Procesar Despacho</SheetTitle>
                <SheetDescription>
                  {selected.destination ?? "Sin destino"} · {selected.lines.length} línea(s)
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground text-xs font-medium">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2 text-right">Cant.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selected.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2">
                            <p className="font-medium">{line.productName}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{line.productSku}</p>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{line.requestedQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                  Al aprobar, el inventario se descontará automáticamente usando <strong>FEFO</strong> — los lotes más próximos a vencer salen primero.
                </div>

                {selected.notes && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{selected.notes}</p>
                )}
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
                <Button variant="nuclear"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(selected.id)}>
                  {approveMutation.isPending
                    ? <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando…</>
                    : <><Play className="mr-2 size-4" /> Aprobar y Despachar</>}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dispatch Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Despacho</SheetTitle>
            <SheetDescription>Crea una orden de salida de inventario hacia un destino.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Destino</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej: Producción — Línea 3" />
            </div>

            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones del despacho" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Líneas de producto</Label>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setLines((p) => [...p, makeEmptyLine()])}>
                  <Plus className="size-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {lines.map((line, idx) => (
                <div key={line._key} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Línea {idx + 1}</span>
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(line._key)}
                        className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Producto</Label>
                      <select
                        value={line.productId}
                        onChange={(e) => updateLine(line._key, { productId: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">— Seleccionar —</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Cantidad solicitada</Label>
                      <Input type="number" min={0.001} step={0.001} value={line.requestedQty}
                        onChange={(e) => updateLine(line._key, { requestedQty: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
              La orden quedará en estado <strong>PENDIENTE</strong>. El stock se descontará automáticamente al aprobarla usando FEFO.
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createMutation.isPending} onClick={handleSubmitCreate}>
              {createMutation.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</>
                : <><Play className="mr-2 size-4" /> Crear Despacho</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DispatchCard({ dispatch: d, onProcess }: { dispatch: DispatchResponse; onProcess?: () => void }) {
  const totalQty = d.lines.reduce((s, l) => s + l.requestedQty, 0);
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
      d.status === "PENDING" ? "border-warning/40" : d.status === "APPROVED" ? "border-success/30" : "border-destructive/30"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold">{d.id.slice(0, 8).toUpperCase()}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              d.status === "PENDING" ? "bg-warning/15 text-warning" :
              d.status === "APPROVED" ? "bg-success/15 text-success" :
              "bg-destructive/15 text-destructive")}>
              {d.status === "PENDING" ? "Pendiente" : d.status === "APPROVED" ? "Aprobado" : "Rechazado"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Destino: <span className="font-semibold text-foreground">{d.destination ?? "—"}</span>
          </p>
        </div>
        {d.status === "PENDING" && <Box className="size-5 text-warning" />}
        {d.status === "APPROVED" && <CheckCircle className="size-5 text-success" />}
        {d.status === "REJECTED" && <XCircle className="size-5 text-destructive" />}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center divide-x divide-border border-t border-border/50 pt-3">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Líneas</p>
          <p className="text-lg font-bold">{d.lines.length}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Unidades</p>
          <p className="text-lg font-bold">{totalQty}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Fecha</p>
          <p className="text-xs font-medium mt-1">{format(parseISO(d.createdAt), "dd MMM", { locale: es })}</p>
        </div>
      </div>

      {d.status === "PENDING" && onProcess && (
        <Button className="w-full mt-4" onClick={onProcess}>
          <Play className="mr-2 size-4" /> Procesar Despacho
        </Button>
      )}
      {d.status === "APPROVED" && (
        <Button variant="outline" className="w-full mt-4 text-muted-foreground" disabled>
          <CheckCircle className="mr-2 size-4" /> Completado
        </Button>
      )}
    </div>
  );
}

function SectionTitle({ label, count, tone }: { label: string; count: number; tone: "warning" | "success" | "destructive" }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <h2 className={cn("font-semibold text-sm",
        tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-destructive")}>
        {label}
      </h2>
      <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
