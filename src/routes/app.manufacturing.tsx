import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
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

export const Route = createFileRoute("/app/manufacturing")({
  component: ManufacturingPage,
});

type OrderStatus = "pending" | "marmita" | "empaque" | "completed";

interface ManufacturingOrder {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  status: OrderStatus;
  priority: "high" | "medium" | "low";
  createdAt: string;
  assignee: string;
}

const mockOrders: ManufacturingOrder[] = [
  {
    id: "OP-1024",
    productName: "Cafequipe 6x50 GR",
    sku: "PT-CQ-6X50",
    quantity: 500,
    status: "pending",
    priority: "high",
    createdAt: "Hace 2 horas",
    assignee: "Jefe de Producción",
  },
  {
    id: "OP-1025",
    productName: "Arequipe de Macadamia x 125 GR",
    sku: "PT-ARE-MAC125",
    quantity: 120,
    status: "marmita",
    priority: "medium",
    createdAt: "Hace 5 horas",
    assignee: "Operario L2",
  },
  {
    id: "OP-1021",
    productName: "Galleta de Café Display",
    sku: "PT-GAL-35",
    quantity: 300,
    status: "empaque",
    priority: "high",
    createdAt: "Ayer",
    assignee: "Operario L1",
  },
  {
    id: "OP-1019",
    productName: "Cuyabrito de Macadamia Cuadrado",
    sku: "PT-CUY-MAC",
    quantity: 80,
    status: "completed",
    priority: "low",
    createdAt: "Hace 2 días",
    assignee: "Jefe de Producción",
  },
];

const COLUMNS = [
  { id: "pending", title: "Por Iniciar", icon: ListTodo, color: "text-muted-foreground" },
  { id: "marmita", title: "En Marmita / Cocción", icon: Flame, color: "text-warning" },
  { id: "empaque", title: "Dosificación y Empaque", icon: Package, color: "text-info" },
  { id: "completed", title: "Finalizado (Bodega 3)", icon: CheckCircle2, color: "text-success" },
] as const;

function ManufacturingPage() {
  const [orders, setOrders] = useState<ManufacturingOrder[]>(mockOrders);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState("cafequipe-250");
  const [produceQty, setProduceQty] = useState(100);

  const BOM = {
    "cafequipe-250": [
      { sku: "INS-LCH-01", name: "Leche Líquida", qty: 2.5 * produceQty, uom: "Litros", stock: 1255 },
      { sku: "INS-AZU-01", name: "Azúcar", qty: 0.8 * produceQty, uom: "Kg", stock: 696 },
      { sku: "INS-ENV-250", name: "Envase Cafequipe 250g", qty: produceQty, uom: "Und", stock: 1500 },
    ],
    "macadamia-125": [
      { sku: "INS-LCH-01", name: "Leche Líquida", qty: 1.2 * produceQty, uom: "Litros", stock: 1255 },
      { sku: "INS-AZU-01", name: "Azúcar", qty: 0.4 * produceQty, uom: "Kg", stock: 696 },
      { sku: "INS-MAC-01", name: "Macadamia Simple", qty: 0.15 * produceQty, uom: "Kg", stock: 13 },
      { sku: "INS-ENV-125", name: "Envase Cafequipe 125g", qty: produceQty, uom: "Und", stock: 800 },
    ]
  };

  const handleCreateOrder = () => {
    const newOrder: ManufacturingOrder = {
      id: `OP-${1026 + orders.length}`,
      productName: selectedRecipe === "cafequipe-250" ? "Cafequipe x 250 GR" : "Arequipe de Macadamia x 125 GR",
      sku: selectedRecipe === "cafequipe-250" ? "PT-CQ-250" : "PT-ARE-MAC125",
      quantity: produceQty,
      status: "pending",
      priority: "medium",
      createdAt: "Ahora",
      assignee: "Jefe de Producción",
    };
    setOrders([newOrder, ...orders]);
    setIsNewOrderOpen(false);
  };

  const moveOrder = (orderId: string, direction: "next" | "prev") => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;

        const currentStatusIdx = COLUMNS.findIndex((c) => c.id === order.status);
        let nextIdx = direction === "next" ? currentStatusIdx + 1 : currentStatusIdx - 1;
        
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx >= COLUMNS.length) nextIdx = COLUMNS.length - 1;

        return { ...order, status: COLUMNS[nextIdx].id };
      })
    );
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
            <p className="text-xs text-muted-foreground">Flujo de transformación y consumo de Bodega 12 a Bodega 3</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="nuclear" size="sm" className="gap-2" onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="size-4" /> Nueva Orden
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
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
                    <div
                      key={order.id}
                      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                            {order.id}
                          </span>
                          <h4 className="font-medium text-sm leading-tight mt-1">{order.productName}</h4>
                          <span className="text-xs font-mono text-muted-foreground mt-0.5">{order.sku}</span>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-surface-2 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                          {order.quantity} UND
                        </span>
                        {order.priority === "high" && (
                          <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            Urgente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{order.createdAt}</span>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {order.status !== "pending" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-6 h-6"
                              onClick={() => moveOrder(order.id, "prev")}
                            >
                              <ArrowRight className="size-3 rotate-180" />
                            </Button>
                          )}
                          {order.status !== "completed" && (
                            <Button
                              variant="nuclear"
                              size="icon"
                              className="size-6 h-6"
                              onClick={() => moveOrder(order.id, "next")}
                            >
                              <ArrowRight className="size-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
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
      </main>

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
              <Label>Receta / Producto a Fabricar</Label>
              <select
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
              >
                <option value="cafequipe-250">Cafequipe x 250 GR (PT-CQ-250)</option>
                <option value="macadamia-125">Arequipe de Macadamia x 125 GR (PT-ARE-MAC125)</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Cantidad a Producir (Unidades)</Label>
              <Input
                type="number"
                min={1}
                value={produceQty}
                onChange={(e) => setProduceQty(Number(e.target.value))}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Beaker className="size-4 text-info" />
                <h3 className="font-semibold text-sm">Bill of Materials (BOM)</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Consumo estimado desde <b>Bodega 12 (Materia Prima)</b>:
              </p>
              
              <div className="rounded-lg border border-border bg-muted/10 divide-y divide-border text-xs">
                {BOM[selectedRecipe as keyof typeof BOM].map((item) => {
                  const hasStock = item.stock >= item.qty;
                  return (
                    <div key={item.sku} className="flex justify-between items-center p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-bold font-mono", hasStock ? "text-foreground" : "text-destructive")}>
                          - {item.qty.toFixed(1)} {item.uom}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Stock: {item.stock}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3">
              <Flame className="size-5 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Al confirmar, estos insumos se reservarán en Bodega 12. Solo se descargarán del Kárdex definitivamente y se sumarán a Bodega 3 cuando la orden pase a estado <b>Finalizado</b>.
              </p>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancelar</Button>
            <Button variant="nuclear" onClick={handleCreateOrder}>Crear Orden y Consumir Insumos</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
