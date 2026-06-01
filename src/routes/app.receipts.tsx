import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Box,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  getReceipts,
  createReceipt,
  approveReceipt,
  rejectReceipt,
  type ReceiptResponse,
} from "@/features/logistics/logistics.api";
import { getProducts } from "@/features/inventory/inventory.api";
import { useSuppliers } from "@/features/suppliers/useSuppliers";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/app/receipts")({
  head: () => ({ meta: [{ title: "Recepciones · Krevo" }] }),
  component: ReceiptsPage,
});

function statusIcon(status: ReceiptResponse["status"]) {
  if (status === "PENDING") return <Clock className="size-4 text-warning" />;
  if (status === "APPROVED") return <CheckCircle2 className="size-4 text-success" />;
  return <XCircle className="size-4 text-destructive" />;
}

function statusLabel(status: ReceiptResponse["status"]) {
  if (status === "PENDING") return "Pendiente";
  if (status === "APPROVED") return "Aprobado";
  return "Rechazado";
}

interface LineState {
  _key: string;
  productId: string;
  quantity: number;
  unitCost: string;
}

function makeEmptyLine(): LineState {
  return { _key: Math.random().toString(36).slice(2), productId: "", quantity: 1, unitCost: "" };
}

function ReceiptsPage() {
  const qc = useQueryClient();
  const { suppliers: storedSuppliers } = useSuppliers();
  const [selectedRec, setSelectedRec] = useState<ReceiptResponse | null>(null);
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineState[]>([makeEmptyLine()]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["logistics", "receipts", { limit: 50 }],
    queryFn: () => getReceipts({ limit: 50 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 200 }],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const products = productsData?.data ?? [];

  const receipts = data?.data ?? [];

  const filtered = receipts.filter((r) => {
    const ql = q.toLowerCase();
    if (!ql) return true;
    return (
      (r.supplier ?? "").toLowerCase().includes(ql) ||
      r.id.toLowerCase().includes(ql) ||
      r.status.toLowerCase().includes(ql)
    );
  });

  const approveMutation = useMutation({
    mutationFn: approveReceipt,
    onSuccess: () => {
      toast.success("Recepción aprobada — lotes actualizados en inventario");
      setSelectedRec(null);
      qc.invalidateQueries({ queryKey: ["logistics", "receipts"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectReceipt(id),
    onSuccess: () => {
      toast.success("Recepción rechazada");
      setSelectedRec(null);
      qc.invalidateQueries({ queryKey: ["logistics", "receipts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: createReceipt,
    onSuccess: () => {
      toast.success("Recepción creada correctamente");
      setCreateOpen(false);
      resetCreateForm();
      qc.invalidateQueries({ queryKey: ["logistics", "receipts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isWorking = approveMutation.isPending || rejectMutation.isPending;

  function resetCreateForm() {
    setSupplier("");
    setNotes("");
    setLines([makeEmptyLine()]);
  }

  function openCreate(initialSupplier?: string) {
    resetCreateForm();
    if (initialSupplier) setSupplier(initialSupplier);
    setCreateOpen(true);
  }

  function handleSubmitCreate() {
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      toast.error("Agrega al menos una línea de producto");
      return;
    }
    createMutation.mutate({
      supplier: supplier || undefined,
      notes: notes || undefined,
      lines: validLines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost ? Number(l.unitCost) : undefined,
      })),
    });
  }

  function updateLine(key: string, patch: Partial<LineState>) {
    setLines((prev) => prev.map((l) => (l._key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l._key !== key) : prev));
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Recepciones (Inbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Ingreso de materias primas, QA y registro en Kárdex.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span className="hidden lg:inline">Filtrar</span>
          </Button>
          <Button size="sm" onClick={() => openCreate()}>
            <Plus className="mr-2 size-4" />
            <span>Nuevo Ingreso</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por proveedor, ID o estado…"
                className="pl-9 bg-card shadow-sm h-10 w-full"
              />
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando recepciones…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar las recepciones. Verifica que el servidor esté activo.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No hay recepciones registradas.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((rec) => (
                <div
                  key={rec.id}
                  className="relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-nuclear/50 hover:shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground font-mono">
                        {rec.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h2 className="mt-2 text-base font-semibold text-foreground">
                        {rec.supplier ?? "Proveedor no especificado"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {statusLabel(rec.status)} · {rec.lines.length} línea(s)
                      </p>
                    </div>
                    {statusIcon(rec.status)}
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Creado</span>
                      <span className="font-medium text-xs">
                        {format(parseISO(rec.createdAt), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted-foreground">Por</span>
                      <span className="font-medium text-xs">
                        {rec.createdBy.firstName} {rec.createdBy.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => setSelectedRec(rec)}>
                      Ver detalle
                    </Button>
                    {rec.status === "PENDING" && (
                      <Button className="w-full text-xs" size="sm" variant="default" onClick={() => setSelectedRec(rec)}>
                        Aprobar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedRec} onOpenChange={(v) => !v && setSelectedRec(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRec && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selectedRec.id.slice(0, 8).toUpperCase()}</p>
                <SheetTitle className="font-display text-xl">
                  {selectedRec.supplier ?? "Sin proveedor"}
                </SheetTitle>
                <SheetDescription>
                  Estado: {statusLabel(selectedRec.status)} · {selectedRec.lines.length} línea(s) de producto
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Box className="size-4" /> Líneas de Recepción
                  </h4>
                  <div className="rounded-lg border border-border overflow-hidden text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground text-xs font-medium">
                        <tr>
                          <th className="px-3 py-2">Producto / Lote</th>
                          <th className="px-3 py-2 text-right">Cant.</th>
                          <th className="px-3 py-2 text-right">Costo/u</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedRec.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="px-3 py-2">
                              <span className="block font-medium">{line.productName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{line.productSku}</span>
                              {line.lotNumber && (
                                <span className="text-[10px] text-muted-foreground block">Lote: {line.lotNumber}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{line.quantity}</td>
                            <td className="px-3 py-2 text-right font-mono text-xs">
                              {line.unitCost ? `$${line.unitCost.toLocaleString("es-CO")}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedRec.notes && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{selectedRec.notes}</p>
                )}

                {selectedRec.status === "PENDING" && (
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" disabled={isWorking} onClick={() => rejectMutation.mutate(selectedRec.id)}>
                      {rejectMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Rechazar"}
                    </Button>
                    <Button variant="nuclear" disabled={isWorking} onClick={() => approveMutation.mutate(selectedRec.id)}>
                      {approveMutation.isPending ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" /> Aprobando…</>
                      ) : (
                        <><ArrowDownToLine className="mr-2 size-4" /> Aprobar Ingreso</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Receipt Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Ingreso</SheetTitle>
            <SheetDescription>Registra una recepción de materias primas o insumos.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              {storedSuppliers.length > 0 ? (
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Seleccionar proveedor —</option>
                  {storedSuppliers.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  Sin proveedores registrados —{" "}
                  <a href="/app/suppliers" className="underline text-nuclear">ve a Proveedores</a> para agregar.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de la recepción"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Líneas de producto</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setLines((p) => [...p, makeEmptyLine()])}>
                  <Plus className="size-3.5 mr-1" /> Agregar línea
                </Button>
              </div>

              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={line._key} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Línea {idx + 1}</span>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(line._key)} className="text-muted-foreground hover:text-destructive">
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
                          <option value="">— Seleccionar producto —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cantidad</Label>
                        <Input
                          type="number"
                          min={0.001}
                          step={0.001}
                          value={line.quantity}
                          onChange={(e) => updateLine(line._key, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Costo unitario (opcional)</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={line.unitCost}
                          onChange={(e) => updateLine(line._key, { unitCost: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
              Cancelar
            </Button>
            <Button
              variant="nuclear"
              disabled={createMutation.isPending}
              onClick={handleSubmitCreate}
            >
              {createMutation.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</>
                : <><ArrowDownToLine className="mr-2 size-4" /> Registrar Ingreso</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

