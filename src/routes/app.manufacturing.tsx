import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  getOrders,
  getFormulas,
  createOrder,
  createFormula,
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

function ManufacturingPage() {
  const qc = useQueryClient();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState("");
  const [plannedQty, setPlannedQty] = useState(100);
  const [completeTarget, setCompleteTarget] = useState<ProductionOrderResponse | null>(null);
  const [actualQty, setActualQty] = useState(0);

  const [isNewFormulaOpen, setIsNewFormulaOpen] = useState(false);
  const [formulaName, setFormulaName] = useState("");
  const [formulaDescription, setFormulaDescription] = useState("");
  const [formulaOutputProductId, setFormulaOutputProductId] = useState("");
  const [formulaOutputQty, setFormulaOutputQty] = useState(1);
  const [formulaIngredients, setFormulaIngredients] = useState<{ _key: string; productId: string; quantity: number }[]>([
    { _key: "i0", productId: "", quantity: 1 },
  ]);

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["production", "orders", { limit: 100 }],
    queryFn: () => getOrders({ limit: 100 }),
  });

  const { data: formulas = [], isLoading: loadingFormulas } = useQuery({
    queryKey: ["production", "formulas"],
    queryFn: getFormulas,
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 200 }],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const allProducts = productsData?.data ?? [];

  const orders = ordersData?.data ?? [];

  const selectedFormula: FormulaResponse | undefined = formulas.find((f) => f.id === selectedFormulaId);

  const invalidateOrders = () => qc.invalidateQueries({ queryKey: ["production", "orders"] });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Orden de producción creada");
      setIsNewOrderOpen(false);
      invalidateOrders();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startMutation = useMutation({
    mutationFn: startOrder,
    onSuccess: () => {
      toast.success("Producción iniciada — insumos consumidos por FEFO");
      invalidateOrders();
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => completeOrder(id, { actualQty: qty }),
    onSuccess: () => {
      toast.success("Orden completada — producto terminado registrado en inventario");
      setCompleteTarget(null);
      invalidateOrders();
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Orden cancelada");
      invalidateOrders();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createFormulaMutation = useMutation({
    mutationFn: createFormula,
    onSuccess: () => {
      toast.success("Fórmula creada");
      setIsNewFormulaOpen(false);
      resetFormulaForm();
      qc.invalidateQueries({ queryKey: ["production", "formulas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetFormulaForm() {
    setFormulaName("");
    setFormulaDescription("");
    setFormulaOutputProductId("");
    setFormulaOutputQty(1);
    setFormulaIngredients([{ _key: "i0", productId: "", quantity: 1 }]);
  }

  function updateIngredient(key: string, patch: { productId?: string; quantity?: number }) {
    setFormulaIngredients((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));
  }

  function removeIngredient(key: string) {
    setFormulaIngredients((prev) => (prev.length > 1 ? prev.filter((i) => i._key !== key) : prev));
  }

  function handleSubmitFormula() {
    const validIngredients = formulaIngredients.filter((i) => i.productId && i.quantity > 0);
    if (!formulaName.trim()) { toast.error("El nombre de la fórmula es requerido"); return; }
    if (!formulaOutputProductId) { toast.error("Selecciona el producto de salida"); return; }
    if (formulaOutputQty <= 0) { toast.error("La cantidad de salida debe ser mayor a 0"); return; }
    if (validIngredients.length === 0) { toast.error("Agrega al menos un ingrediente"); return; }
    createFormulaMutation.mutate({
      name: formulaName.trim(),
      description: formulaDescription || undefined,
      outputProductId: formulaOutputProductId,
      outputQty: formulaOutputQty,
      ingredients: validIngredients.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
  }

  const handleCreateOrder = () => {
    if (!selectedFormulaId) return;
    const orderNumber = `OP-${Date.now().toString().slice(-6)}`;
    createMutation.mutate({ orderNumber, formulaId: selectedFormulaId, plannedQty });
  };

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsNewFormulaOpen(true)}>
            <FlaskConical className="size-4" /> Nueva Fórmula
          </Button>
          <Button variant="nuclear" size="sm" className="gap-2" onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="size-4" /> Nueva Orden
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
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
                    <option key={f.id} value={f.id}>
                      {f.name} → {f.outputProductName}
                    </option>
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
                      <div className="text-right">
                        <p className="font-bold font-mono">- {(ing.quantity * plannedQty).toFixed(2)}</p>
                      </div>
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
                Al iniciar la orden, los insumos se consumirán automáticamente del inventario usando <b>FEFO</b> (primer lote en vencer, primero en salir).
              </p>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancelar</Button>
            <Button variant="nuclear" onClick={handleCreateOrder}
              disabled={!selectedFormulaId || createMutation.isPending}>
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
            <SheetDescription>
              {completeTarget?.orderNumber} — {completeTarget?.outputProductName}
            </SheetDescription>
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
            <Button variant="nuclear"
              disabled={actualQty <= 0 || completeMutation.isPending}
              onClick={() => completeTarget && completeMutation.mutate({ id: completeTarget.id, qty: actualQty })}>
              {completeMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Completando…</> : "Registrar y Cerrar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* New Formula Sheet */}
      <Sheet open={isNewFormulaOpen} onOpenChange={(v) => { if (!v) { setIsNewFormulaOpen(false); resetFormulaForm(); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Fórmula (BOM)</SheetTitle>
            <SheetDescription>Define la receta de producción con ingredientes y cantidades.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label>Nombre de la fórmula</Label>
              <Input value={formulaName} onChange={(e) => setFormulaName(e.target.value)} placeholder="Arequipe estándar 1kg" />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Input value={formulaDescription} onChange={(e) => setFormulaDescription(e.target.value)} placeholder="Descripción de la receta" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Producto de salida (output)</Label>
                <select
                  value={formulaOutputProductId}
                  onChange={(e) => setFormulaOutputProductId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Seleccionar producto —</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Cantidad producida por corrida</Label>
                <Input type="number" min={0.001} step={0.001} value={formulaOutputQty}
                  onChange={(e) => setFormulaOutputQty(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ingredientes (inputs)</Label>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setFormulaIngredients((p) => [...p, { _key: Math.random().toString(36).slice(2), productId: "", quantity: 1 }])}>
                  <Plus className="size-3.5 mr-1" /> Agregar
                </Button>
              </div>
              {formulaIngredients.map((ing, idx) => (
                <div key={ing._key} className="rounded-lg border border-border bg-muted/10 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Ingrediente {idx + 1}</span>
                    {formulaIngredients.length > 1 && (
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
            <Button variant="outline" onClick={() => { setIsNewFormulaOpen(false); resetFormulaForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createFormulaMutation.isPending} onClick={handleSubmitFormula}>
              {createFormulaMutation.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</>
                : <><Beaker className="mr-2 size-4" /> Crear Fórmula</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrderCard({
  order, onStart, onComplete, onCancel, isWorking,
}: {
  order: ProductionOrderResponse;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isWorking: boolean;
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
      </div>
    </div>
  );
}
