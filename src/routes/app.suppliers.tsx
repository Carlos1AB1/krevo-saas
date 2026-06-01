import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Factory, Search, Loader2, Package, TruckIcon, Plus, Trash2, ArrowDownToLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { getReceipts, createReceipt } from "@/features/logistics/logistics.api";
import { getProducts } from "@/features/inventory/inventory.api";
import { useSuppliers } from "@/features/suppliers/useSuppliers";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/suppliers")({
  head: () => ({ meta: [{ title: "Proveedores · Krevo" }] }),
  component: SuppliersPage,
});

interface SupplierSummary {
  name: string;
  totalReceipts: number;
  pendingReceipts: number;
  approvedReceipts: number;
  totalLines: number;
  lastReceiptAt: string;
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

function SuppliersPage() {
  const qc = useQueryClient();
  const { suppliers: storedSuppliers, add: addSupplier, remove: removeSupplier } = useSuppliers();
  const [q, setQ] = useState("");
  const [viewSupplier, setViewSupplier] = useState<SupplierSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSupplier, setCreateSupplier] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createLines, setCreateLines] = useState<LineState[]>([makeEmptyLine()]);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["logistics", "receipts", { limit: 100 }],
    queryFn: () => getReceipts({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 200 }],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const products = productsData?.data ?? [];

  const receipts = data?.data ?? [];

  const suppliers: SupplierSummary[] = useMemo(() => {
    const map = new Map<string, SupplierSummary>();

    // Seed from stored suppliers first (so they appear even with 0 receipts)
    storedSuppliers.forEach((name) => {
      map.set(name, {
        name,
        totalReceipts: 0,
        pendingReceipts: 0,
        approvedReceipts: 0,
        totalLines: 0,
        lastReceiptAt: "",
      });
    });

    receipts.forEach((r) => {
      const key = r.supplier ?? "Proveedor sin nombre";
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: key,
          totalReceipts: 1,
          pendingReceipts: r.status === "PENDING" ? 1 : 0,
          approvedReceipts: r.status === "APPROVED" ? 1 : 0,
          totalLines: r.lines.length,
          lastReceiptAt: r.createdAt,
        });
      } else {
        map.set(key, {
          ...existing,
          totalReceipts: existing.totalReceipts + 1,
          pendingReceipts: existing.pendingReceipts + (r.status === "PENDING" ? 1 : 0),
          approvedReceipts: existing.approvedReceipts + (r.status === "APPROVED" ? 1 : 0),
          totalLines: existing.totalLines + r.lines.length,
          lastReceiptAt: r.createdAt > existing.lastReceiptAt ? r.createdAt : existing.lastReceiptAt,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalReceipts - a.totalReceipts);
  }, [receipts, storedSuppliers]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    if (!ql) return suppliers;
    return suppliers.filter((s) => s.name.toLowerCase().includes(ql));
  }, [suppliers, q]);

  const supplierReceipts = useMemo(() => {
    if (!viewSupplier) return [];
    return receipts.filter((r) => (r.supplier ?? "Proveedor sin nombre") === viewSupplier.name);
  }, [receipts, viewSupplier]);

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

  function resetCreateForm() {
    setCreateSupplier("");
    setCreateNotes("");
    setCreateLines([makeEmptyLine()]);
  }

  function openCreateForSupplier(supplierName: string) {
    resetCreateForm();
    setCreateSupplier(supplierName);
    setCreateOpen(true);
  }

  function updateLine(key: string, patch: Partial<LineState>) {
    setCreateLines((prev) => prev.map((l) => (l._key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setCreateLines((prev) => (prev.length > 1 ? prev.filter((l) => l._key !== key) : prev));
  }

  function handleSubmitCreate() {
    const validLines = createLines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      toast.error("Agrega al menos una línea de producto");
      return;
    }
    createMutation.mutate({
      supplier: createSupplier || undefined,
      notes: createNotes || undefined,
      lines: validLines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost ? Number(l.unitCost) : undefined,
      })),
    });
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Directorio de proveedores — {storedSuppliers.length} registrados.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddSupplierOpen(true)}>
          <UserPlus className="mr-2 size-4" /> Nuevo Proveedor
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar proveedor…"
              className="pl-9 h-10 bg-card shadow-sm" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando proveedores…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar los proveedores.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No hay proveedores registrados. Crea una recepción para que aparezcan aquí.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((sup) => (
                <div key={sup.name}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
                        <Factory className="size-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold leading-none">{sup.name}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Última recepción: {format(parseISO(sup.lastReceiptAt), "dd MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      sup.pendingReceipts > 0 ? "bg-warning/15 text-warning" : "bg-success/15 text-success")}>
                      {sup.pendingReceipts > 0 ? `${sup.pendingReceipts} pendiente(s)` : "Al día"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center border-t border-border/50 pt-4">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Recepciones</p>
                      <p className="text-xl font-bold mt-0.5">{sup.totalReceipts}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Aprobadas</p>
                      <p className="text-xl font-bold text-success mt-0.5">{sup.approvedReceipts}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Líneas</p>
                      <p className="text-xl font-bold mt-0.5">{sup.totalLines}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {sup.totalReceipts > 0 && (
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setViewSupplier(sup)}>
                        <Package className="mr-2 size-3.5" /> Ver Recepciones
                      </Button>
                    )}
                    <Button variant="default" size="sm" className="flex-1 text-xs" onClick={() => openCreateForSupplier(sup.name)}>
                      <TruckIcon className="mr-2 size-3.5" /> Nueva Recepción
                    </Button>
                    {storedSuppliers.includes(sup.name) && (
                      <Button variant="ghost" size="sm" className="px-2 text-muted-foreground hover:text-destructive" onClick={() => removeSupplier(sup.name)} title="Eliminar proveedor">
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nuevo Proveedor Sheet */}
      <Sheet open={addSupplierOpen} onOpenChange={(v) => { if (!v) { setAddSupplierOpen(false); setNewSupplierName(""); } }}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Nuevo Proveedor</SheetTitle>
            <SheetDescription>Agrega un proveedor al directorio para usarlo en recepciones.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre del proveedor</Label>
              <Input
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Ej: Lácteos del Valle S.A."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newSupplierName.trim()) {
                      addSupplier(newSupplierName);
                      toast.success(`Proveedor "${newSupplierName.trim()}" agregado`);
                      setNewSupplierName("");
                      setAddSupplierOpen(false);
                    }
                  }
                }}
              />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setAddSupplierOpen(false); setNewSupplierName(""); }}>Cancelar</Button>
            <Button variant="nuclear" onClick={() => {
              if (!newSupplierName.trim()) { toast.error("El nombre es requerido"); return; }
              addSupplier(newSupplierName);
              toast.success(`Proveedor "${newSupplierName.trim()}" agregado`);
              setNewSupplierName("");
              setAddSupplierOpen(false);
            }}>
              <UserPlus className="mr-2 size-4" /> Agregar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Ver Recepciones Sheet */}
      <Sheet open={!!viewSupplier} onOpenChange={(v) => !v && setViewSupplier(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {viewSupplier && (
            <>
              <SheetHeader>
                <SheetTitle>{viewSupplier.name}</SheetTitle>
                <SheetDescription>{viewSupplier.totalReceipts} recepción(es) · {viewSupplier.approvedReceipts} aprobadas</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {supplierReceipts.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">Sin recepciones encontradas.</p>
                ) : (
                  supplierReceipts.map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{rec.id.slice(0, 8).toUpperCase()}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          rec.status === "PENDING" ? "bg-warning/15 text-warning" :
                          rec.status === "APPROVED" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                          {rec.status === "PENDING" ? "Pendiente" : rec.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.lines.length} línea(s) · {format(parseISO(rec.createdAt), "dd MMM yyyy", { locale: es })}</p>
                      <div className="divide-y divide-border text-xs">
                        {rec.lines.map((l) => (
                          <div key={l.id} className="flex justify-between py-1.5">
                            <span>{l.productName}</span>
                            <span className="font-mono">{l.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <Button className="w-full mt-4" onClick={() => { setViewSupplier(null); openCreateForSupplier(viewSupplier.name); }}>
                  <Plus className="mr-2 size-4" /> Nueva Recepción para {viewSupplier.name}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Nueva Recepción Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Recepción</SheetTitle>
            <SheetDescription>Registra una entrada de materias primas o insumos.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              <select
                value={createSupplier}
                onChange={(e) => setCreateSupplier(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— Seleccionar proveedor —</option>
                {storedSuppliers.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Input value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} placeholder="Observaciones" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Líneas de producto</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateLines((p) => [...p, makeEmptyLine()])}>
                  <Plus className="size-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {createLines.map((line, idx) => (
                <div key={line._key} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Línea {idx + 1}</span>
                    {createLines.length > 1 && (
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
                        <option value="">— Seleccionar —</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cantidad</Label>
                      <Input type="number" min={0.001} step={0.001} value={line.quantity}
                        onChange={(e) => updateLine(line._key, { quantity: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Costo/u (opcional)</Label>
                      <Input type="number" min={0} placeholder="0" value={line.unitCost}
                        onChange={(e) => updateLine(line._key, { unitCost: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createMutation.isPending} onClick={handleSubmitCreate}>
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
