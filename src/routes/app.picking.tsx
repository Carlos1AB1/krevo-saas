import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/features/auth/usePermissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Play, CheckCircle, Loader2, Box, Plus, Trash2, PackageCheck, Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import {
  getDispatches, confirmPicking, approveDispatch, createDispatch, type DispatchResponse,
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
  const can = usePermissions();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<DispatchResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineState[]>([makeEmptyLine()]);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const handleValidateCode = (code: string) => {
    if (!selected) return;
    const isProductInDispatch = selected.lines.some(
      (l) =>
        l.productSku?.trim().toLowerCase() === code.trim().toLowerCase() ||
        l.productId === code
    );
    
    if (isProductInDispatch) {
      toast.success(`Código validado: ${code}`);
      setShowScanner(false);
      setManualCode("");
      confirmPickingMutation.mutate(selected.id);
    } else {
      toast.error(`El código "${code}" no pertenece a esta orden.`);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["logistics", "dispatches", { limit: 100 }],
    queryFn: () => getDispatches({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
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

  const pending    = filtered.filter((d) => d.status === "PENDING");
  const picking    = filtered.filter((d) => d.status === "PICKING");
  const dispatched = filtered.filter((d) => d.status === "DISPATCHED" || d.status === "APPROVED");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["logistics", "dispatches"] });
    qc.invalidateQueries({ queryKey: ["inventory"] });
  };

  const confirmPickingMutation = useMutation({
    mutationFn: confirmPicking,
    onSuccess: () => {
      toast.success("Picking confirmado — stock descontado por FEFO. Ahora puedes aprobar el despacho.");
      setSelected(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMutation = useMutation({
    mutationFn: approveDispatch,
    onSuccess: () => {
      toast.success("Despacho aprobado y despachado correctamente.");
      setSelected(null);
      invalidate();
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

  const isWorking = confirmPickingMutation.isPending || approveMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Picking (Outbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Órdenes de despacho — confirmar picking y luego aprobar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" /> Filtros
          </Button>
          {can("manage", "logistics") && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" /> Nuevo Despacho
            </Button>
          )}
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
              {/* Paso 1 — PENDING */}
              <SectionTitle label="1 · Por Procesar" count={pending.length} tone="warning"
                hint="Confirmar picking descuenta el stock por FEFO" />
              {pending.length === 0 && <EmptyState message="No hay despachos pendientes." />}
              <div className="space-y-3">
                {pending.map((d) => (
                  <DispatchCard key={d.id} dispatch={d}
                    actionLabel="Confirmar Picking"
                    actionIcon={<Play className="mr-2 size-4" />}
                    onAction={() => setSelected(d)} />
                ))}
              </div>

              {/* Paso 2 — PICKING */}
              <SectionTitle label="2 · En Picking" count={picking.length} tone="info"
                hint="Stock ya descontado — aprobar para marcar como despachado" />
              {picking.length === 0 && <EmptyState message="Sin órdenes en picking." />}
              <div className="space-y-3">
                {picking.map((d) => (
                  <DispatchCard key={d.id} dispatch={d}
                    actionLabel="Aprobar y Despachar"
                    actionIcon={<PackageCheck className="mr-2 size-4" />}
                    onAction={() => setSelected(d)} />
                ))}
              </div>

              {/* Despachados */}
              <SectionTitle label="Despachados" count={dispatched.length} tone="success" />
              {dispatched.length === 0 && <EmptyState message="Sin despachos completados aún." />}
              <div className="space-y-3">
                {dispatched.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Sheet — shared for PENDING (picking) and PICKING (approve) */}
      <Sheet open={!!selected} onOpenChange={(v) => {
        if (!v) {
          setSelected(null);
          setShowScanner(false);
        }
      }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selected.id.slice(0, 8).toUpperCase()}</p>
                <SheetTitle>
                  {selected.status === "PENDING" ? "Confirmar Picking" : "Aprobar Despacho"}
                </SheetTitle>
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
                        <th className="px-3 py-2 text-right">Cant. Sol.</th>
                        {selected.status === "PICKING" && <th className="px-3 py-2 text-right">Cant. Pick.</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selected.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2">
                            <p className="font-medium">{line.productName}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{line.productSku}</p>
                            {line.lotNumber && (
                              <p className="text-[10px] text-info">Lote: {line.lotNumber}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{line.requestedQty}</td>
                          {selected.status === "PICKING" && (
                            <td className="px-3 py-2 text-right font-mono text-success">{line.pickedQty}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selected.status === "PENDING" && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                    Al confirmar, el inventario se descontará automáticamente usando <strong>FEFO</strong> — los lotes más próximos a vencer salen primero.
                  </div>
                )}

                {selected.status === "PICKING" && (
                  <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
                    El picking ya fue confirmado y el stock fue descontado. Aprobar marcará el despacho como <strong>DESPACHADO</strong>.
                  </div>
                )}

                {selected.notes && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{selected.notes}</p>
                )}

                {showScanner && selected.status === "PENDING" && (
                  <div className="mt-4 p-4 rounded-xl border border-border bg-background shadow-inner">
                    <h3 className="text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2">
                      <Search className="size-4" /> Escanea el código del producto
                    </h3>
                    <BarcodeScanner
                      onScanSuccess={(decodedText) => {
                        handleValidateCode(decodedText);
                      }}
                      onScanError={(err) => {
                        // Ignoramos errores de lectura continuos para no spamear
                      }}
                    />
                    
                    <div className="relative flex items-center my-4">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase font-semibold">O ingresa el código</span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ej: PT-001"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && manualCode.trim()) {
                            handleValidateCode(manualCode);
                          }
                        }}
                        className="h-9 text-sm"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          if (manualCode.trim()) {
                            handleValidateCode(manualCode);
                          } else {
                            toast.error("Ingresa un código antes de validar");
                          }
                        }}
                      >
                        Validar
                      </Button>
                    </div>
                    
                    <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => setShowScanner(false)}>
                      Cerrar Cámara
                    </Button>
                  </div>
                )}
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
                {selected.status === "PENDING" && can("manage", "logistics") && (
                  !showScanner ? (
                    <Button variant="nuclear" onClick={() => setShowScanner(true)}>
                      <Box className="mr-2 size-4" /> Iniciar Escáner de Barras
                    </Button>
                  ) : null
                )}
                {selected.status === "PICKING" && can("manage", "logistics") && (
                  <Button variant="nuclear" disabled={isWorking}
                    onClick={() => approveMutation.mutate(selected.id)}>
                    {approveMutation.isPending
                      ? <><Loader2 className="mr-2 size-4 animate-spin" /> Aprobando…</>
                      : <><PackageCheck className="mr-2 size-4" /> Aprobar y Despachar</>}
                  </Button>
                )}
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
              La orden quedará en estado <strong>PENDIENTE</strong>. El stock se descuenta al confirmar el picking usando FEFO.
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createMutation.isPending} onClick={handleSubmitCreate}>
              {createMutation.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</>
                : <><Truck className="mr-2 size-4" /> Crear Despacho</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DispatchCard({
  dispatch: d,
  actionLabel,
  actionIcon,
  onAction,
}: {
  dispatch: DispatchResponse;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}) {
  const totalQty = d.lines.reduce((s, l) => s + l.requestedQty, 0);
  const isCompleted = d.status === "DISPATCHED" || d.status === "APPROVED";

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
      d.status === "PENDING" ? "border-warning/40" :
      d.status === "PICKING" ? "border-info/40" :
      isCompleted ? "border-success/30" : "border-border"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold">{d.id.slice(0, 8).toUpperCase()}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              d.status === "PENDING" ? "bg-warning/15 text-warning" :
              d.status === "PICKING" ? "bg-info/15 text-info" :
              "bg-success/15 text-success")}>
              {d.status === "PENDING" ? "Pendiente" :
               d.status === "PICKING" ? "En Picking" : "Despachado"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Destino: <span className="font-semibold text-foreground">{d.destination ?? "—"}</span>
          </p>
        </div>
        {d.status === "PENDING" && <Box className="size-5 text-warning" />}
        {d.status === "PICKING" && <PackageCheck className="size-5 text-info" />}
        {isCompleted && <CheckCircle className="size-5 text-success" />}
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

      {onAction && actionLabel && (
        <Button className="w-full mt-4" onClick={onAction}>
          {actionIcon}{actionLabel}
        </Button>
      )}
      {isCompleted && (
        <Button variant="outline" className="w-full mt-4 text-muted-foreground" disabled>
          <CheckCircle className="mr-2 size-4" /> Completado
        </Button>
      )}
    </div>
  );
}

function SectionTitle({ label, count, tone, hint }: {
  label: string; count: number;
  tone: "warning" | "success" | "info" | "destructive";
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <h2 className={cn("font-semibold text-sm",
        tone === "warning" ? "text-warning" :
        tone === "success" ? "text-success" :
        tone === "info" ? "text-info" : "text-destructive")}>
        {label}
      </h2>
      <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
        {count}
      </span>
      {hint && <span className="text-[11px] text-muted-foreground hidden sm:inline">· {hint}</span>}
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
