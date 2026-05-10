import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Warehouse,
  Plus,
  LayoutGrid,
  Search,
  MapPin,
  Activity,
  Settings2,
  Grid3X3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/app/warehouses")({
  head: () => ({
    meta: [{ title: "Bodegas · Nuclear WMS" }],
  }),
  component: WarehousesPage,
});

const mockWarehouses = [
  {
    id: "CEDI-ARM-01",
    name: "CEDI Principal Armenia",
    location: "Cra 12 No 9 - 59 Armenia, Quindío",
    capacity: 75,
    zones: ["A (Recepción)", "B (Almacenamiento)", "C (Picking)", "P (Despacho)"],
    status: "active",
    temp: "Ambiente",
  },
  {
    id: "CEDI-CIR-02",
    name: "Planta y Bodega Circasia",
    location: "Cra 9 No 4 - 57 Circasia, Quindío",
    capacity: 88,
    zones: ["A", "B"],
    status: "active",
    temp: "Frío & Ambiente",
  },
  {
    id: "CEDI-BOG-03",
    name: "Punto de Distribución Bogotá",
    location: "Bogotá, Colombia",
    capacity: 92,
    zones: ["A"],
    status: "warning",
    temp: "Ambiente",
  },
];

function WarehousesPage() {
  const [selectedWh, setSelectedWh] = useState<(typeof mockWarehouses)[0] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Bodegas (CEDIs)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Gestión de centros de distribución y ubicaciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            <span>Nueva Bodega</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Label htmlFor="search-warehouses" className="sr-only">
                Buscar bodega
              </Label>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="search-warehouses" placeholder="Buscar bodega..." className="pl-9 h-10 bg-card shadow-sm" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockWarehouses.map((wh) => (
              <button
                type="button"
                key={wh.id}
                onClick={() => setSelectedWh(wh)}
                className="text-left cursor-pointer relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-nuclear"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Warehouse className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold leading-none text-foreground">{wh.name}</h2>
                      <span className="mt-1 block text-xs font-medium text-muted-foreground uppercase">
                        {wh.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 size-4" />
                    <span>{wh.location}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>Ocupación</span>
                      <span className={wh.capacity > 90 ? "text-destructive" : "text-nuclear"}>
                        {wh.capacity}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-nuclear transition-all"
                        style={{
                          width: `${wh.capacity}%`,
                          backgroundColor:
                            wh.capacity > 90 ? "var(--color-destructive)" : "var(--color-nuclear)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <LayoutGrid className="mr-1.5 size-4" />
                      {wh.zones.length} Zonas
                    </span>
                    <span className="text-muted-foreground flex items-center text-xs">
                      <Activity className="mr-1.5 size-4" />
                      {wh.temp}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!selectedWh} onOpenChange={(v) => !v && setSelectedWh(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selectedWh && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selectedWh.id}</p>
                <SheetTitle className="font-display text-xl">{selectedWh.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-1.5 mt-1">
                  <MapPin className="size-3.5" /> {selectedWh.location}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Grid3X3 className="size-4" /> Parametrización Espacial
                  </h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-xs font-medium border-b border-border">
                      Zonas configuradas
                    </div>
                    <div className="divide-y divide-border bg-card">
                      {selectedWh.zones.map((zone) => (
                        <div key={zone} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Zona {zone}</span>
                            <span className="text-xs text-muted-foreground">Alta rotación</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-muted px-1.5 py-0.5 rounded">6 Pasillos</span>
                            <ArrowRight className="size-3" />
                            <span className="bg-muted px-1.5 py-0.5 rounded">
                              12 Estantes/racks
                            </span>
                            <ArrowRight className="size-3" />
                            <span className="bg-muted px-1.5 py-0.5 rounded">4 Niveles</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Settings2 className="mr-2 size-4" />
                    Editar Layout CEDI
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Bodega / CEDI</DialogTitle>
            <DialogDescription>
              Crea un nuevo centro de distribución para tu tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 border-y border-border">
            <div className="space-y-1.5">
              <label htmlFor="cedi-name" className="text-xs font-medium">
                Nombre del CEDI
              </label>
              <Input id="cedi-name" placeholder="Ej. Bodega Norte" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cedi-address" className="text-xs font-medium">
                Dirección
              </label>
              <Input id="cedi-address" placeholder="Ej. Calle 123 #45-67" required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Confirmar creación de CEDI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
