import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/features/auth/usePermissions";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Factory,
  Plus,
  Flame,
  Package,
  CheckCircle2,
  ListTodo,
  MoreVertical,
  Clock,
  ArrowRight,
  Beaker,
  Loader2,
  XCircle,
  FlaskConical,
  Trash2,
  Pencil,
  PowerOff,
  LayoutList,
  Kanban,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getOrders,
  getFormulas,
  createOrder,
  createFormula,
  updateFormula,
  deactivateFormula,
  deleteFormula,
  startOrder,
  completeOrder,
  cancelOrder,
  type ProductionOrderResponse,
  type FormulaResponse,
} from "@/features/production/production.api";
import { getProducts } from "@/features/inventory/inventory.api";

export const Route = createFileRoute("/app/manufacturing")({
  component: ManufacturingPage,
});

const COLUMNS: {
  id: ProductionOrderResponse["status"];
  title: string;
  icon: typeof ListTodo;
  color: string;
}[] = [
  { id: "PENDING", title: "Por Iniciar", icon: ListTodo, color: "text-muted-foreground" },
  { id: "IN_PROGRESS", title: "En Producción", icon: Flame, color: "text-warning" },
  { id: "COMPLETED", title: "Finalizado", icon: CheckCircle2, color: "text-success" },
  { id: "CANCELLED", title: "Cancelados", icon: XCircle, color: "text-destructive" },
];

function emptyFormulaForm() {
  return {
    name: "",
    description: "",
    outputProductId: "",
    outputQty: 1,
    ingredients: [{ _key: "i0", productId: "", quantity: 1 }] as { _key: string; productId: string; quantity: number }[],
  };
}

