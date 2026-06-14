import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, ScrollText, Siren, UserLock } from "lucide-react";
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
import { adminUsers, companies, globalAuditEvents } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

type Severity = "all" | "info" | "warning" | "critical";
type AuditDomain = "all" | "billing" | "plans" | "security" | "tenants";

type AuditRow = (typeof globalAuditEvents)[number] & {
  domain: Exclude<AuditDomain, "all">;
  impact: string;
};

const auditRows: AuditRow[] = globalAuditEvents.map((event) => ({
  ...event,
  domain: classifyDomain(event.action, event.actor),
  impact: classifyImpact(event),
}));

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [{ title: "Auditoría · SuperAdmin Krevo" }],
  }),
  component: GlobalAuditPage,
});

function GlobalAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity>("all");
  const [domainFilter, setDomainFilter] = useState<AuditDomain>("all");

  const filteredEvents = useMemo(() => {
    const term = normalizeSearch(searchQuery);

    return auditRows.filter((event) => {
      const matchesSeverity = severityFilter === "all" || event.severity === severityFilter;
      const matchesDomain = domainFilter === "all" || event.domain === domainFilter;

      const haystack = normalizeSearch(
        [
          event.actor,
          event.action,
          event.company,
          event.timestamp,
          event.impact,
          getDomainLabel(event.domain),
        ].join(" "),
      );

      const matchesSearch = !term || haystack.includes(term);

      return matchesSeverity && matchesDomain && matchesSearch;
    });
  }, [domainFilter, searchQuery, severityFilter]);

  const criticalEvents = auditRows.filter((event) => event.severity === "critical").length;
  const securityEvents = auditRows.filter((event) => event.domain === "security").length;
  const platformWideEvents = auditRows.filter((event) =>
    event.company.toLowerCase().includes("todas"),
  ).length;
  const activeAdmins = adminUsers.filter((user) => user.status === "active").length;

  return (
    <>
      <AdminTopbar
        title="Auditoría"
        description="Trazabilidad global sobre cambios de planes, cobros, seguridad y decisiones que afectan varias empresas."
        action={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="w-full space-y-5">
          {/* Banner informativo eliminado por no aportar información relevante */}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AuditStat
              label="Eventos críticos"
              value={criticalEvents}
              hint="Requieren lectura inmediata."
              tone="critical"
              icon={Siren}
            />
            <AuditStat
              label="Incidentes de seguridad"
              value={securityEvents}
              hint="Intentos o bloqueos de acceso sensible."
              tone="warning"
              icon={UserLock}
            />
            <AuditStat
              label="Cambios de impacto amplio"
              value={platformWideEvents}
              hint="Afectan varias empresas o un plan base."
              tone="info"
              icon={ScrollText}
            />
            <AuditStat
              label="Admins activos"
              value={activeAdmins}
              hint={`${companies.length} empresas bajo gobierno actual.`}
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
                      {filteredEvents.length} evento{filteredEvents.length === 1 ? "" : "s"} visible
                      {searchQuery ? ` para "${searchQuery}"` : ""}.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[420px]">
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por actor, acción, empresa o impacto..."
                      className="h-10"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Tabs
                        value={severityFilter}
                        onValueChange={(value) => setSeverityFilter(value as Severity)}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="all">Todas</TabsTrigger>
                          <TabsTrigger value="critical">Críticas</TabsTrigger>
                          <TabsTrigger value="warning">Advert.</TabsTrigger>
                          <TabsTrigger value="info">Info</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <Tabs
                        value={domainFilter}
                        onValueChange={(value) => setDomainFilter(value as AuditDomain)}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="all">Todo</TabsTrigger>
                          <TabsTrigger value="billing">Cobros</TabsTrigger>
                          <TabsTrigger value="plans">Planes</TabsTrigger>
                          <TabsTrigger value="security">Seg.</TabsTrigger>
                          <TabsTrigger value="tenants">Tenants</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-3 md:hidden">
                  {filteredEvents.length ? (
                    filteredEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-lg border border-border bg-background/80 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <SeverityBadge severity={event.severity} />
                              <DomainBadge domain={event.domain} />
                            </div>
                            <p className="mt-3 font-semibold text-foreground">{event.action}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{event.company}</p>
                          </div>
                          <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {event.timestamp}
                          </p>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                          <InfoPair label="Actor" value={event.actor} />
                          <InfoPair label="Impacto" value={event.impact} />
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
                        <TableHead>Dominio</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Impacto</TableHead>
                        <TableHead>Severidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.length ? (
                        filteredEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                              {event.timestamp}
                            </TableCell>
                            <TableCell>
                              <DomainBadge domain={event.domain} />
                            </TableCell>
                            <TableCell className="font-medium">{event.actor}</TableCell>
                            <TableCell>{event.action}</TableCell>
                            <TableCell>{event.company}</TableCell>
                            <TableCell className="text-muted-foreground">{event.impact}</TableCell>
                            <TableCell>
                              <SeverityBadge severity={event.severity} />
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
              </CardContent>
            </Card>

          {/* Contenido lateral eliminado por no aportar información útil */}
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
        severity === "info" && "border-info/25 bg-info/10 text-info",
        severity === "warning" && "border-warning/25 bg-warning/10 text-warning",
        severity === "critical" && "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {severity === "critical" ? "Crítico" : severity === "warning" ? "Advertencia" : "Info"}
    </Badge>
  );
}

function DomainBadge({ domain }: { domain: Exclude<AuditDomain, "all"> }) {
  return (
    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
      {getDomainLabel(domain)}
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

function ReadingNote({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "critical" | "warning" | "info";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "critical" && "border-destructive/20 bg-destructive/5",
        tone === "warning" && "border-warning/20 bg-warning/5",
        tone === "info" && "border-info/20 bg-info/5",
      )}
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
function EmptyAuditState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="font-medium text-foreground">No hay eventos con esos filtros</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajusta la severidad, el dominio o el término de búsqueda.
      </p>
    </div>
  );
}

function getDomainLabel(domain: Exclude<AuditDomain, "all">) {
  switch (domain) {
    case "billing":
      return "Cobros";
    case "plans":
      return "Planes";
    case "security":
      return "Seguridad";
    case "tenants":
      return "Tenants";
  }
}

function classifyDomain(action: string, actor: string): Exclude<AuditDomain, "all"> {
  const text = `${action} ${actor}`.toLowerCase();

  if (text.includes("cobro") || text.includes("renovación")) return "billing";
  if (text.includes("plan") || text.includes("límite")) return "plans";
  if (text.includes("iam") || text.includes("acceso") || text.includes("tenant")) return "security";
  return "tenants";
}

function classifyImpact(event: (typeof globalAuditEvents)[number]) {
  if (event.company.toLowerCase().includes("todas")) {
    return "Puede alterar la oferta base de un segmento completo.";
  }

  if (event.severity === "critical") {
    return "Riesgo alto sobre cobro, acceso o aislamiento.";
  }

  if (event.severity === "warning") {
    return "Cambio con efecto potencial sobre clientes activos.";
  }

  return "Evento operativo registrado sin bloqueo actual.";
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
