import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpFromLine,
  Search,
  Filter,
  ScanBarcode,
  Truck,
  PackageCheck,
  AlertCircle,
  ClipboardList,
  Weight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
    boxes: 4,
    weight: "85 kg"
  },
  {
    id: "SHP-1050",
    carrier: "Servientrega",
    destination: "Distribuidor Bogotá",
    items: 450,
    status: "ready",
    dispatchTime: "18:00",
    boxes: 12,
    weight: "320 kg"
  },
  {
    id: "SHP-1048",
    carrier: "Vehículo Propio HQ",
    destination: "Punto de Venta Circasia",
    items: 15,
    status: "shipped",
    dispatchTime: "Ayer",
    boxes: 1,
    weight: "12 kg"
  },
];

function ShipmentsPage() {
  const [auditShp, setAuditShp] = useState<typeof mockShipments[0] | null>(null);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Despachos (Shipping)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Consolidación (Packing), auditoría de salida y asignación a muelles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span>Filtros</span>
          </Button>
          <Button size="sm">
            <span>Agendar Muelle</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar despacho por guía TCC, destino..."
                className="pl-9 h-12 text-base sm:h-10 sm:text-sm bg-card shadow-sm"
              />
            </div>
            <Button
              variant="nuclear"
              className="shrink-0 h-12 w-12 p-0 sm:h-10 sm:w-auto sm:px-4 shadow-sm"
            >
              <ScanBarcode className="size-5 sm:size-4 sm:mr-2" />
              <span className="hidden sm:inline">Validar Caja Packing</span>
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
                    {shp.status === "packing" && <AlertCircle className="size-5 text-warning animate-pulse" />}
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
                      <span className="text-muted-foreground">Volumen</span>
                      <span className="font-medium">{shp.boxes} Cajas ({shp.weight})</span>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-muted-foreground">Corte (Dock)</span>
                      <span className="font-mono">{shp.dispatchTime}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    {shp.status === "packing" && (
                      <>
                        <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => setAuditShp(shp)}>
                          Packing
                        </Button>
                        <Button
                          className="w-full text-xs bg-warning text-warning-foreground hover:bg-warning/90"
                          size="sm"
                          onClick={() => setAuditShp(shp)}
                        >
                          Auditar Salida
                        </Button>
                      </>
                    )}
                    {shp.status === "ready" && (
                      <Button
                        className="w-full text-xs bg-success text-success-foreground hover:bg-success/90"
                        size="sm"
                      >
                        Cargar Rampa 2
                      </Button>
                    )}
                    {shp.status === "shipped" && (
                      <Button variant="secondary" className="w-full text-xs" size="sm" disabled>
                        En Tránsito
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Sheet open={!!auditShp} onOpenChange={(v) => !v && setAuditShp(null)}>
          <SheetContent className="w-full sm:max-w-md">
              {auditShp && (
                 <>
                    <SheetHeader>
                        <p className="font-mono text-xs text-muted-foreground">{auditShp.id}</p>
                        <SheetTitle className="font-display">Auditoría de Packing</SheetTitle>
                        <SheetDescription>
                            Validación de contenido y pesaje antes de emitir rótulos de despacho.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                            <Truck className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-semibold">{auditShp.carrier}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{auditShp.destination}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <ScanBarcode className="size-4" /> Escaneo de Verificación
                            </h4>
                            <div className="flex items-center gap-2">
                                <Input placeholder="Escanear producto para validar..." className="font-mono text-xs h-10" />
                                <Button size="icon" variant="outline" className="shrink-0"><ScanBarcode className="size-4" /></Button>
                            </div>
                            <div className="space-y-2 mt-3 text-sm">
                                <div className="flex justify-between items-center p-2 rounded bg-success/10 border border-success/30 text-success">
                                    <span className="font-medium">CQ-ARE-125 (100 org)</span>
                                    <span className="font-mono">100/100 ✓</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-warning/10 border border-warning/30 text-warning">
                                    <span className="font-medium">CQ-GAL-100 (20 org)</span>
                                    <span className="font-mono">15/20</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Weight className="size-4" /> Embalaje Final
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground">Cajas Corrugadas</label>
                                    <Input defaultValue="4" type="number" className="mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground">Peso Total (kg)</label>
                                    <Input defaultValue="85" type="number" className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                            <Button variant="nuclear" className="w-full">Generar Rótulos 4x6" PDF</Button>
                            <Button variant="outline" className="w-full" onClick={() => setAuditShp(null)}>Pausar Auditoría</Button>
                        </div>
                    </div>
                 </>
              )}
          </SheetContent>
      </Sheet>
    </div>
  );
}