function ManufacturingPage() {
  const can = usePermissions();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"orders" | "formulas">("orders");

  // Order state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState("");
  const [plannedQty, setPlannedQty] = useState(100);
  const [completeTarget, setCompleteTarget] = useState<ProductionOrderResponse | null>(null);
  const [actualQty, setActualQty] = useState(0);

  // Formula form state
  const [isFormulaSheetOpen, setIsFormulaSheetOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaResponse | null>(null);
  const [formulaForm, setFormulaForm] = useState(emptyFormulaForm());

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<FormulaResponse | null>(null);

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["production", "orders", { limit: 100 }],
    queryFn: () => getOrders({ limit: 100 }),
  });

  const { data: formulas = [], isLoading: loadingFormulas } = useQuery({
    queryKey: ["production", "formulas"],
    queryFn: getFormulas,
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
  });
  const allProducts = productsData?.data ?? [];
  const orders = ordersData?.data ?? [];
  const selectedFormula: FormulaResponse | undefined = formulas.find((f) => f.id === selectedFormulaId);

  const invalidateFormulas = () => qc.invalidateQueries({ queryKey: ["production", "formulas"] });
  const invalidateOrders = () => qc.invalidateQueries({ queryKey: ["production", "orders"] });

  // Order mutations
  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => { toast.success("Orden de producción creada"); setIsNewOrderOpen(false); invalidateOrders(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const startMutation = useMutation({
    mutationFn: startOrder,
    onSuccess: () => { toast.success("Producción iniciada — insumos consumidos por FEFO"); invalidateOrders(); qc.invalidateQueries({ queryKey: ["inventory"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => completeOrder(id, { actualQty: qty }),
    onSuccess: () => { toast.success("Orden completada — producto terminado registrado"); setCompleteTarget(null); invalidateOrders(); qc.invalidateQueries({ queryKey: ["inventory"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => { toast.success("Orden cancelada"); invalidateOrders(); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Formula mutations
  const createFormulaMutation = useMutation({
    mutationFn: createFormula,
    onSuccess: () => { toast.success("Fórmula creada"); closeFormulaSheet(); invalidateFormulas(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateFormulaMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateFormula>[1] }) =>
      updateFormula(id, input),
    onSuccess: () => { toast.success("Fórmula actualizada"); closeFormulaSheet(); invalidateFormulas(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateFormula,
    onSuccess: () => { toast.success("Fórmula desactivada"); invalidateFormulas(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormula,
    onSuccess: () => { toast.success("Fórmula eliminada permanentemente"); setDeleteTarget(null); invalidateFormulas(); },
    onError: (e: Error) => { toast.error(e.message); setDeleteTarget(null); },
  });

  function openCreateFormula() {
    setEditingFormula(null);
    setFormulaForm(emptyFormulaForm());
    setIsFormulaSheetOpen(true);
  }

  function openEditFormula(formula: FormulaResponse) {
    setEditingFormula(formula);
    setFormulaForm({
      name: formula.name,
      description: formula.description ?? "",
      outputProductId: formula.outputProductId,
      outputQty: formula.outputQty,
      ingredients: formula.ingredients.map((i) => ({
        _key: i.id,
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    setIsFormulaSheetOpen(true);
  }

  function closeFormulaSheet() {
    setIsFormulaSheetOpen(false);
    setEditingFormula(null);
    setFormulaForm(emptyFormulaForm());
  }

  function updateIngredient(key: string, patch: { productId?: string; quantity?: number }) {
    setFormulaForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) => (i._key === key ? { ...i, ...patch } : i)),
    }));
  }

  function removeIngredient(key: string) {
    setFormulaForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.length > 1 ? prev.ingredients.filter((i) => i._key !== key) : prev.ingredients,
    }));
  }

  function handleSubmitFormula() {
    const validIngredients = formulaForm.ingredients.filter((i) => i.productId && i.quantity > 0);
    if (!formulaForm.name.trim()) { toast.error("El nombre de la fórmula es requerido"); return; }
    if (!formulaForm.outputProductId) { toast.error("Selecciona el producto de salida"); return; }
    if (formulaForm.outputQty <= 0) { toast.error("La cantidad de salida debe ser mayor a 0"); return; }
    if (validIngredients.length === 0) { toast.error("Agrega al menos un ingrediente"); return; }

    const payload = {
      name: formulaForm.name.trim(),
      description: formulaForm.description || undefined,
      outputProductId: formulaForm.outputProductId,
      outputQty: formulaForm.outputQty,
      ingredients: validIngredients.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    if (editingFormula) {
      updateFormulaMutation.mutate({ id: editingFormula.id, input: payload });
    } else {
      createFormulaMutation.mutate(payload);
    }
  }

  const handleCreateOrder = () => {
    if (!selectedFormulaId) return;
    const orderNumber = `OP-${Date.now().toString().slice(-6)}`;
    createMutation.mutate({ orderNumber, formulaId: selectedFormulaId, plannedQty });
  };

  const isSavingFormula = createFormulaMutation.isPending || updateFormulaMutation.isPending;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
            <Factory className="size-4" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Control de Piso (MRP)</h1>
            <p className="text-xs text-muted-foreground">Órdenes de producción con FEFO automático</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "orders" | "formulas")}>
            <TabsList className="h-8">
              <TabsTrigger value="orders" className="gap-1.5 text-xs px-3">
                <Kanban className="size-3.5" /> Órdenes
              </TabsTrigger>
              <TabsTrigger value="formulas" className="gap-1.5 text-xs px-3">
                <LayoutList className="size-3.5" /> Fórmulas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {can("manage", "production") && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={openCreateFormula}>
                <FlaskConical className="size-4" /> Nueva Fórmula
              </Button>
              {activeTab === "orders" && (
                <Button variant="nuclear" size="sm" className="gap-2" onClick={() => setIsNewOrderOpen(true)}>
                  <Plus className="size-4" /> Nueva Orden
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === "orders" && (
          <div className="h-full overflow-x-auto p-6">
            {loadingOrders ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Cargando órdenes…
              </div>
            ) : (
              <div className="flex h-full min-w-max gap-6">
                {COLUMNS.map((col) => {
                  const columnOrders = orders.filter((o) => o.status === col.id);
                  const Icon = col.icon;
                  return (
                    <div key={col.id} className="flex h-full w-[320px] flex-col rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center justify-between border-b border-border p-4">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", col.color)} />
                          <h3 className="font-semibold text-sm">{col.title}</h3>
                        </div>
                        <span className="flex size-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-muted-foreground shadow-sm">
                          {columnOrders.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {columnOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onStart={() => startMutation.mutate(order.id)}
                            onComplete={() => { setCompleteTarget(order); setActualQty(order.plannedQty); }}
                            onCancel={() => cancelMutation.mutate(order.id)}
                            isWorking={startMutation.isPending || cancelMutation.isPending || completeMutation.isPending}
                            canManage={can("manage", "production")}
                          />
                        ))}
                        {columnOrders.length === 0 && (
                          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/60 bg-transparent">
                            <p className="text-xs text-muted-foreground">Sin órdenes</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "formulas" && (
          <div className="h-full overflow-y-auto p-6">
            {loadingFormulas ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Cargando fórmulas…
              </div>
            ) : formulas.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-muted-foreground">
                <FlaskConical className="size-8 opacity-40" />
                <p className="text-sm">Sin fórmulas registradas</p>
                {can("manage", "production") && (
                  <Button variant="outline" size="sm" onClick={openCreateFormula}>
                    <Plus className="mr-1.5 size-3.5" /> Crear primera fórmula
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {formulas.map((formula) => (
                  <FormulaCard
                    key={formula.id}
                    formula={formula}
                    canManage={can("manage", "production")}
                    onEdit={() => openEditFormula(formula)}
                    onDeactivate={() => deactivateMutation.mutate(formula.id)}
                    onDelete={() => setDeleteTarget(formula)}
                    isWorking={deactivateMutation.isPending || deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Order Sheet */}
      <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Orden de Producción</SheetTitle>
            <SheetDescription>
              Inicia la transformación de materias primas a producto terminado.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <Label>Fórmula / Producto a Fabricar</Label>
              {loadingFormulas ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Cargando fórmulas…
                </div>
              ) : (
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedFormulaId}
                  onChange={(e) => setSelectedFormulaId(e.target.value)}
                >
                  <option value="">— Seleccionar fórmula —</option>
                  {formulas.filter((f) => f.isActive).map((f) => (
                    <option key={f.id} value={f.id}>{f.name} → {f.outputProductName}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-3">
              <Label>Cantidad a Producir</Label>
              <Input type="number" min={1} value={plannedQty} onChange={(e) => setPlannedQty(Number(e.target.value))} />
            </div>
            {selectedFormula && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Beaker className="size-4 text-info" />
                  <h3 className="font-semibold text-sm">Bill of Materials (BOM)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consumo estimado por <b>{plannedQty} unidades</b>:
                </p>
                <div className="rounded-lg border border-border bg-muted/10 divide-y divide-border text-xs">
                  {selectedFormula.ingredients.map((ing) => (
                    <div key={ing.id} className="flex justify-between items-center p-3">
                      <div>
                        <p className="font-medium">{ing.productName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{ing.productSku}</p>
                      </div>
                      <p className="font-bold font-mono">- {(ing.quantity * plannedQty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produce: <strong>{(selectedFormula.outputQty * plannedQty).toFixed(2)} {selectedFormula.outputProductName}</strong>
                </p>
              </div>
            )}
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3">
              <Flame className="size-5 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Al iniciar la orden, los insumos se consumirán automáticamente del inventario usando <b>FEFO</b>.
              </p>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancelar</Button>
            <Button variant="nuclear" onClick={handleCreateOrder} disabled={!selectedFormulaId || createMutation.isPending}>
              {createMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</> : "Crear Orden"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Complete Order Sheet */}
      <Sheet open={!!completeTarget} onOpenChange={(v) => !v && setCompleteTarget(null)}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Completar Orden</SheetTitle>
            <SheetDescription>{completeTarget?.orderNumber} — {completeTarget?.outputProductName}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Cantidad real producida</Label>
              <Input type="number" min={0} value={actualQty} onChange={(e) => setActualQty(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Cantidad planificada: {completeTarget?.plannedQty}</p>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setCompleteTarget(null)}>Cancelar</Button>
            <Button variant="nuclear" disabled={actualQty <= 0 || completeMutation.isPending}
              onClick={() => completeTarget && completeMutation.mutate({ id: completeTarget.id, qty: actualQty })}>
              {completeMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Completando…</> : "Registrar y Cerrar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Formula Create/Edit Sheet */}
      <Sheet open={isFormulaSheetOpen} onOpenChange={(v) => { if (!v) closeFormulaSheet(); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingFormula ? "Editar Fórmula (BOM)" : "Nueva Fórmula (BOM)"}</SheetTitle>
            <SheetDescription>
              {editingFormula ? `Modificando: ${editingFormula.name}` : "Define la receta de producción con ingredientes y cantidades."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Nombre de la fórmula</Label>
              <Input
                value={formulaForm.name}
                onChange={(e) => setFormulaForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Arequipe estándar 1kg"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Input
                value={formulaForm.description}
                onChange={(e) => setFormulaForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descripción de la receta"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Producto de salida (output)</Label>
              <select
                value={formulaForm.outputProductId}
                onChange={(e) => setFormulaForm((p) => ({ ...p, outputProductId: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— Seleccionar producto —</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Cantidad producida por corrida</Label>
              <Input
                type="number" min={0.001} step={0.001}
                value={formulaForm.outputQty}
                onChange={(e) => setFormulaForm((p) => ({ ...p, outputQty: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ingredientes (inputs)</Label>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setFormulaForm((p) => ({
                    ...p,
                    ingredients: [...p.ingredients, { _key: Math.random().toString(36).slice(2), productId: "", quantity: 1 }],
                  }))}>
                  <Plus className="size-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {formulaForm.ingredients.map((ing, idx) => (
                <div key={ing._key} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Ingrediente {idx + 1}</span>
                    {formulaForm.ingredients.length > 1 && (
                      <button type="button" onClick={() => removeIngredient(ing._key)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Producto (materia prima)</Label>
                      <select
                        value={ing.productId}
                        onChange={(e) => updateIngredient(ing._key, { productId: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">— Seleccionar —</option>
                        {allProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Cantidad por corrida</Label>
                      <Input type="number" min={0.001} step={0.001} value={ing.quantity}
                        onChange={(e) => updateIngredient(ing._key, { quantity: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={closeFormulaSheet}>Cancelar</Button>
            <Button variant="nuclear" disabled={isSavingFormula} onClick={handleSubmitFormula}>
              {isSavingFormula
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</>
                : <><Beaker className="mr-2 size-4" /> {editingFormula ? "Guardar Cambios" : "Crear Fórmula"}</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar fórmula permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar <strong>"{deleteTarget?.name}"</strong>? Esta acción no se puede
              deshacer. Si la fórmula tiene órdenes de producción asociadas, la eliminación será rechazada —
              usa <em>Desactivar</em> en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Eliminando…</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormulaCard({
  formula, canManage, onEdit, onDeactivate, onDelete, isWorking,
}: {
  formula: FormulaResponse;
  canManage: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  isWorking: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md",
      !formula.isActive && "opacity-60"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">{formula.name}</h3>
          {formula.description && (
            <p className="text-xs text-muted-foreground truncate">{formula.description}</p>
          )}
        </div>
        <Badge variant={formula.isActive ? "default" : "secondary"} className="shrink-0 text-[10px] h-5">
          {formula.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Output</span>
          <span className="text-xs font-medium truncate max-w-[160px]">{formula.outputProductName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Cantidad/corrida</span>
          <span className="text-xs font-mono font-semibold">{formula.outputQty.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Ingredientes</span>
          <span className="text-xs font-mono font-semibold">{formula.ingredients.length}</span>
        </div>
      </div>

      <div className="pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
        SKU salida: <span className="font-mono">{formula.outputProductSku}</span>
      </div>

      {canManage && (
        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={onEdit} disabled={isWorking}>
            <Pencil className="size-3" /> Editar
          </Button>
          {formula.isActive && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-warning hover:text-warning" onClick={onDeactivate} disabled={isWorking}>
              <PowerOff className="size-3" /> Desactivar
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={onDelete} disabled={isWorking}>
            <Trash2 className="size-3" /> Eliminar
          </Button>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order, onStart, onComplete, onCancel, isWorking, canManage,
}: {
  order: ProductionOrderResponse;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isWorking: boolean;
  canManage: boolean;
}) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{order.orderNumber}</span>
          <h4 className="font-medium text-sm leading-tight mt-1">{order.outputProductName}</h4>
          <span className="text-xs font-mono text-muted-foreground mt-0.5">{order.formulaName}</span>
        </div>
        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
          <button className="text-muted-foreground hover:text-foreground" onClick={onCancel} disabled={isWorking} title="Cancelar orden">
            <MoreVertical className="size-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="bg-surface-2 px-2 py-0.5 rounded text-xs font-mono font-semibold">
          {order.plannedQty} UND plan.
        </span>
        {order.actualQty > 0 && (
          <span className="bg-success/10 text-success px-2 py-0.5 rounded text-xs font-mono font-semibold">
            {order.actualQty} real
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>{new Date(order.createdAt).toLocaleDateString("es-CO")}</span>
        </div>
        {canManage && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {order.status === "PENDING" && (
              <Button variant="nuclear" size="sm" className="h-7 text-xs gap-1" onClick={onStart} disabled={isWorking}>
                <ArrowRight className="size-3" /> Iniciar
              </Button>
            )}
            {order.status === "IN_PROGRESS" && (
              <Button variant="nuclear" size="sm" className="h-7 text-xs gap-1" onClick={onComplete} disabled={isWorking}>
                <Package className="size-3" /> Completar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
