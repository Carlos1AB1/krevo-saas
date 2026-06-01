import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Activity, Search, ShieldAlert, History, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuditLogs, type AuditLogResponse } from "@/features/audit/audit.api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/audit")({
  head: () => ({ meta: [{ title: "Auditoría · Krevo" }] }),
  component: AuditPage,
});

// ── Action display helpers ──────────────────────────────────────────────────

const domainColor: Record<string, string> = {
  inventory: "bg-info/15 text-info",
  logistics: "bg-warning/15 text-warning",
  production: "bg-nuclear/15 text-nuclear",
  auth: "bg-destructive/15 text-destructive",
  users: "bg-purple-500/15 text-purple-600",
  roles: "bg-success/15 text-success",
  organizations: "bg-muted text-muted-foreground",
};

const eventLabel: Record<string, string> = {
  created: "Creado",
  updated: "Actualizado",
  deleted: "Eliminado",
  approved: "Aprobado",
  rejected: "Rechazado",
  started: "Iniciado",
  completed: "Completado",
  cancelled: "Cancelado",
  activated: "Activado",
  deactivated: "Desactivado",
  login: "Inicio de sesión",
  logout: "Cierre de sesión",
  "password-changed": "Contraseña cambiada",
};

const entityLabel: Record<string, string> = {
  product: "Producto",
  lot: "Lote",
  movement: "Movimiento",
  category: "Categoría",
  receipt: "Recepción",
  dispatch: "Despacho",
  formula: "Fórmula",
  order: "Orden de producción",
  user: "Usuario",
  role: "Rol",
  organization: "Organización",
};

function parseAction(action: string) {
  const parts = action.split(".");
  const domain = parts[0] ?? "";
  const entity = parts[1] ?? "";
  const event = parts.slice(2).join(".") ?? "";
  const label = [entityLabel[entity] ?? entity, eventLabel[event] ?? event].filter(Boolean).join(" — ");
  return { domain, label: label || action };
}

function ActionBadge({ action }: { action: string }) {
  const { domain, label } = parseAction(action);
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", domainColor[domain] ?? "bg-muted text-muted-foreground")}>
      {label}
    </span>
  );
}

function MetadataCell({ metadata }: { metadata: Record<string, unknown> | null }) {
  if (!metadata) return <span className="text-muted-foreground">—</span>;
  const keys = Object.keys(metadata).slice(0, 3);
  return (
    <div className="space-y-0.5">
      {keys.map((k) => (
        <div key={k} className="flex items-center gap-1 text-[10px]">
          <span className="text-muted-foreground">{k}:</span>
          <span className="font-mono font-medium truncate max-w-[120px]">
            {String(metadata[k])}
          </span>
        </div>
      ))}
      {Object.keys(metadata).length > 3 && (
        <span className="text-[10px] text-muted-foreground">+{Object.keys(metadata).length - 3} más</span>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

function AuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit", "logs", { page, limit: 20, action: debouncedAction, from, to }],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: 20,
        action: debouncedAction || undefined,
        from: from || undefined,
        to: to ? `${to}T23:59:59.000Z` : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const logs: AuditLogResponse[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  function handleActionChange(v: string) {
    setActionFilter(v);
    clearTimeout((window as unknown as Record<string, number>).__auditTimer);
    (window as unknown as Record<string, number>).__auditTimer = window.setTimeout(() => {
      setDebouncedAction(v);
      setPage(1);
    }, 400);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Activity className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Trazabilidad de Auditoría</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Registro inmutable de actividades · {total} evento(s) registrados
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-6xl space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={actionFilter}
                onChange={(e) => handleActionChange(e.target.value)}
                placeholder="Filtrar por acción (ej: inventory.product)"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Desde</Label>
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-9 w-36" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Hasta</Label>
                <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-9 w-36" />
              </div>
              {(from || to || debouncedAction) && (
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setFrom(""); setTo(""); setActionFilter(""); setDebouncedAction(""); setPage(1); }}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Immutable notice */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="size-3.5 text-warning shrink-0" />
              <span className="font-medium text-foreground">Registro Inmutable:</span>
              Todas las acciones críticas quedan registradas permanentemente. No se pueden modificar ni eliminar.
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Cargando eventos…
              </div>
            )}

            {isError && (
              <div className="p-6 text-center text-sm text-destructive">
                No fue posible cargar los eventos de auditoría. Verifica que tengas el permiso <code>read:audit</code>.
              </div>
            )}

            {!isLoading && !isError && logs.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Sin eventos registrados con los filtros actuales.
              </div>
            )}

            {!isLoading && !isError && logs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Fecha y Hora</th>
                      <th className="px-4 py-3">Acción</th>
                      <th className="px-4 py-3">IP</th>
                      <th className="px-4 py-3">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <History className="size-3.5 shrink-0" />
                            {format(parseISO(log.createdAt), "dd MMM yyyy HH:mm:ss", { locale: es })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{log.action}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {log.ipAddress ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <MetadataCell metadata={log.metadata} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages} · {total} eventos
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
