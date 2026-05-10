import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  ArrowUpDown,
  X,
  Boxes,
  Calendar,
  Warehouse,
  TrendingUp,
  Package,
  Loader2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { products, type Product } from "@/lib/wms-mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = ["Todas", "Endulzantes", "Café Molido", "Café en Grano", "Dulces", "Insumos"];
const statuses = ["Todos", "active", "low", "critical"] as const;

const statusMeta: Record<Product["status"], { label: string; cls: string }> = {
  active: { label: "Activo", cls: "bg-success/15 text-success" },
  low: { label: "Bajo", cls: "bg-warning/15 text-warning" },
  critical: { label: "Crítico", cls: "bg-destructive/15 text-destructive" },
  discontinued: { label: "Descontinuado", cls: "bg-muted text-muted-foreground" },
};

const abcMeta: Record<Product["abc"], string> = {
  A: "bg-nuclear/15 text-nuclear",
  B: "bg-reactor/15 text-reactor",
  C: "bg-muted text-muted-foreground",
};

type SortKey = "sku" | "name" | "stock" | "abc";

export function ProductsTable() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Todos");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "sku",
    dir: "asc",
  });
  const [selected, setSelected] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveProduct = () => {
    const sku = (document.getElementById("prod-sku") as HTMLInputElement)?.value;
    const ean = (document.getElementById("prod-ean") as HTMLInputElement)?.value;
    const name = (document.getElementById("prod-name") as HTMLInputElement)?.value;

    const newErrors: Record<string, string> = {};
    if (!sku || sku.length < 3) newErrors.sku = "El SKU es obligatorio y debe tener al menos 3 caracteres.";
    if (!ean || ean.length < 8) newErrors.ean = "El EAN es inválido. Ingresa un código numérico válido.";
    if (!name) newErrors.name = "El nombre y descripción del producto no pueden estar vacíos.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCreateOpen(false);
      toast.success("Producto creado", { description: "El producto ha sido guardado exitosamente." });
    }, 1200);
  };

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const out = products.filter((p) => {
      if (cat !== "Todas" && p.category !== cat) return false;
      if (status !== "Todos" && p.status !== status) return false;
      if (!ql) return true;
      return (
        p.sku.toLowerCase().includes(ql) ||
        p.name.toLowerCase().includes(ql) ||
        p.warehouse.toLowerCase().includes(ql)
      );
    });
    return out.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [q, cat, status, sort]);

  const totals = useMemo(() => {
    return {
      count: filtered.length,
      units: filtered.reduce((a, p) => a + p.stock, 0),
      critical: filtered.filter((p) => p.status === "critical").length,
      classA: filtered.filter((p) => p.abc === "A").length,
    };
  }, [filtered]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inventario · Catálogo maestro
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totals.count} SKUs · {totals.units.toLocaleString("es-CO")} unidades en piso
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.message("Exportando catálogo a CSV…")}
          >
            <Download className="size-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            Importar CSV
          </Button>
          <Button variant="nuclear" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={Package} label="SKUs filtrados" value={totals.count.toString()} />
        <MiniStat icon={Boxes} label="Unidades" value={totals.units.toLocaleString("es-CO")} />
        <MiniStat
          icon={TrendingUp}
          label="Clase A"
          value={totals.classA.toString()}
          tone="nuclear"
        />
        <MiniStat
          icon={Warehouse}
          label="Críticos"
          value={totals.critical.toString()}
          tone="destructive"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Label htmlFor="search-products" className="sr-only">
            Buscar por SKU, nombre o bodega
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por SKU, nombre o bodega…"
            className="pl-9"
          />
        </div>
        <FilterPills label="Categoría" value={cat} options={categories} onChange={setCat} />
        <FilterPills
          label="Estado"
          value={status}
          options={statuses as unknown as string[]}
          onChange={(v) => setStatus(v as (typeof statuses)[number])}
          renderLabel={(v) =>
            v === "active" ? "Activo" : v === "low" ? "Bajo" : v === "critical" ? "Crítico" : v
          }
        />
        {(q || cat !== "Todas" || status !== "Todos") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setCat("Todas");
              setStatus("Todos");
            }}
          >
            <X className="size-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th onClick={() => toggleSort("sku")} active={sort.key === "sku"}>
                  SKU
                </Th>
                <Th onClick={() => toggleSort("name")} active={sort.key === "name"}>
                  Producto
                </Th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider">Categoría</th>
                <Th onClick={() => toggleSort("abc")} active={sort.key === "abc"}>
                  ABC
                </Th>
                <Th onClick={() => toggleSort("stock")} active={sort.key === "stock"} align="right">
                  Stock
                </Th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-right">
                  ROP
                </th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider">Bodega</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider">Estado</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider">Último mov.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-foreground">Sin resultados</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ajusta los filtros o limpia la búsqueda.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const cov = Math.min(100, (p.stock / Math.max(p.rop, 1)) * 100);
                  return (
                    <motion.tr
                      key={p.sku}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.2) }}
                    >
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="block w-full text-left font-mono text-xs text-muted-foreground hover:text-foreground"
                        >
                          {p.sku}
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="block w-full text-left font-medium text-foreground hover:underline"
                        >
                          {p.name}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{p.category}</td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="block w-full text-left"
                        >
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold",
                              abcMeta[p.abc],
                            )}
                          >
                            {p.abc}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(p)}
                          className="block w-full text-right font-mono"
                        >
                          <div className="ml-auto flex max-w-[140px] items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  p.status === "critical"
                                    ? "bg-destructive"
                                    : p.status === "low"
                                      ? "bg-warning"
                                      : "bg-success",
                                )}
                                style={{ width: `${cov}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs">
                              {p.stock.toLocaleString("es-CO")}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground">
                        {p.rop}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{p.warehouse}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            statusMeta[p.status].cls,
                          )}
                        >
                          {statusMeta[p.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {p.lastMovement}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer detalle */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          {selected && <ProductDetail product={selected} />}
        </SheetContent>
      </Sheet>

      {/* Sheet nuevo producto */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Producto al Catálogo Maestro</SheetTitle>
            <SheetDescription>
              Parametrización de artículos, costos, UoM y variables logísticas.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-base font-semibold border-b pb-2">Información Básica</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-sku">SKU</Label>
                  <Input id="prod-sku" placeholder="Ej. CQ-CAF-04" required className={errors.sku ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.sku && <p className="text-[11px] font-medium text-destructive">{errors.sku}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-ean">Código de Barras (EAN-13)</Label>
                  <Input id="prod-ean" placeholder="Ej. 7701234567890" required className={errors.ean ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.ean && <p className="text-[11px] font-medium text-destructive">{errors.ean}</p>}
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="prod-name">Nombre / Descripción</Label>
                  <Input id="prod-name" placeholder="Ej. Café Molido 500g" required className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.name && <p className="text-[11px] font-medium text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-category">Categoría</Label>
                  <select
                    id="prod-category"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option>Materia Prima</option>
                    <option>Insumos (Empaques)</option>
                    <option>Producto Terminado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-semibold border-b pb-2">
                Unidades de Medida y Conversiones
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-uom">Unidad Base (UoM)</Label>
                  <select
                    id="prod-uom"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option>Unidad</option>
                    <option>Bolsa</option>
                    <option>Caja</option>
                    <option>Kg</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-conv-box" className="text-xs font-medium text-foreground">
                    Factor de Conversión (Empaque)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs whitespace-nowrap">1 Caja =</span>
                    <Input
                      id="prod-conv-box"
                      type="number"
                      placeholder="24"
                      className="w-20"
                      required
                      min="1"
                    />
                    <span className="text-xs text-muted-foreground">UoM</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-conv-pallet" className="text-xs font-medium text-foreground">
                    Estiba (Pallet)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs whitespace-nowrap">1 Estiba =</span>
                    <Input
                      id="prod-conv-pallet"
                      type="number"
                      placeholder="40"
                      className="w-20"
                      required
                      min="1"
                    />
                    <span className="text-xs text-muted-foreground">Cajas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-semibold border-b pb-2">
                Tiempos y Costos para EOQ/ROP
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-lead">Lead Time (Tiempo de Entrega)</Label>
                  <div className="flex gap-2">
                    <Input id="prod-lead" type="number" placeholder="5" required min="0" />
                    <span className="flex items-center text-xs text-muted-foreground">Días</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-cost">Costo de Pedir (S)</Label>
                  <div className="flex gap-2">
                    <Input id="prod-cost" type="number" placeholder="15000" required min="0" />
                    <span className="flex items-center text-xs text-muted-foreground">COP</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-maintenance">Costo Mantenimiento % (H)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="prod-maintenance"
                      type="number"
                      placeholder="15"
                      required
                      min="0"
                      max="100"
                    />
                    <span className="flex items-center text-xs text-muted-foreground">% / año</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-policy">Política (Insumo vs Terminado)</Label>
                  <select
                    id="prod-policy"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option>Revisión Continua (Q)</option>
                    <option>Revisión Periódica (P)</option>
                    <option>FEFO (Producto Terminado)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button variant="nuclear" onClick={handleSaveProduct} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {isSaving ? "Guardando..." : "Guardar Producto"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar productos desde CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo con columnas:{" "}
              <span className="font-mono text-xs">sku, name, category, uom, rop, cost</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border-2 border-dashed border-border bg-surface-2 p-8 text-center">
            <Upload className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Arrastra tu CSV aquí</p>
            <p className="mt-1 text-xs text-muted-foreground">o haz clic para seleccionar</p>
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" className="mt-3 pointer-events-none">
                Seleccionar archivo
              </Button>
            </label>
            <Input type="file" id="csv-upload" className="hidden" accept=".csv" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="nuclear"
              onClick={() => {
                setImportOpen(false);
                toast.success("Importación procesada", {
                  description: "12 productos validados · 0 errores",
                });
              }}
            >
              Validar e importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  align,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  align?: "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 select-none",
        align === "right" && "text-right",
        active && "text-foreground",
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-foreground transition-colors",
            align === "right" && "ml-auto",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {children}
          <ArrowUpDown className="size-3 opacity-50" />
        </button>
      ) : (
        <span className={cn("inline-flex items-center gap-1", align === "right" && "ml-auto")}>
          {children}
        </span>
      )}
    </th>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Package;
  label: string;
  value: string;
  tone?: "default" | "nuclear" | "destructive";
}) {
  const toneCls =
    tone === "nuclear"
      ? "text-nuclear"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="grid size-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("font-display text-lg font-semibold", toneCls)}>{value}</p>
      </div>
    </div>
  );
}

function FilterPills({
  label,
  value,
  options,
  onChange,
  renderLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  renderLabel?: (v: string) => string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Filter className="size-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              value === o
                ? "border-nuclear bg-nuclear/10 text-nuclear"
                : "border-border bg-background text-muted-foreground hover:bg-accent",
            )}
          >
            {renderLabel ? renderLabel(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const cov = Math.min(100, (product.stock / Math.max(product.rop, 1)) * 100);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteOpen(false);
      toast.success("Producto eliminado", { description: "El SKU ha sido removido del sistema." });
    }, 1000);
  };

  return (
    <>
      <SheetHeader>
        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
        <SheetTitle className="font-display text-xl">{product.name}</SheetTitle>
        <SheetDescription>
          {product.category} · {product.uom}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <DetailStat
            label="Stock actual"
            value={product.stock.toLocaleString("es-CO")}
            hint={product.uom}
          />
          <DetailStat
            label="Punto de reorden"
            value={product.rop.toString()}
            hint="Umbral dinámico"
          />
          <DetailStat
            label="Costo unitario"
            value={`$${product.cost.toLocaleString("es-CO")}`}
            hint="COP"
          />
          <DetailStat label="Clase ABC" value={product.abc} hint="Análisis Pareto" />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cobertura
            </p>
            <span className="font-mono text-xs">{cov.toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                "h-full rounded-full",
                product.status === "critical"
                  ? "bg-destructive"
                  : product.status === "low"
                    ? "bg-warning"
                    : "bg-success",
              )}
              style={{ width: `${cov}%` }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ubicación
          </p>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-medium">{product.warehouse}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Último movimiento {product.lastMovement}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acciones
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="size-4 mr-2" />
              Ver lotes
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="size-4 mr-2" />
              Histórico
            </Button>
            <Button variant="outline" size="sm" className="col-span-2">
              Ajustar stock
            </Button>
            <Button variant="destructive" size="sm" className="col-span-2 mt-4" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4 mr-2" />
              Eliminar Producto (Irreversible)
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará permanentemente el producto{" "}
              <span className="font-semibold text-foreground">{product.sku}</span> del catálogo
              maestro y no podrá ser utilizado en futuras órdenes o recepciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isDeleting ? "Eliminando..." : "Sí, eliminar producto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
