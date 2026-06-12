import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Filter, Plus, ArrowUpDown, X,
  Boxes, Calendar, Warehouse, TrendingUp, Package, Loader2, Trash2, MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  getProducts, getCategories, createProduct, createCategory, getLots, getMovements,
  type ProductResponse,
} from "@/features/inventory/inventory.api";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

type SortKey = "sku" | "name" | "abcClass";
type DetailTab = "details" | "lots" | "movements";

const abcMeta: Record<string, string> = {
  A: "bg-nuclear/15 text-nuclear",
  B: "bg-reactor/15 text-reactor",
  C: "bg-muted text-muted-foreground",
};

export function ProductsTable() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "sku", dir: "asc" });
  const [selected, setSelected] = useState<ProductResponse | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("details");
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "products", { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["inventory", "categories"],
    queryFn: getCategories,
  });

  // All active lots for stock computation
  const { data: allLotsData } = useQuery({
    queryKey: ["inventory", "lots", { limit: 100, status: "ACTIVE" }],
    queryFn: () => getLots({ limit: 100, status: "ACTIVE" }),
  });

  const stockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    (allLotsData?.data ?? []).forEach((l) => {
      map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity);
    });
    return map;
  }, [allLotsData]);

  const { data: lotsData, isLoading: lotsLoading } = useQuery({
    queryKey: ["inventory", "lots", { productId: selected?.id }],
    queryFn: () => getLots({ productId: selected!.id, limit: 100 }),
    enabled: !!selected && detailTab === "lots",
  });

  const { data: movementsData, isLoading: movsLoading } = useQuery({
    queryKey: ["inventory", "movements", { productId: selected?.id }],
    queryFn: () => getMovements({ productId: selected!.id, limit: 100 }),
    enabled: !!selected && detailTab === "movements",
  });

  const productLots = lotsData?.data ?? [];
  const productMovements = movementsData?.data ?? [];

  const products = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Producto creado");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["inventory", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Categoría creada");
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      qc.invalidateQueries({ queryKey: ["inventory", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return products
      .filter((p) => {
        if (catFilter && p.categoryId !== catFilter) return false;
        if (!ql) return true;
        return p.sku.toLowerCase().includes(ql) || p.name.toLowerCase().includes(ql);
      })
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
      });
  }, [products, q, catFilter, sort]);

  const totals = useMemo(() => ({
    count: filtered.length,
    classA: filtered.filter((p) => p.abcClass === "A").length,
    inactive: filtered.filter((p) => !p.isActive).length,
    perishable: filtered.filter((p) => p.isPerishable).length,
  }), [filtered]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      sku: fd.get("sku") as string,
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      unit: fd.get("unit") as string,
      categoryId: fd.get("categoryId") as string,
      minStock: Number(fd.get("minStock") ?? 0),
      isPerishable: fd.get("isPerishable") === "true",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inventario · Catálogo maestro</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Cargando…" : `${totals.count} SKUs registrados`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateCategoryOpen(true)}>
            <Plus className="size-4" /> Nueva categoría
          </Button>
          <Button variant="nuclear" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={Package} label="SKUs filtrados" value={String(totals.count)} />
        <MiniStat icon={TrendingUp} label="Clase A" value={String(totals.classA)} tone="nuclear" />
        <MiniStat icon={Boxes} label="Perecederos" value={String(totals.perishable)} />
        <MiniStat icon={Warehouse} label="Inactivos" value={String(totals.inactive)} tone="destructive" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por SKU o nombre…" className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Categoría:</span>
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => setCatFilter("")}
              className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", !catFilter ? "border-nuclear bg-nuclear/10 text-nuclear" : "border-border bg-background text-muted-foreground hover:bg-accent")}>
              Todas
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => setCatFilter(c.id)}
                className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", catFilter === c.id ? "border-nuclear bg-nuclear/10 text-nuclear" : "border-border bg-background text-muted-foreground hover:bg-accent")}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {(q || catFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); setCatFilter(""); }}>
            <X className="size-3.5" /> Limpiar
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Cargando productos…
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No fue posible cargar los productos. Verifica que el servidor esté activo.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <Th onClick={() => toggleSort("sku")} active={sort.key === "sku"}>SKU</Th>
                  <Th onClick={() => toggleSort("name")} active={sort.key === "name"}>Producto</Th>
                  <th className="px-3 py-2.5">Categoría</th>
                  <Th onClick={() => toggleSort("abcClass")} active={sort.key === "abcClass"}>ABC</Th>
                  <th className="px-3 py-2.5">Unidad</th>
                  <th className="px-3 py-2.5 text-right">Stock actual</th>
                  <th className="px-3 py-2.5 text-right">Stock mín.</th>
                  <th className="px-3 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                      Sin resultados — ajusta los filtros.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.2) }}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(p)}>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.sku}</td>
                      <td className="px-3 py-2.5 font-medium">{p.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.category.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold", abcMeta[p.abcClass])}>
                          {p.abcClass}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.unit}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {(() => {
                          const stock = stockByProduct.get(p.id) ?? 0;
                          const belowMin = p.minStock > 0 && stock < p.minStock;
                          return (
                            <span className={cn("font-semibold", belowMin ? "text-destructive" : stock > 0 ? "text-success" : "text-muted-foreground")}>
                              {stock.toLocaleString("es-CO")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">{p.minStock}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          p.isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </span>
                        {(() => {
                          const stock = stockByProduct.get(p.id) ?? 0;
                          const belowMin = p.minStock > 0 && stock <= p.minStock;
                          const outOfStock = stock === 0;
                          
                          if (outOfStock) {
                            return <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Sin Stock</span>;
                          }
                          if (belowMin) {
                            return <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">Stock Bajo</span>;
                          }
                          return null;
                        })()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle */}
      <Sheet open={!!selected} onOpenChange={(v) => { if (!v) { setSelected(null); setDetailTab("details"); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selected.sku}</p>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.category.name} · {selected.unit}</SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex gap-1 border-b border-border pb-1">
                {(["details", "lots", "movements"] as DetailTab[]).map((tab) => (
                  <button key={tab} type="button"
                    onClick={() => setDetailTab(tab)}
                    className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      detailTab === tab ? "bg-nuclear/10 text-nuclear" : "text-muted-foreground hover:text-foreground")}>
                    {tab === "details" ? "Detalles" : tab === "lots" ? "Lotes" : "Movimientos"}
                  </button>
                ))}
              </div>

              {detailTab === "details" && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Clase ABC" value={selected.abcClass} />
                    <StatBox label="Stock actual" value={(stockByProduct.get(selected.id) ?? 0).toLocaleString("es-CO")} tone={
                      (stockByProduct.get(selected.id) ?? 0) === 0 ? "destructive" :
                      selected.minStock > 0 && (stockByProduct.get(selected.id) ?? 0) < selected.minStock ? "warning" : "success"
                    } />
                    <StatBox label="Stock mínimo" value={String(selected.minStock)} />
                    <StatBox label="Stock máximo" value={selected.maxStock ? String(selected.maxStock) : "—"} />
                    <StatBox label="Perecedero" value={selected.isPerishable ? "Sí" : "No"} />
                  </div>
                  {selected.description && (
                    <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">{selected.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetailTab("lots")}>
                      <Calendar className="size-4 mr-2" /> Ver lotes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetailTab("movements")}>
                      <TrendingUp className="size-4 mr-2" /> Movimientos
                    </Button>
                  </div>
                </div>
              )}

              {detailTab === "lots" && (
                <div className="mt-4 space-y-3">
                  {lotsLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="mr-2 size-4 animate-spin" /> Cargando lotes…
                    </div>
                  ) : productLots.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">Sin lotes activos para este producto.</p>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden text-sm">
                      <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground text-xs font-medium">
                          <tr>
                            <th className="px-3 py-2">Lote</th>
                            <th className="px-3 py-2 text-right">Cantidad</th>
                            <th className="px-3 py-2">Vence</th>
                            <th className="px-3 py-2">Ubicación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {productLots.map((lot) => {
                            const days = lot.expirationDate
                              ? differenceInDays(parseISO(lot.expirationDate), new Date())
                              : null;
                            return (
                              <tr key={lot.id} className="hover:bg-muted/20">
                                <td className="px-3 py-2 font-mono text-xs font-semibold">{lot.lotNumber}</td>
                                <td className="px-3 py-2 text-right font-mono">{lot.quantity}</td>
                                <td className="px-3 py-2 text-xs">
                                  {lot.expirationDate ? (
                                    <span className={cn(days !== null && days <= 30 ? "text-warning font-semibold" : "")}>
                                      {format(parseISO(lot.expirationDate), "dd MMM yy", { locale: es })}
                                      {days !== null && <span className="ml-1 text-muted-foreground">({days}d)</span>}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="size-3" />
                                    {lot.storageLocation?.code ?? "—"}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {detailTab === "movements" && (
                <div className="mt-4 space-y-3">
                  {movsLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="mr-2 size-4 animate-spin" /> Cargando movimientos…
                    </div>
                  ) : productMovements.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">Sin movimientos registrados.</p>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden text-sm">
                      <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground text-xs font-medium">
                          <tr>
                            <th className="px-3 py-2">Tipo</th>
                            <th className="px-3 py-2 text-right">Cant.</th>
                            <th className="px-3 py-2 text-right">Stock tras</th>
                            <th className="px-3 py-2">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {productMovements.map((mov) => (
                            <tr key={mov.id} className="hover:bg-muted/20">
                              <td className="px-3 py-2">
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  mov.type === "RECEIPT" ? "bg-success/15 text-success" :
                                  mov.type === "DISPATCH" ? "bg-warning/15 text-warning" :
                                  mov.type === "TRANSFER" ? "bg-info/15 text-info" :
                                  "bg-muted text-muted-foreground")}>
                                  {mov.type === "RECEIPT" ? "Entrada" : mov.type === "DISPATCH" ? "Salida" : mov.type === "TRANSFER" ? "Traslado" : "Ajuste"}
                                </span>
                              </td>
                              <td className={cn("px-3 py-2 text-right font-mono font-semibold",
                                mov.quantity >= 0 ? "text-success" : "text-destructive")}>
                                {mov.quantity >= 0 ? "+" : ""}{mov.quantity}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-xs">{mov.stockAfter}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                {format(parseISO(mov.createdAt), "dd MMM yy", { locale: es })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Crear categoría */}
      <Sheet open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
        <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Categoría</SheetTitle>
            <SheetDescription>Crea una categoría para agrupar productos en el catálogo.</SheetDescription>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCategoryName.trim()) { toast.error("El nombre es requerido"); return; }
              createCategoryMutation.mutate({ name: newCategoryName.trim(), description: newCategoryDesc || undefined });
            }}
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="catName">Nombre</Label>
              <Input id="catName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ej: Materias Primas" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="catDesc">Descripción (opcional)</Label>
              <Input id="catDesc" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} placeholder="Descripción breve" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateCategoryOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="nuclear" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</> : "Crear Categoría"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Crear producto */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Producto</SheetTitle>
            <SheetDescription>Agrega un SKU al catálogo maestro.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="MP-LECHE-001" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unidad</Label>
                <select name="unit" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="UN">Unidad (UN)</option>
                  <option value="KG">Kilogramo (KG)</option>
                  <option value="L">Litro (L)</option>
                  <option value="G">Gramo (G)</option>
                  <option value="ML">Mililitro (ML)</option>
                  <option value="BOX">Caja (BOX)</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Leche entera cruda" required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input id="description" name="description" placeholder="Descripción breve" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Categoría</Label>
                <select name="categoryId" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">— Seleccionar —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minStock">Stock mínimo</Label>
                <Input id="minStock" name="minStock" type="number" min={0} defaultValue={0} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isPerishable" name="isPerishable" value="true" className="size-4" />
                <Label htmlFor="isPerishable">Producto perecedero (FEFO)</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="nuclear" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</> : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Th({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <th className={cn("px-3 py-2.5 select-none", active && "text-foreground")}>
      {onClick ? (
        <button type="button" onClick={onClick}
          className={cn("inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-foreground transition-colors",
            active ? "text-foreground" : "text-muted-foreground")}>
          {children}<ArrowUpDown className="size-3 opacity-50" />
        </button>
      ) : <span className="inline-flex items-center gap-1">{children}</span>}
    </th>
  );
}

function MiniStat({ icon: Icon, label, value, tone = "default" }: {
  icon: typeof Package; label: string; value: string; tone?: "default" | "nuclear" | "destructive";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="grid size-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn("font-display text-lg font-semibold",
          tone === "nuclear" ? "text-nuclear" : tone === "destructive" ? "text-destructive" : "text-foreground")}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "destructive" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-semibold",
        tone === "success" ? "text-success" :
        tone === "warning" ? "text-warning" :
        tone === "destructive" ? "text-destructive" : "")}>
        {value}
      </p>
    </div>
  );
}
