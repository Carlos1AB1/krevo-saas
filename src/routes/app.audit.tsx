import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Activity,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Globe,
  Trash2,
  ArrowRight,
  MessageSquare,
  UserPlus,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAuditLogs,
  exportAuditLogs,
  AUDIT_ACTION_OPTIONS,
  AUDIT_MODULE_OPTIONS,
  type AuditChangeField,
  type AuditLogResponse,
  type AuditModule,
  type AuditSeverity,
} from "@/features/audit/audit.api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { isValidDateRange, toQueryFromDate, toQueryToDate } from "@/lib/date-range";

export const Route = createFileRoute("/app/audit")({
  head: () => ({ meta: [{ title: "Auditoría · Krevo" }] }),
  component: () => (
    <RequirePermission action="read" subject="audit">
      <AuditPage />
    </RequirePermission>
  ),
});

const SEVERITY_STYLES: Record<
  AuditSeverity,
  { row: string; badge: string; label: string }
> = {
  DELETE: {
    row: "border-l-4 border-l-destructive bg-destructive/5",
    badge: "bg-destructive/15 text-destructive",
    label: "Eliminación",
  },
  SECURITY: {
    row: "border-l-4 border-l-purple-500 bg-purple-500/5",
    badge: "bg-purple-500/15 text-purple-700",
    label: "Seguridad",
  },
  UPDATE: {
    row: "border-l-4 border-l-warning bg-warning/5",
    badge: "bg-warning/15 text-warning",
    label: "Modificación",
  },
  INFO: {
    row: "border-l-4 border-l-border",
    badge: "bg-muted text-muted-foreground",
    label: "Registro",
  },
};

function ChangeRow({ change }: { change: AuditChangeField }) {
  const isDelete = change.after === null && change.before !== null;
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(100px,140px)_1fr_auto_1fr] gap-2 items-center text-xs py-1.5 border-b border-border/40 last:border-0",
        isDelete && "bg-destructive/5 rounded px-1",
      )}
    >
      <span className="font-medium text-muted-foreground">{change.label}</span>
      <span className="font-mono text-muted-foreground truncate" title={change.before ?? undefined}>
        {change.before ?? "—"}
      </span>
      <ArrowRight className="size-3 text-muted-foreground shrink-0 mx-1" />
      <span
        className={cn(
          "font-mono truncate",
          isDelete ? "text-destructive font-semibold" : "text-foreground",
        )}
        title={change.after ?? undefined}
      >
        {change.after ?? "(eliminado)"}
      </span>
    </div>
  );
}

