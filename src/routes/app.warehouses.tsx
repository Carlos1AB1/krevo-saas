import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Warehouse, Plus, LayoutGrid, Search, MapPin, Settings2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  getStorageLocations, createStorageLocation, type StorageLocationResponse,
} from "@/features/inventory/inventory.api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/warehouses")({
  head: () => ({ meta: [{ title: "Bodegas · Krevo" }] }),
  component: WarehousesPage,
});

const WAREHOUSE_META: Record<string, { label: string; description: string }> = {
  BODEGA_3:  { label: "Bodega 3",  description: "Insumos de empaque" },
  BODEGA_4:  { label: "Bodega 4",  description: "Materia prima" },
  BODEGA_12: { label: "Bodega 12", description: "Producto terminado + insumos" },
};

function WarehousesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedWh, setSelectedWh] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: locations = [], isLoading, isError } = useQuery({
    queryKey: ["inventory", "storage-locations"],
    queryFn: getStorageLocations,
  });

  const createMutation = useMutation({
    mutationFn: createStorageLocation,
    onSuccess: () => {
      toast.success("Ubicación creada");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["inventory", "storage-locations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const map: Record<string, StorageLocationResponse[]> = {};
    locations.forEach((loc) => {
      if (!map[loc.warehouse]) map[loc.warehouse] = [];
      map[loc.warehouse].push(loc);
    });
    return map;
  }, [locations]);

  const warehouses = Object.keys(WAREHOUSE_META);

  const filteredLocations = useMemo(() => {
    if (!selectedWh) return [];
    const locs = grouped[selectedWh] ?? [];
    const ql = q.toLowerCase();
    if (!ql) return locs;
    return locs.filter((l) =>
      l.code.toLowerCase().includes(ql) || (l.description ?? "").toLowerCase().includes(ql)
    );
  }, [grouped, selectedWh, q]);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      warehouse: fd.get("warehouse") as string,
      zone: fd.get("zone") as string,
      code: fd.get("code") as string,
      description: (fd.get("description") as string) || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Bodegas & Ubicaciones</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Centros de distribución y ubicaciones de almacenamiento.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" /> Nueva Ubicación
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando ubicaciones…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar las bodegas.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {warehouses.map((wh) => {
                const meta = WAREHOUSE_META[wh];
                const locs = grouped[wh] ?? [];
                const zones = [...new Set(locs.map((l) => l.zone))].sort();
                const activeCount = locs.filter((l) => l.isActive).length;

                return (
                  <button key={wh} type="button" onClick={() => setSelectedWh(wh)}
                    className="text-left cursor-pointer relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-nuclear">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Warehouse className="size-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold leading-none text-foreground">{meta.label}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 size-4" />
                        <span>{locs.length} ubicaciones · {activeCount} activas</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <LayoutGrid className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Zonas:</span>
                        {zones.length === 0
                          ? <span className="text-muted-foreground italic">Sin configurar</span>
                          : zones.map((z) => (
                            <span key={z} className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold">{z}</span>
                          ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sheet detalle bodega */}
      <Sheet open={!!selectedWh} onOpenChange={(v) => !v && setSelectedWh(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedWh && (
            <>
              <SheetHeader>
                <SheetTitle>{WAREHOUSE_META[selectedWh].label}</SheetTitle>
                <SheetDescription>{WAREHOUSE_META[selectedWh].description}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar código o descripción…" className="pl-9" />
                </div>

                {filteredLocations.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    Sin ubicaciones configuradas en esta bodega.
                  </p>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-muted-foreground text-xs font-medium">
                        <tr>
                          <th className="px-3 py-2 text-left">Código</th>
                          <th className="px-3 py-2 text-left">Zona</th>
                          <th className="px-3 py-2 text-left">Descripción</th>
                          <th className="px-3 py-2 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {filteredLocations.map((loc) => (
                          <tr key={loc.id} className="hover:bg-muted/20">
                            <td className="px-3 py-2 font-mono font-semibold text-xs">{loc.code}</td>
                            <td className="px-3 py-2">
                              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold">
                                {loc.zone}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{loc.description ?? "—"}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                loc.isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                                {loc.isActive ? "Activa" : "Inactiva"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedWh(null); setCreateOpen(true); }}>
                  <Settings2 className="mr-2 size-4" /> Añadir ubicación en {WAREHOUSE_META[selectedWh].label}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog nueva ubicación */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Ubicación</DialogTitle>
            <DialogDescription>Crea una posición de almacenamiento en una bodega.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="warehouse">Bodega</Label>
                <select name="warehouse" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {warehouses.map((w) => <option key={w} value={w}>{WAREHOUSE_META[w].label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zone">Zona</Label>
                <select name="zone" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {["A", "B", "C", "D"].map((z) => <option key={z} value={z}>Zona {z}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="code">Código (Ej: B12-A-01-03)</Label>
                <Input name="code" placeholder="B12-A-01-03" required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input name="description" placeholder="Estante 1, nivel 3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</> : "Crear ubicación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
