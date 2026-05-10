import { createFileRoute } from "@tanstack/react-router";
import { Activity, Search, Filter, ShieldAlert, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/audit")({
  head: () => ({
    meta: [{ title: "Auditoría · Nuclear WMS" }],
  }),
  component: AuditPage,
});

const mockAuditLogs = [
  {
    id: "log_1",
    user: "Valentina Aristizábal",
    action: "Modificó ROP",
    resource: "CQ-ARE-125 (Arequipe x 125g)",
    previous: "800",
    new: "850",
    timestamp: "Hoy 10:45 AM",
  },
  {
    id: "log_2",
    user: "Carlos Mejía",
    action: "Aprobó Despacho",
    resource: "SHP-1049",
    previous: "packing",
    new: "shipped",
    timestamp: "Hoy 09:12 AM",
  },
  {
    id: "log_3",
    user: "Jorge Ramírez",
    action: "Ajuste de Inventario",
    resource: "CQ-GAL-100 (Bodega Armenia)",
    previous: "100",
    new: "96",
    timestamp: "Ayer 18:30",
  },
  {
    id: "log_4",
    user: "Laura Martínez",
    action: "Recepción Mercancía",
    resource: "REC-2901",
    previous: "pending",
    new: "receiving",
    timestamp: "Ayer 14:15",
  },
  {
    id: "log_5",
    user: "Valentina Aristizábal",
    action: "Cambio de Rol",
    resource: "Usuario: Carlos Mejía",
    previous: "Operario",
    new: "Supervisor",
    timestamp: "12 May, 2026",
  },
];

function AuditPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Trazabilidad de Auditoría</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Registro inmutable de actividades en el sistema logístico.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 size-4" />
            <span>Filtrar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acción o recurso..."
                className="pl-9 h-10 bg-card shadow-sm"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="size-4 text-warning" />
              <span className="font-medium text-foreground">Registro Inmutable:</span>
              Todas las acciones críticas quedan registradas permanentemente según políticas de
              cumplimiento.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Fecha y Hora</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Recurso Afectado</th>
                    <th className="px-4 py-3">Detalle (Antes / Después)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <History className="size-3.5" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{log.user}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{log.resource}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground line-through">{log.previous}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-nuclear">{log.new}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
