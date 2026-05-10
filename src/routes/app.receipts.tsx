import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, Plus, Search, Filter, ScanLine, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Recepciones</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Entrada de mercadería y control de calidad.
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

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar PO, proveedor o recibo..."
                className="pl-9 bg-card h-10 w-full"
              />
            </div>
            <Button variant="nuclear" className="shrink-0 h-10 w-10 p-0 sm:w-auto sm:px-4">
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
                    <span className="text-xs text-muted-foreground">Artículos</span>
                    <span className="font-medium">{rec.items} un.</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    Ver Detalles
                  </Button>
                  {rec.status !== "completed" && (
                    <Button
                      className="w-full text-xs"
                      size="sm"
                      variant={rec.status === "checking" ? "secondary" : "default"}
                    >
                      {rec.status === "checking" ? "Continuar" : "Iniciar"}
                    </Button>
                  )}
                </div>
                {rec.type === "Urgente" && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 items-center rounded-full bg-destructive px-2 text-[10px] font-bold uppercase text-destructive-foreground shadow-sm">
                    Urgente
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
