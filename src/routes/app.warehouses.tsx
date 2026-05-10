import { createFileRoute } from "@tanstack/react-router";
import { Warehouse, Plus, LayoutGrid, Search, MapPin, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    zones: ["A", "B", "C", "P"],
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
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            <span>Nueva Bodega</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar bodega..." className="pl-9 h-10 bg-card shadow-sm" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockWarehouses.map((wh) => (
              <div
                key={wh.id}
                className="relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Warehouse className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-none">{wh.name}</h3>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
