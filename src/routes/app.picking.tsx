import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Scan, Box, Search, Filter, Play, CheckCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/picking")({
  head: () => ({
    meta: [{ title: "Picking · Nuclear WMS" }],
  }),
  component: PickingPage,
});

const mockBatches = [
  {
    id: "PCK-882",
    type: "Wave Picking",
    zones: "A, B",
    orders: 12,
    lines: 45,
    items: 120,
    status: "ready",
    priority: "high",
  },
  {
    id: "PCK-881",
    type: "Order Picking",
    zones: "C",
    orders: 1,
    lines: 5,
    items: 5,
    status: "in_progress",
    progress: 60,
    priority: "normal",
  },
  {
    id: "PCK-880",
    type: "Wave Picking",
    zones: "A, B, C",
    orders: 20,
    lines: 80,
    items: 300,
    status: "completed",
    priority: "normal",
  },
];

function PickingPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Picking</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Gestión de olas y recolección de pedidos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span>Filtros</span>
          </Button>
          <Button size="sm" variant="secondary">
            <ScannerIcon className="mr-2 size-4 hidden sm:block" />
            <span>App Scanner</span>
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
              <span className="hidden sm:inline">Escanear Caja</span>
            </Button>
          </div>

          <div className="space-y-3">
            {mockBatches.map((batch) => (
              <div
                key={batch.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm"
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
                    <p className="mt-1 text-sm text-muted-foreground">Zonas: {batch.zones}</p>
                  </div>
                  {batch.priority === "high" && (
                    <Flame className="size-5 text-destructive animate-pulse" />
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
                      Uds
                    </span>
                    <span className="text-lg font-bold">{batch.items}</span>
                  </div>
                </div>

                <div className="mt-5">
                  {batch.status === "ready" && (
                    <Button className="w-full h-12 text-base font-medium shadow-sm transition-transform active:scale-[0.98]">
                      <Play className="mr-2 size-5 fill-current" />
                      Iniciar Picking
                    </Button>
                  )}
                  {batch.status === "in_progress" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-nuclear">En progreso</span>
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
                        Continuar Tarea
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
