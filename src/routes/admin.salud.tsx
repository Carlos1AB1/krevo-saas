import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Database, Server, Webhook } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companies, usagePercent } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/salud")({
  head: () => ({
    meta: [{ title: "Salud Plataforma · SuperAdmin Krevo" }],
  }),
  component: PlatformHealthPage,
});

const services = [
  { name: "API NestJS", status: "Operativo", latency: "184 ms", icon: Server },
  { name: "PostgreSQL", status: "Operativo", latency: "42 ms", icon: Database },
  { name: "Webhooks Wompi", status: "Degradado", latency: "3 fallos", icon: Webhook },
  { name: "WebSockets BI", status: "Operativo", latency: "Activo", icon: Activity },
];

function PlatformHealthPage() {
  const riskyTenants = companies
    .map((company) => ({
      ...company,
      percent: usagePercent(company.usage.transactions, company.usage.transactionsLimit),
    }))
    .filter((company) => company.percent >= 80 || company.usage.transactionsLimit === null);

  return (
    <>
      <AdminTopbar
        title="Salud Plataforma"
        description="Estado técnico de servicios, webhooks y consumo intensivo por empresa."
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              const degraded = service.status === "Degradado";

              return (
                <Card key={service.name} className="shadow-[var(--shadow-soft)]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-lg border border-border bg-background text-nuclear">
                        <Icon className="size-4" />
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          degraded
                            ? "border-warning/25 bg-warning/10 text-warning"
                            : "border-success/25 bg-success/10 text-success"
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                    <p className="mt-4 font-semibold text-foreground">{service.name}</p>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">
                      {service.latency}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="border-warning/25 bg-warning/5 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  Qué mirar primero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Los webhooks degradados afectan cobros, suspensión automática y reactivación de
                  empresas en mora.
                </p>
                <p>
                  Las empresas con uso alto pueden provocar lentitud si ejecutan reportes pesados
                  sobre una base multi-tenant compartida.
                </p>
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
                          mes
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {company.usage.transactionsLimit ? `${company.percent}%` : "Enterprise"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-warning"
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
        </div>
      </main>
    </>
  );
}
