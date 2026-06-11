import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Database,
  RadioTower,
  Server,
  ShieldAlert,
  Webhook,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companies, usagePercent } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/salud")({
  head: () => ({
    meta: [{ title: "Salud Plataforma · SuperAdmin Krevo" }],
  }),
  component: PlatformHealthPage,
});

type ServiceHealth = {
  icon: typeof Server;
  latencyLabel: string;
  name: string;
  note: string;
  status: "active" | "blocked" | "pending";
};

const services: ServiceHealth[] = [
  {
    name: "API principal",
    status: "active",
    latencyLabel: "184 ms",
    note: "Tráfico estable y sin errores críticos",
    icon: Server,
  },
  {
    name: "PostgreSQL",
    status: "active",
    latencyLabel: "42 ms",
    note: "Consultas dentro de ventana esperada",
    icon: Database,
  },
  {
    name: "Webhooks de cobro",
    status: "pending",
    latencyLabel: "3 fallos",
    note: "Retrasos que afectan conciliación y dunning",
    icon: Webhook,
  },
  {
    name: "Canal de eventos",
    status: "active",
    latencyLabel: "Activo",
    note: "Sin backlog operacional reportado",
    icon: RadioTower,
  },
];

function PlatformHealthPage() {
  const serviceIssues = services.filter((service) => service.status !== "active").length;
  const riskyTenants = companies
    .map((company) => ({
      ...company,
      percent: usagePercent(company.usage.transactions, company.usage.transactionsLimit),
    }))
    .filter((company) => company.percent >= 80 || company.usage.transactionsLimit === null);
  const degradedServices = services.filter((service) => service.status === "pending").length;
  const platformStatus = degradedServices > 0 ? "pending" : "active";

  return (
    <>
      <AdminTopbar
        title="Salud Plataforma"
        description="Disponibilidad, degradación e impacto operativo sobre el SaaS completo."
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HealthStat
              label="Estado general"
              value={platformStatus === "active" ? "Operativo" : "Degradado"}
              helper={
                platformStatus === "active"
                  ? "Servicios críticos dentro de parámetros"
                  : "Hay componentes con impacto operativo"
              }
              tone={platformStatus}
            />
            <HealthStat
              label="Servicios degradados"
              value={degradedServices.toString()}
              helper="Requieren seguimiento técnico u operativo"
              tone={degradedServices > 0 ? "pending" : "active"}
            />
            <HealthStat
              label="Tenants de alto consumo"
              value={riskyTenants.length.toString()}
              helper="Pueden amplificar latencia o carga"
              tone={riskyTenants.length > 0 ? "pending" : "active"}
            />
            <HealthStat
              label="Incidentes priorizados"
              value={serviceIssues.toString()}
              helper="Señales con afectación a cobro o acceso"
              tone={serviceIssues > 0 ? "blocked" : "active"}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Servicios críticos</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <div
                      key={service.name}
                      className="rounded-xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="grid size-10 place-items-center rounded-lg border border-border bg-background text-nuclear">
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">{service.name}</p>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              {service.latencyLabel}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={service.status} />
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">{service.note}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-warning/25 bg-warning/5 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  Qué mirar primero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Si los webhooks de cobro se degradan, la facturación y la suspensión automática se
                  desalinean. Para super admin ese es un problema de ingreso, no solo de tecnología.
                </p>
                <p>
                  Los tenants con consumo alto importan porque pueden distorsionar la salud global
                  de una plataforma compartida. La pregunta no es solo si están “grandes”, sino si
                  afectan a otros.
                </p>
                <p>
                  Un escéptico diría que una plataforma “operativa” con webhooks degradados no está
                  realmente sana. Esa lectura es la correcta para esta vista.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Riesgo operativo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RiskRow
                  tone="pending"
                  title="Cobro y conciliación"
                  description="Webhooks con fallos afectan eventos de pago y reactivación."
                />
                <RiskRow
                  tone="active"
                  title="Base de datos"
                  description="Latencia dentro de rango. Sin señal de saturación estructural."
                />
                <RiskRow
                  tone={riskyTenants.length > 0 ? "pending" : "active"}
                  title="Carga por tenants"
                  description={`${riskyTenants.length} empresas requieren seguimiento por volumen o perfil Enterprise.`}
                />
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Empresas con consumo intensivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskyTenants.map((company) => (
                  <div key={company.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.usage.transactions.toLocaleString("es-CO")} transacciones este
                          mes · {company.region}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {company.usage.transactionsLimit ? `${company.percent}%` : "Enterprise"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          company.usage.transactionsLimit ? "bg-warning" : "bg-nuclear",
                        )}
                        style={{
                          width: `${company.usage.transactionsLimit ? company.percent : 68}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle>Lectura correcta de esta pantalla</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <ReadingNote
                icon={ShieldAlert}
                title="Salud no es solo uptime"
                description="Si el cobro falla o la suspensión automática se rompe, la plataforma está degradada para el negocio."
              />
              <ReadingNote
                icon={Activity}
                title="El contexto importa"
                description="Una sola empresa Enterprise puede tensionar la plataforma más que varias cuentas pequeñas."
              />
              <ReadingNote
                icon={AlertTriangle}
                title="Prioridad por impacto"
                description="Super admin debe ver primero qué afecta ingresos, acceso y experiencia cross-tenant."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function HealthStat({
  helper,
  label,
  tone,
  value,
}: {
  helper: string;
  label: string;
  tone: "active" | "blocked" | "pending";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-3 font-display text-3xl font-semibold tracking-tight text-foreground",
          tone === "active" && "text-success",
          tone === "pending" && "text-warning",
          tone === "blocked" && "text-destructive",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function RiskRow({
  description,
  title,
  tone,
}: {
  description: string;
  title: string;
  tone: "active" | "pending";
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            tone === "active" && "bg-success/10 text-success",
            tone === "pending" && "bg-warning/10 text-warning",
          )}
        >
          <AlertTriangle className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ReadingNote({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof Activity;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted/50 text-nuclear">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
