import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpFromLine,
  Search,
  Filter,
  ScanBarcode,
  Truck,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/shipments")({
  head: () => ({
    meta: [{ title: "Despachos · Nuclear WMS" }],
  }),
  component: ShipmentsPage,
});

const mockShipments = [
  {
    id: "SHP-1049",
    carrier: "TCC Colombia",
    destination: "Punto de Venta Armenia",
    items: 120,
    status: "packing",
    dispatchTime: "16:00",
  },
  {
    id: "SHP-1050",
    carrier: "Servientrega",
    destination: "Distribuidor Bogotá",
    items: 450,
    status: "ready",
    dispatchTime: "18:00",
  },
  {
    id: "SHP-1048",
    carrier: "Vehículo Propio HQ",
    destination: "Punto de Venta Circasia",
    items: 15,
    status: "shipped",
    dispatchTime: "Ayer",
  },
];

function ShipmentsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Despachos</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Preparación, consolidación y salida de carga.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span>Filtros</span>
          </Button>
          <Button size="sm">
            <span>Agendar Carga</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar envío, transporte o destino..."
                className="pl-9 h-12 text-base sm:h-10 sm:text-sm bg-card shadow-sm"
              />
            </div>
            <Button
              variant="nuclear"
              className="shrink-0 h-12 w-12 p-0 sm:h-10 sm:w-auto sm:px-4 shadow-sm"
            >
              <ScanBarcode className="size-5 sm:size-4 sm:mr-2" />
              <span className="hidden sm:inline">Validar Packing</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockShipments.map((shp) => (
              <div
                key={shp.id}
                className="relative flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Header line for visually distinct state */}
                <div
                  className="h-1 w-full bg-border"
                  style={{
                    backgroundColor:
                      shp.status === "ready"
                        ? "var(--color-success)"
                        : shp.status === "packing"
                          ? "var(--color-warning)"
                          : "var(--color-border)",
                  }}
                />

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {shp.id}
                      </span>
                      <h3 className="mt-1 font-semibold leading-tight">{shp.carrier}</h3>
                    </div>
                    {shp.status === "ready" && <PackageCheck className="size-5 text-success" />}
                    {shp.status === "packing" && <AlertCircle className="size-5 text-warning" />}
                    {shp.status === "shipped" && <Truck className="size-5 text-muted-foreground" />}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Destino</span>
                      <span
                        className="font-medium text-right truncate pl-4 max-w-[150px]"
                        title={shp.destination}
                      >
                        {shp.destination}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Artículos</span>
                      <span className="font-medium">{shp.items}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-muted-foreground">Corte</span>
                      <span className="font-mono">{shp.dispatchTime}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    {shp.status === "packing" && (
                      <>
                        <Button variant="outline" className="w-full text-xs" size="sm">
                          Detalles
                        </Button>
                        <Button
                          className="w-full text-xs bg-warning text-warning-foreground hover:bg-warning/90"
                          size="sm"
                        >
                          Auditar
                        </Button>
                      </>
                    )}
                    {shp.status === "ready" && (
                      <Button
                        className="w-full text-xs bg-success text-success-foreground hover:bg-success/90"
                        size="sm"
                      >
                        Despachar Rampa
                      </Button>
                    )}
                    {shp.status === "shipped" && (
                      <Button variant="secondary" className="w-full text-xs" size="sm" disabled>
                        Despachado
                      </Button>
                    )}
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
