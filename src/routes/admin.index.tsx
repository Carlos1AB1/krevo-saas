import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Building2,
  CreditCard,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/admin-api";
import { formatCop } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard SuperAdmin · Krevo" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const overviewQuery = useQuery({
    queryFn: () => adminApi.getOverview(),
    queryKey: ["admin-overview"],
  });
  const overview = overviewQuery.data;

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        description="Vista global del negocio SaaS: empresas, cobros, límites y riesgos."
        action={
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/admin/empresas">Nueva empresa</Link>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {overviewQuery.isLoading ? (
            <OverviewLoadingState />
          ) : overviewQuery.isError ? (
            <OverviewErrorState onRetry={() => overviewQuery.refetch()} />
          ) : !overview ? (
            <OverviewEmptyState />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Empresas activas"
                  value={overview.activeCompanies}
                  delta={undefined}
                  icon={Building2}
                  hint={`${overview.totalCompanies} empresas registradas en total`}
                  tone="nuclear"
                />
                <KpiCard
                  label="MRR activo"
                  value={overview.monthlyRevenue / 1000000}
                  prefix="$"
                  suffix="M COP"
                  delta={undefined}
                  icon={TrendingUp}
                  hint="No incluye trials ni cuentas suspendidas"
                  tone="reactor"
                />
                <KpiCard
                  label="Pagos fallidos"
                  value={overview.failedPayments}
                  delta={undefined}
                  icon={CreditCard}
                  hint="Requieren revisión antes de bloqueo"
                />
                <KpiCard
                  label="Alertas críticas"
                  value={overview.criticalEvents}
                  icon={ShieldAlert}
                  hint="Seguridad, cobros y aislamiento multi-tenant"
                  tone="plasma"
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>Empresas por plan</CardTitle>
                        <CardDescription>
                          Distribución comercial enviada por el backend para la consola global.
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/planes">Ver planes</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overview.planDistribution.length ? (
                      overview.planDistribution.map((plan) => {
                        const total = overview.totalCompanies || 1;
                        const percent = Math.round((plan.tenantCount / total) * 100);

                        return (
                          <div key={plan.id} className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {plan.price
                                    ? `$${formatCop(plan.price)} COP/${plan.period}`
                                    : "A medida"}
                                </p>
                              </div>
                              <p className="font-mono text-sm font-semibold text-foreground">
                                {plan.tenantCount} empresas
                              </p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-nuclear"
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        El backend no devolvió planes para mostrar en el overview.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-warning" />
                      Riesgos inmediatos
                    </CardTitle>
                    <CardDescription>
                      Cuentas y eventos que merecen revisión primero.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overview.immediateRisks.length ? (
                      overview.immediateRisks.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-lg border border-border bg-background/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{event.action}</p>
                            <span className="font-mono text-[10px] uppercase text-muted-foreground">
                              {event.timestamp}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.company} · {event.actor}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay riesgos inmediatos reportados por el backend.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="size-4 text-nuclear" />
                      Uso de transacciones
                    </CardTitle>
                    <CardDescription>
                      Señala empresas cerca del límite mensual del plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overview.topUsage.length ? (
                      overview.topUsage.map((company) => {
                        const percent = company.transactionUsagePercent;

                        return (
                          <div key={company.id} className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {company.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{company.planName}</p>
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {percent}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className={
                                  percent > 90
                                    ? "h-full rounded-full bg-destructive"
                                    : percent > 75
                                      ? "h-full rounded-full bg-warning"
                                      : "h-full rounded-full bg-nuclear"
                                }
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        El backend no devolvió datos de uso de transacciones.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>Empresas recientes</CardTitle>
                        <CardDescription>
                          Estado comercial, plan y próxima acción esperada.
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/empresas">Ver todas</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overview.recentCompanies.length ? (
                      overview.recentCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 sm:grid-cols-[1fr_auto]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {company.name}
                              </p>
                              <StatusBadge status={company.status} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {company.planName} · {company.region} · {company.lastActivity}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-mono text-sm font-semibold text-foreground">
                              ${formatCop(company.mrr)}
                            </p>
                            <p className="text-xs text-muted-foreground">MRR</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay empresas recientes enviadas por el backend.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function OverviewLoadingState() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-[var(--shadow-soft)]">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </section>
    </>
  );
}

function OverviewErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div>
          <p className="font-semibold text-foreground">No se pudo cargar el overview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa la sesión o la disponibilidad del backend antes de seguir conectando más módulos.
          </p>
        </div>
        <Button onClick={onRetry}>Reintentar</Button>
      </CardContent>
    </Card>
  );
}

function OverviewEmptyState() {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-6">
        <p className="font-semibold text-foreground">Sin datos</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El backend respondió sin contenido utilizable para el overview.
        </p>
      </CardContent>
    </Card>
  );
}
