import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, ScrollText, ShieldAlert, Siren, UserLock } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type AdminAuditRecord } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type Severity = "all" | "INFO" | "UPDATE" | "DELETE" | "SECURITY";
type AuditModule =
  | "all"
  | "platform"
  | "auth"
  | "users"
  | "roles"
  | "organizations"
  | "inventory"
  | "logistics"
  | "production";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [{ title: "Auditoría · SuperAdmin Krevo" }],
  }),
  component: GlobalAuditPage,
});

function GlobalAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity>("all");
  const [moduleFilter, setModuleFilter] = useState<AuditModule>("all");
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryFn: () =>
      adminApi.getAudit({
        limit: PAGE_SIZE,
        module: moduleFilter === "all" ? undefined : moduleFilter,
        page,
        severity: severityFilter === "all" ? undefined : severityFilter,
      }),
    queryKey: ["admin-audit", { moduleFilter, page, severityFilter }],
  });

  const events = auditQuery.data?.data ?? [];
  const filteredEvents = useMemo(() => {
    const term = normalizeSearch(searchQuery);

    return events.filter((event) => {
      const haystack = normalizeSearch(
        [
          getActor(event),
          getActionLabel(event),
          getCompanyLabel(event),
          getImpact(event),
          getModuleLabel(getAuditModule(event)),
          getTimestamp(event),
        ].join(" "),
      );

      return !term || haystack.includes(term);
    });
  }, [events, searchQuery]);

  const criticalEvents = events.filter((event) => isCriticalSeverity(event.severity)).length;
  const securityEvents = events.filter((event) => getAuditModule(event) === "auth").length;
  const platformWideEvents = events.filter((event) => getAuditModule(event) === "platform").length;
  const totalEvents = auditQuery.data?.total ?? events.length;

  function changeSeverity(value: Severity) {
    setSeverityFilter(value);
    setPage(1);
  }

  function changeModule(value: AuditModule) {
    setModuleFilter(value);
    setPage(1);
  }

  return (
    <>
      <AdminTopbar
        title="Auditoría"
        description="Trazabilidad global sobre cambios de planes, cobros, seguridad y decisiones que afectan varias empresas."
        action={
          <Button variant="outline" size="sm" disabled>
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="w-full space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AuditStat
              label="Eventos sensibles"
              value={criticalEvents}
              hint="DELETE o SECURITY en la página actual."
              tone="critical"
              icon={Siren}
            />
            <AuditStat
              label="Acceso y seguridad"
              value={securityEvents}
              hint="Eventos del módulo auth."
              tone="warning"
              icon={UserLock}
            />
            <AuditStat
              label="Plataforma"
              value={platformWideEvents}
              hint="Cambios de alcance SaaS."
              tone="info"
              icon={ScrollText}
            />
            <AuditStat
              label="Eventos totales"
              value={totalEvents}
              hint="Coinciden con los filtros activos."
              tone="neutral"
              icon={Filter}
            />
          </section>

          <section className="grid gap-5">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ScrollText className="size-4 text-nuclear" />
                      Eventos recientes
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {auditQuery.isLoading
                        ? "Cargando eventos..."
                        : `${filteredEvents.length} evento${
                            filteredEvents.length === 1 ? "" : "s"
                          } visible${searchQuery ? ` para "${searchQuery}"` : ""}.`}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por actor, acción, empresa o impacto..."
                      className="h-10"
                    />

                    <div className="flex flex-col gap-2 xl:flex-row">
                      <Tabs
                        value={severityFilter}
                        onValueChange={(value) => changeSeverity(value as Severity)}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="all">Todas</TabsTrigger>
                          <TabsTrigger value="SECURITY">Seg.</TabsTrigger>
                          <TabsTrigger value="DELETE">Delete</TabsTrigger>
                          <TabsTrigger value="UPDATE">Update</TabsTrigger>
                          <TabsTrigger value="INFO">Info</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <Tabs
                        value={moduleFilter}
                        onValueChange={(value) => changeModule(value as AuditModule)}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="all">Todo</TabsTrigger>
                          <TabsTrigger value="platform">SaaS</TabsTrigger>
                          <TabsTrigger value="auth">Auth</TabsTrigger>
                          <TabsTrigger value="users">Usuarios</TabsTrigger>
                          <TabsTrigger value="roles">Roles</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 md:hidden">
                  {auditQuery.isLoading ? (
                    <AuditLoadingState />
                  ) : auditQuery.isError ? (
                    <AuditErrorState onRetry={() => auditQuery.refetch()} />
                  ) : filteredEvents.length ? (
                    filteredEvents.map((event) => (
                      <article
                        key={getAuditId(event)}
                        className="rounded-lg border border-border bg-background/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <SeverityBadge severity={getSeverity(event.severity)} />
                              <ModuleBadge module={getAuditModule(event)} />
                            </div>
                            <p className="mt-3 font-semibold text-foreground">
                              {getActionLabel(event)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {getCompanyLabel(event)}
                            </p>
                          </div>
                          <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {getTimestamp(event)}
                          </p>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                          <InfoPair label="Actor" value={getActor(event)} />
                          <InfoPair label="Impacto" value={getImpact(event)} />
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyAuditState />
                  )}
                </div>

                <div className="hidden overflow-hidden rounded-lg border border-border md:block">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="px-4">Fecha</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Entidad</TableHead>
                        <TableHead>Impacto</TableHead>
                        <TableHead>Severidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditQuery.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="px-4 py-10">
                            <AuditLoadingState />
                          </TableCell>
                        </TableRow>
                      ) : auditQuery.isError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="px-4 py-10">
                            <AuditErrorState onRetry={() => auditQuery.refetch()} />
                          </TableCell>
                        </TableRow>
                      ) : filteredEvents.length ? (
                        filteredEvents.map((event) => (
                          <TableRow key={getAuditId(event)}>
                            <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                              {getTimestamp(event)}
                            </TableCell>
                            <TableCell>
                              <ModuleBadge module={getAuditModule(event)} />
                            </TableCell>
                            <TableCell className="font-medium">{getActor(event)}</TableCell>
                            <TableCell>{getActionLabel(event)}</TableCell>
                            <TableCell>{getCompanyLabel(event)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {getImpact(event)}
                            </TableCell>
                            <TableCell>
                              <SeverityBadge severity={getSeverity(event.severity)} />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="px-4 py-10">
                            <EmptyAuditState />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Página {auditQuery.data?.page ?? page} de {auditQuery.data?.totalPages ?? 1}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || auditQuery.isFetching}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        auditQuery.isFetching ||
                        page >= (auditQuery.data?.totalPages ?? 1)
                      }
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}

function AuditStat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Siren;
  label: string;
  value: number;
  hint: string;
  tone: "critical" | "warning" | "info" | "neutral";
}) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border",
              tone === "critical" && "border-destructive/25 bg-destructive/10 text-destructive",
              tone === "warning" && "border-warning/25 bg-warning/10 text-warning",
              tone === "info" && "border-info/25 bg-info/10 text-info",
              tone === "neutral" && "border-border bg-muted/60 text-foreground",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: Exclude<Severity, "all"> }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px] uppercase tracking-wider",
        severity === "INFO" && "border-info/25 bg-info/10 text-info",
        severity === "UPDATE" && "border-warning/25 bg-warning/10 text-warning",
        isCriticalSeverity(severity) && "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {getSeverityLabel(severity)}
    </Badge>
  );
}

