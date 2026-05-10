import { createFileRoute } from "@tanstack/react-router";
import {
  ClipboardCheck,
  Scan,
  Box,
  Search,
  Filter,
  Play,
  CheckCircle,
  Flame,
  Route as RouteIcon,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/picking")({
  head: () => ({
    meta: [{ title: "Picking · Krevo" }],
  }),
  component: PickingPage,
});

const mockBatches = [
  {
    id: "PCK-882",
    type: "Ruta: Martes",
    zones: "Pereira",
    orders: 12,
    lines: 45,
    items: 120,
    status: "ready",
    priority: "high",
  },
  {
    id: "PCK-881",
    type: "Ruta: Miércoles",
    zones: "Calarcá, La Tebaida y Armenia",
    orders: 18,
    lines: 65,
    items: 180,
    status: "in_progress",
    progress: 60,
    priority: "normal",
  },
  {
    id: "PCK-880",
    type: "Ruta: Jueves",
    zones: "Montenegro, Quimbaya y Parque del Café",
    orders: 20,
    lines: 80,
    items: 300,
    status: "completed",
    priority: "normal",
  },
  {
    id: "PCK-879",
    type: "Ruta: Viernes",
    zones: "Filandia",
    orders: 5,
    lines: 12,
    items: 35,
    status: "ready",
    priority: "normal",
  },
  {
    id: "PCK-878",
    type: "Ruta: Sábado",
    zones: "Salento",
    orders: 8,
    lines: 22,
    items: 68,
    status: "ready",
    priority: "normal",
  },
];

function PickingPage() {
  const [startWave, setStartWave] = useState<(typeof mockBatches)[0] | null>(null);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Picking (Outbound)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Generación de olas agrupadas por día según programación regional de rutas (Pedidos importados de Celuweb).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span>Filtros</span>
          </Button>
          <Button size="sm" variant="secondary">
            <ScannerIcon className="mr-2 size-4 hidden sm:block" />
            <span>Mode App Scanner</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-lg sm:max-w-5xl space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ola, pedido..."
                className="pl-9 h-12 text-base sm:h-10 sm:text-sm bg-card shadow-sm"
              />
            </div>
            <Button
              variant="nuclear"
              className="shrink-0 h-12 w-12 p-0 sm:h-10 sm:w-auto sm:px-4 shadow-sm"
            >
              <Scan className="size-5 sm:size-4 sm:mr-2" />
              <span className="hidden sm:inline">Validar Caja Pick</span>
            </Button>
          </div>

          <div className="space-y-3">
            {mockBatches.map((batch) => (
              <div
                key={batch.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {batch.id}
                      </span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase font-semibold text-accent-foreground">
                        {batch.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Municipios (Celuweb): <span className="font-semibold text-foreground">{batch.zones}</span>
                    </p>
                  </div>
                  {batch.priority === "high" && (
                    <span title="Prioridad Alta (Despacho pronto)">
                      <Flame className="size-5 text-destructive animate-pulse" />
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center divide-x divide-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                      Pedidos
                    </span>
                    <span className="text-lg font-bold">{batch.orders}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                      Líneas
                    </span>
                    <span className="text-lg font-bold">{batch.lines}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                      Uds Total
                    </span>
                    <span className="text-lg font-bold">{batch.items}</span>
                  </div>
                </div>

                <div className="mt-5">
                  {batch.status === "ready" && (
                    <Button
                      className="w-full h-12 text-base font-medium shadow-sm transition-transform active:scale-[0.98]"
                      onClick={() => setStartWave(batch)}
                    >
                      <RouteIcon className="mr-2 size-5" />
                      Planificar Ruta
                    </Button>
                  )}
                  {batch.status === "in_progress" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-nuclear">En progreso (Juan P.)</span>
                        <span>{batch.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-nuclear transition-all"
                          style={{ width: `${batch.progress}%` }}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full h-12 mt-2 text-base font-medium"
                      >
                        Continuar Pick (App PWA)
                      </Button>
                    </div>
                  )}
                  {batch.status === "completed" && (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-muted-foreground"
                      disabled
                    >
                      <CheckCircle className="mr-2 size-5" />
                      Ola Completada
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!startWave} onOpenChange={(v) => !v && setStartWave(null)}>
        <DialogContent className="max-w-md">
          {startWave && (
            <>
              <DialogHeader>
                <DialogTitle>Asignación de Ruta: {startWave.id}</DialogTitle>
                <DialogDescription>
                  Algoritmo de enrutamiento en pasillos para minimizar tiempo de caminata.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 border-y border-border my-2">
                <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <RouteIcon className="size-4 text-nuclear" /> Ruta Optimizada (TSP)
                  </div>
                  <span className="text-xs bg-card border border-border px-2 py-1 rounded font-mono">
                    Pasillos A2 {">"} B4 {">"} B5
                  </span>
                </div>
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="operator-select"
                    className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                  >
                    <Users className="size-3" /> Asignar Operario
                  </label>
                  <select
                    id="operator-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option>Juan Pérez (En Turno)</option>
                    <option>Carlos Mejía (En Turno)</option>
                    <option>Auto-asignar (Balanceo Carga)</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <span
                    id="confirm-type-label"
                    className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                  >
                    <Target className="size-3" /> Tipo de Confirmación
                  </span>
                  <div className="flex gap-2" role="group" aria-labelledby="confirm-type-label">
                    <button
                      type="button"
                      className="flex-1 border-2 border-nuclear bg-nuclear/5 p-2 rounded-lg text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-nuclear"
                    >
                      <span className="block text-sm font-medium text-nuclear mt-1">
                        Escaner PDA
                      </span>
                      <span className="text-[10px] text-muted-foreground">Código EAN</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 border border-border bg-card p-2 rounded-lg text-center opacity-70 cursor-pointer hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <span className="block text-sm font-medium mt-1">Pick by Voice</span>
                      <span className="text-[10px] text-muted-foreground">Premium</span>
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStartWave(null)}>
                  Cancelar
                </Button>
                <Button variant="nuclear" onClick={() => setStartWave(null)}>
                  Confirmar emisión de ola
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScannerIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7V4h3" />
      <path d="M20 7V4h-3" />
      <path d="M20 17v3h-3" />
      <path d="M4 17v3h3" />
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M12 11v2" />
    </svg>
  );
}
