import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  Plus,
  Search,
  Filter,
  ScanLine,
  Clock,
  CheckCircle2,
  Box,
  ShieldCheck,
  Truck,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/app/receipts")({
  head: () => ({
    meta: [{ title: "Recepciones · Nuclear WMS" }],
  }),
  component: ReceiptsPage,
});

const mockReceipts = [
  {
    id: "REC-2901",
    supplier: "Lácteos del Quindío S.A.",
    expectedAt: "Hoy 14:00",
    status: "pending",
    items: 45,
    type: "Estándar",
  },
  {
    id: "REC-2900",
    supplier: "Ingenio Providencia",
    expectedAt: "Hoy 09:30",
    status: "checking",
    items: 120,
    type: "Urgente",
  },
  {
    id: "REC-2899",
    supplier: "Empaques Artesanales Eje",
    expectedAt: "Ayer",
    status: "completed",
    items: 12,
    type: "Estándar",
  },
];

function ReceiptsPage() {
  const [selectedRec, setSelectedRec] = useState<(typeof mockReceipts)[0] | null>(null);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Recepciones (Inbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Muelle de entrada, ASN, QA y Cross-Docking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span className="hidden lg:inline">Filtrar</span>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            <span>Nuevo Ingreso</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ASN, proveedor o REC-..."
                className="pl-9 bg-card shadow-sm h-10 w-full"
              />
            </div>
            <Button
              variant="nuclear"
              className="shrink-0 h-10 w-10 p-0 sm:w-auto sm:px-4 shadow-sm"
            >
              <ScanLine className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Escanear ASN</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockReceipts.map((rec) => (
              <div
                key={rec.id}
                className="relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-nuclear/50 hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {rec.id}
                    </span>
                    <h3 className="mt-2 font-semibold text-foreground">{rec.supplier}</h3>
                  </div>
                  {rec.status === "pending" && <Clock className="size-4 text-warning" />}
                  {rec.status === "checking" && (
                    <ArrowDownToLine className="size-4 text-info animate-pulse" />
                  )}
                  {rec.status === "completed" && <CheckCircle2 className="size-4 text-success" />}
                </div>

                <div className="mt-auto flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Esperado</span>
                    <span className="font-medium">{rec.expectedAt}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-muted-foreground">Planilla</span>
                    <span className="font-medium">{rec.items} estibas</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    size="sm"
                    onClick={() => setSelectedRec(rec)}
                  >
                    Pre-Recepción
                  </Button>
                  {rec.status !== "completed" && (
                    <Button
                      className="w-full text-xs"
                      size="sm"
                      variant={rec.status === "checking" ? "secondary" : "default"}
                      onClick={() => setSelectedRec(rec)}
                    >
                      {rec.status === "checking" ? "Verificar" : "Iniciar"}
                    </Button>
                  )}
                </div>
                {rec.type === "Urgente" && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 items-center rounded-full bg-destructive px-2 text-[10px] font-bold uppercase text-destructive-foreground shadow-sm">
                    Cross-Docking Previsto
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!selectedRec} onOpenChange={(v) => !v && setSelectedRec(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRec && (
            <>
              <SheetHeader>
                <p className="font-mono text-xs text-muted-foreground">{selectedRec.id}</p>
                <SheetTitle className="font-display text-xl">{selectedRec.supplier}</SheetTitle>
                <SheetDescription>
                  Detalles de la recepción, inspección de calidad (QA) y reglas de guardado
                  (Put-away).
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Cross Dock Alert */}
                {selectedRec.type === "Urgente" && (
                  <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 border-l-4 border-l-warning">
                    <div className="flex items-center gap-2 text-warning font-semibold text-sm mb-1">
                      <MoveRight className="size-4" /> Alerta de Cross-Docking
                    </div>
                    <p className="text-xs text-warning/90">
                      Parte de esta mercancía (20 unidades) está requerida para el Despacho SHP-1050
                      de la tarde. Enviar directo a Muelle de Salida sin almacenar.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="size-4" /> Criterios de Aceptación (QA)
                  </h4>
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                      <span className="text-sm font-medium">Validación de Temperatura</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-2">
                        Req: 2°C a 6°C
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-[1fr_auto] gap-2 items-center">
                      <label htmlFor="qa-temp" className="sr-only">
                        T° de Lectura
                      </label>
                      <Input
                        id="qa-temp"
                        placeholder="T° de Lectura"
                        type="number"
                        className="h-8 text-sm"
                        required
                      />
                      <Button size="sm" variant="outline">
                        Validar Rango
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Box className="size-4" /> Put-away Sugerido (Algoritmo)
                  </h4>
                  <div className="rounded-lg border border-border overflow-hidden text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground text-xs font-medium">
                        <tr>
                          <th className="px-3 py-2">Ítem / Lote</th>
                          <th className="px-3 py-2 text-right">Cant</th>
                          <th className="px-3 py-2 text-right">Zona Sugerida</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-3 py-2">
                            <span className="block font-medium">Leche Entera 1L</span>
                            <span className="text-[10px] text-muted-foreground">Lote: 24391</span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">100</td>
                          <td className="px-3 py-2 text-right">
                            <span className="bg-surface-2 px-2 py-1 rounded font-mono text-xs font-bold text-nuclear">
                              R-A-03
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">
                            <span className="block font-medium">Queso Campesino</span>
                            <span className="text-[10px] text-muted-foreground">Lote: 24391</span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">20</td>
                          <td className="px-3 py-2 text-right">
                            <span className="bg-surface-2 px-2 py-1 rounded font-mono text-xs font-bold text-nuclear">
                              R-B-01
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="ghost">Reportar Novedad</Button>
                  <Button variant="nuclear">Registrar Ingreso WMS</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