function ModuleBadge({ module }: { module: Exclude<AuditModule, "all"> }) {
  return (
    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
      {getModuleLabel(module)}
    </Badge>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function AuditLoadingState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="font-medium text-foreground">Cargando auditoría</p>
      <p className="mt-1 text-sm text-muted-foreground">Consultando eventos reales del backend.</p>
    </div>
  );
}

function AuditErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
      <p className="font-medium text-foreground">No fue posible cargar auditoría</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Verifica la sesión SuperAdmin y la disponibilidad del backend.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function EmptyAuditState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="font-medium text-foreground">No hay eventos con esos filtros</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajusta la severidad, el módulo o el término de búsqueda.
      </p>
    </div>
  );
}

function getAuditId(event: AdminAuditRecord) {
  return event.id ?? `${event.action ?? "audit"}-${event.createdAt ?? Math.random()}`;
}

function getSeverity(value: AdminAuditRecord["severity"]): Exclude<Severity, "all"> {
  if (value === "UPDATE" || value === "DELETE" || value === "SECURITY") {
    return value;
  }

  return "INFO";
}

function getSeverityLabel(severity: Exclude<Severity, "all">) {
  switch (severity) {
    case "SECURITY":
      return "Seguridad";
    case "DELETE":
      return "Delete";
    case "UPDATE":
      return "Update";
    case "INFO":
      return "Info";
  }
}

function isCriticalSeverity(value: AdminAuditRecord["severity"]) {
  return value === "SECURITY" || value === "DELETE";
}

function getAuditModule(event: AdminAuditRecord): Exclude<AuditModule, "all"> {
  const module = event.module;

  if (
    module === "platform" ||
    module === "auth" ||
    module === "users" ||
    module === "roles" ||
    module === "organizations" ||
    module === "inventory" ||
    module === "logistics" ||
    module === "production"
  ) {
    return module;
  }

  return classifyModule(event.action ?? "");
}

function getModuleLabel(module: Exclude<AuditModule, "all">) {
  switch (module) {
    case "platform":
      return "SaaS";
    case "auth":
      return "Auth";
    case "users":
      return "Usuarios";
    case "roles":
      return "Roles";
    case "organizations":
      return "Empresas";
    case "inventory":
      return "Inventario";
    case "logistics":
      return "Logística";
    case "production":
      return "Producción";
  }
}

function classifyModule(action: string): Exclude<AuditModule, "all"> {
  const prefix = action.split(".")[0];

  if (prefix === "platform") return "platform";
  if (prefix === "auth") return "auth";
  if (prefix === "user") return "users";
  if (prefix === "role") return "roles";
  if (prefix === "organization") return "organizations";
  if (prefix === "inventory") return "inventory";
  if (prefix === "logistics") return "logistics";
  if (prefix === "production") return "production";

  return "auth";
}

function getActor(event: AdminAuditRecord) {
  return event.actorName || event.actorEmail || event.actor || "Sistema";
}

function getActionLabel(event: AdminAuditRecord) {
  return event.summary || event.action || "Evento de auditoría";
}

function getCompanyLabel(event: AdminAuditRecord) {
  return event.entityLabel || event.company || event.organizationId || "Plataforma";
}

function getTimestamp(event: AdminAuditRecord) {
  return event.createdAt ? event.createdAt.slice(0, 16).replace("T", " ") : event.timestamp || "-";
}

function getImpact(event: AdminAuditRecord) {
  const severity = getSeverity(event.severity);

  if (event.observation) {
    return event.observation;
  }

  if (severity === "SECURITY") {
    return "Evento sensible de acceso o seguridad.";
  }

  if (severity === "DELETE") {
    return "Eliminación registrada; revisar alcance del cambio.";
  }

  if (severity === "UPDATE") {
    return "Cambio operativo con trazabilidad registrada.";
  }

  return "Evento informativo registrado.";
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