function AuditEventCard({ log }: { log: AuditLogResponse }) {
  const style = SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.INFO;
  const changes = log.changes ?? [];

  return (
    <article className={cn("rounded-lg border border-border bg-card p-4 shadow-sm", style.row)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", style.badge)}>
              {log.severity === "DELETE" && <Trash2 className="inline size-3 mr-0.5" />}
              {style.label}
            </span>
            {log.module && (
              <span className="rounded-md bg-nuclear/10 px-2 py-0.5 text-[10px] font-semibold text-nuclear">
                {AUDIT_MODULE_OPTIONS.find((m) => m.value === log.module)?.label ?? log.module}
              </span>
            )}
            <time className="text-xs text-muted-foreground">
              {format(parseISO(log.createdAt), "dd MMM yyyy · HH:mm:ss", { locale: es })}
            </time>
          </div>
          <h3 className="text-sm font-semibold leading-snug">{log.summary ?? log.action}</h3>
          {log.entityLabel && (
            <p className="text-xs text-muted-foreground">
              Registro: <span className="font-medium text-foreground">{log.entityLabel}</span>
            </p>
          )}
        </div>
        {log.ipAddress && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground shrink-0">
            <Globe className="size-3" />
            {log.ipAddress}
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
        <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
          <User className="size-3.5 mt-0.5 text-nuclear shrink-0" />
          <div>
            <p className="font-semibold text-foreground">{log.actorName ?? "Sistema"}</p>
            {log.actorEmail && <p className="text-muted-foreground">{log.actorEmail}</p>}
            {log.actorDocumentId && (
              <p className="text-muted-foreground">Cédula: {log.actorDocumentId}</p>
            )}
            {log.actorRoles && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Cargo: <span className="font-medium">{log.actorRoles}</span>
              </p>
            )}
          </div>
        </div>
        {log.recordCreatorName && (
          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
            <UserPlus className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Creó el registro</p>
              <p className="font-medium text-foreground">{log.recordCreatorName}</p>
            </div>
          </div>
        )}
        {log.relatedActorName && (
          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5 sm:col-span-2">
            <UserPlus className="size-3.5 mt-0.5 text-nuclear shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                {log.relatedActorRoleLabel ?? "Participante relacionado"}
              </p>
              <p className="font-medium text-foreground">{log.relatedActorName}</p>
              {log.relatedActorDocumentId && (
                <p className="text-muted-foreground">Cédula: {log.relatedActorDocumentId}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {log.observation && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-border/60 bg-background p-2.5 text-xs">
          <MessageSquare className="size-3.5 mt-0.5 text-warning shrink-0" />
          <div>
            <p className="font-semibold text-muted-foreground">Observación</p>
            <p className="mt-0.5 text-foreground">{log.observation}</p>
          </div>
        </div>
      )}

      {changes.length > 0 && (
        <div className="mt-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Detalle de cambios
          </p>
          <div className="hidden sm:grid grid-cols-[minmax(100px,140px)_1fr_auto_1fr] gap-2 text-[10px] font-semibold uppercase text-muted-foreground mb-1 px-0">
            <span>Campo</span>
            <span>Valor anterior</span>
            <span />
            <span>Valor nuevo</span>
          </div>
          {changes.map((c) => (
            <ChangeRow key={`${c.field}-${c.label}`} change={c} />
          ))}
        </div>
      )}
    </article>
  );
}

function AuditPage() {
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState<AuditModule | "">("");
  const [actionFilter, setActionFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);

  const dateRangeValid = isValidDateRange(from, to);
  const queryFrom = toQueryFromDate(from);
  const queryTo = toQueryToDate(to);

  const hasFilters = Boolean(from || to || severityFilter || moduleFilter || actionFilter);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "audit",
      "logs",
      {
        page,
        limit: 15,
        module: moduleFilter,
        action: actionFilter,
        severity: severityFilter,
        from,
        to,
      },
    ],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: 15,
        module: moduleFilter || undefined,
        action: actionFilter.trim() || undefined,
        severity: severityFilter || undefined,
        from: queryFrom,
        to: queryTo,
      }),
    enabled: dateRangeValid,
    placeholderData: (prev) => prev,
  });

  const logs: AuditLogResponse[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  async function handleExport(format: "xlsx" | "pdf") {
    setExporting(format);
    try {
      const blob = await exportAuditLogs({
        format,
        module: moduleFilter || undefined,
        action: actionFilter.trim() || undefined,
        severity: severityFilter || undefined,
        from: queryFrom,
        to: queryTo,
      });
      const ext = format === "xlsx" ? "xlsx" : "pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria-krevo-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Activity className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Trazabilidad de auditoría</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Historial de negocio · quién cambió qué, cuándo y desde dónde · {total} evento(s)
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              <div className="space-y-0.5 min-w-0">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Acción</Label>
                <Input
                  list="audit-action-presets"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ej. inventory.product.updated"
                  className="h-9 w-full font-mono text-xs"
                />
                <datalist id="audit-action-presets">
                  {AUDIT_ACTION_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-0.5 min-w-0">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Módulo</Label>
                <select
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value as AuditModule | "");
                    setPage(1);
                  }}
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">Todos los módulos</option>
                  {AUDIT_MODULE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5 min-w-0">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Tipo</Label>
                <select
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value as AuditSeverity | "");
                    setPage(1);
                  }}
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="DELETE">Eliminaciones</option>
                  <option value="UPDATE">Modificaciones</option>
                  <option value="INFO">Altas / registros</option>
                  <option value="SECURITY">Seguridad</option>
                </select>
              </div>
              <div className="space-y-0.5 min-w-0">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Desde</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground">Hasta</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full"
                />
              </div>
            </div>

            {!dateRangeValid && (
              <p className="text-xs text-destructive" role="alert">
                La fecha «Desde» no puede ser posterior a «Hasta».
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              {hasFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                    setSeverityFilter("");
                    setModuleFilter("");
                    setActionFilter("");
                    setPage(1);
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  disabled={exporting !== null}
                  onClick={() => handleExport("xlsx")}
                >
                  {exporting === "xlsx" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                  )}
                  <span className="ml-1.5">Excel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  disabled={exporting !== null}
                  onClick={() => handleExport("pdf")}
                >
                  {exporting === "pdf" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4 shrink-0 text-red-600" />
                  )}
                  <span className="ml-1.5">PDF</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5 text-warning shrink-0" />
            <span>
              Registro <strong className="text-foreground">inmutable</strong>. En acceso solo se guardan
              correo y resultado (nunca contraseñas). Cargo = roles IAM. Exporte Excel o PDF para
              evidencias y descargos.
            </span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando historial…
            </div>
          )}

          {isError && (
            <div className="p-6 text-center text-sm text-destructive rounded-xl border border-destructive/30 bg-destructive/5">
              No fue posible cargar la auditoría. Verifica el permiso <code>read:audit</code>.
            </div>
          )}

          {!isLoading && !isError && logs.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed">
              Sin eventos con los filtros actuales.
            </div>
          )}

          {!isLoading && !isError && logs.length > 0 && (
            <div className="space-y-3">
              {logs.map((log) => (
                <AuditEventCard key={log.id} log={log} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
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
