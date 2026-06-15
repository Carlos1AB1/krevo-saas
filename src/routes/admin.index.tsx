import { useMemo } from "react";
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
import {
  adminApi,
  type AdminAuditRecord,
  type AdminCompany,
  type AdminPlan,
} from "@/lib/admin-api";
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
  const companiesQuery = useQuery({
    queryFn: () => adminApi.getCompanies(),
    queryKey: ["admin-companies"],
  });
  const plansQuery = useQuery({
    queryFn: () => adminApi.getPlans(),
    queryKey: ["admin-plans"],
  });
  const billingQuery = useQuery({
    queryFn: () => adminApi.getBilling(),
    queryKey: ["admin-billing"],
  });
  const adminUsersQuery = useQuery({
    queryFn: () => adminApi.getAdminUsers(),
    queryKey: ["admin-users"],
  });
  const auditQuery = useQuery({
    queryFn: () => adminApi.getAudit(),
    queryKey: ["admin-audit"],
  });

  const overview = overviewQuery.data;
  const companies = companiesQuery.data;
  const plans = plansQuery.data;
  const billing = billingQuery.data;
  const adminUsers = adminUsersQuery.data;
  const audit = auditQuery.data;

  const overviewRecentAudit = overview?.recentAudit ?? [];
  const companiesCount = (companies ?? []).length;
  const plansCount = (plans ?? []).length;
  const subscriptionsCount = (billing?.subscriptions ?? []).length;
  const adminUsersCount = (adminUsers ?? []).length;
  const overviewRecentAuditCount = (overview?.recentAudit ?? []).length;

  const safeCompanies = useMemo(() => companies ?? [], [companies]);
  const safePlans = useMemo(() => plans ?? [], [plans]);
  const auditEvents = overviewRecentAudit.length ? overviewRecentAudit : (audit?.data ?? []);
  const planDistribution = useMemo(
    () => buildPlanDistribution(safePlans, safeCompanies),
    [safeCompanies, safePlans],
  );
  const topUsage = useMemo(() => buildTopUsage(safeCompanies), [safeCompanies]);
  const recentCompanies = useMemo(() => safeCompanies.slice(0, 5), [safeCompanies]);

  const totalCompanies = overview?.totalCompanies ?? companiesCount;
  const activeCompanies =
    overview?.activeCompanies ??
    safeCompanies.filter((company) => company.status === "active").length;
  const mrrCents =
    overview?.billing?.monthlyRecurringRevenueCents ??
    getNumericMetric(billing?.metrics, "monthlyRecurringRevenueCents");
  const failedPayments =
    overview?.billing?.pastDueSubscriptions ??
    getNumericMetric(billing?.metrics, "pastDueSubscriptions") ??
    countSubscriptionsByStatus(billing?.subscriptions ?? [], "past_due");
  const criticalEvents = countCriticalAuditEvents(auditEvents) || overviewRecentAuditCount;
  const platformAdminUsers = overview?.platformAdminUsers ?? adminUsersCount;
  const hasInitialData =
    Boolean(overview) || companiesCount > 0 || plansCount > 0 || subscriptionsCount > 0;
  const isInitialLoading =
    !hasInitialData &&
    [overviewQuery, companiesQuery, plansQuery, billingQuery, adminUsersQuery, auditQuery].some(
      (query) => query.isLoading,
    );
  const failedSources = [
    overviewQuery.isError ? "overview" : null,
    companiesQuery.isError ? "empresas" : null,
    plansQuery.isError ? "planes" : null,
    billingQuery.isError ? "billing" : null,
    adminUsersQuery.isError ? "admin users" : null,
    auditQuery.isError ? "auditoría" : null,
  ].filter((source): source is string => Boolean(source));

  const retryAll = () => {
    overviewQuery.refetch();
    companiesQuery.refetch();
    plansQuery.refetch();
    billingQuery.refetch();
    adminUsersQuery.refetch();
    auditQuery.refetch();
  };

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
          {isInitialLoading ? (
            <OverviewLoadingState />
          ) : (
            <>
              {failedSources.length ? (
                <PartialDataNotice failedSources={failedSources} onRetry={retryAll} />
              ) : null}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Empresas activas"
                  value={activeCompanies}
                  delta={undefined}
                  icon={Building2}
                  hint={`${totalCompanies} empresas registradas en total`}
                  tone="nuclear"
                />
                <KpiCard
                  label="MRR activo"
                  value={centsToCop(mrrCents) / 1000000}
                  prefix="$"
                  suffix="M COP"
                  format={(value) => value.toFixed(1)}
                  delta={undefined}
                  icon={TrendingUp}
                  hint={`${subscriptionsCount} suscripciones cargadas desde billing`}
                  tone="reactor"
                />
                <KpiCard
                  label="Pagos fallidos"
                  value={failedPayments}
                  delta={undefined}
                  icon={CreditCard}
                  hint="Suscripciones en mora reportadas por billing"
                />
                <KpiCard
                  label="Alertas críticas"
                  value={criticalEvents}
                  icon={ShieldAlert}
                  hint={`${platformAdminUsers} admins plataforma, ${overviewRecentAuditCount} eventos recientes`}
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
                          Distribución calculada desde planes y empresas, no desde overview.
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/planes">Ver planes</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plansQuery.isLoading && !plansCount ? (
                      <InlineLoadingState label="Cargando planes..." />
                    ) : planDistribution.length ? (
                      planDistribution.map((plan) => {
                        const total = totalCompanies || companiesCount || 1;
                        const percent = Math.round((plan.tenantCount / total) * 100);

                        return (
                          <div key={plan.id} className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {typeof plan.price === "number"
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
                        No hay planes disponibles para calcular la distribución.
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
                      Eventos recientes de auditoría con prioridad operativa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {auditQuery.isLoading && !overviewRecentAuditCount ? (
                      <InlineLoadingState label="Cargando auditoría..." />
                    ) : auditEvents.length ? (
                      auditEvents.slice(0, 4).map((event, index) => (
                        <div
                          key={getAuditEventId(event, index)}
                          className="rounded-lg border border-border bg-background/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              {getAuditField(event, "action", "Evento de auditoría")}
                            </p>
                            <span className="font-mono text-[10px] uppercase text-muted-foreground">
                              {getAuditField(
                                event,
                                "timestamp",
                                getAuditField(event, "createdAt", "-"),
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getAuditField(event, "company", "Plataforma")} ·{" "}
                            {getAuditField(event, "actor", "Sistema")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay eventos recientes de auditoría para mostrar.
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
                    {companiesQuery.isLoading && !companiesCount ? (
                      <InlineLoadingState label="Cargando empresas..." />
                    ) : topUsage.length ? (
                      topUsage.map((company) => {
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
                        No hay límites de transacciones disponibles para calcular uso.
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
                    {companiesQuery.isLoading && !companiesCount ? (
                      <InlineLoadingState label="Cargando empresas..." />
                    ) : recentCompanies.length ? (
                      recentCompanies.map((company) => (
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
                              {company.planName || "Sin plan"} · {company.region || "Sin región"} ·{" "}
                              {company.lastActivity || "Sin actividad reciente"}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-mono text-sm font-semibold text-foreground">
                              ${formatCop(company.mrr ?? 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">MRR</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay empresas disponibles desde el endpoint dedicado.
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

function PartialDataNotice({
  failedSources,
  onRetry,
}: {
  failedSources: string[];
  onRetry: () => void;
}) {
  return (
    <Card className="border-warning/25 bg-warning/5 shadow-[var(--shadow-soft)]">
      <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">Datos parciales en el dashboard</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No se pudo cargar: {failedSources.join(", ")}. La vista continúa con los datos
            disponibles.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

function InlineLoadingState({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function buildPlanDistribution(plans: AdminPlan[], companies: AdminCompany[]) {
  return plans.map((plan) => {
    const matchingCompanies = companies.filter(
      (company) => company.planId === plan.id || company.planName === plan.name,
    );

    return {
      id: plan.id,
      name: plan.name ?? plan.code ?? "Sin nombre",
      period: getBillingIntervalLabel(plan.billingInterval),
      price: centsToUnit(plan.priceCents),
      tenantCount: matchingCompanies.length,
    };
  });
}

function getBillingIntervalLabel(value?: string | null) {
  switch (value?.toUpperCase()) {
    case "YEARLY":
      return "año";
    case "MONTHLY":
      return "mes";
    default:
      return value?.toLowerCase() ?? "mes";
  }
}

function centsToUnit(value?: number | null) {
  return typeof value === "number" ? value / 100 : 0;
}

function buildTopUsage(companies: AdminCompany[]) {
  return companies
    .map((company) => ({
      id: company.id,
      name: company.name,
      planName: company.planName || "Sin plan",
      transactionUsagePercent: getTransactionUsagePercent(company),
    }))
    .filter((company) => company.transactionUsagePercent > 0)
    .sort((left, right) => right.transactionUsagePercent - left.transactionUsagePercent)
    .slice(0, 5);
}

function getTransactionUsagePercent(company: AdminCompany) {
  const limit = company.usage?.transactionsLimit;
  if (!limit) return 0;
  return Math.min(100, Math.round(((company.usage?.transactions ?? 0) / limit) * 100));
}

function centsToCop(value: number | undefined) {
  return Math.round((value ?? 0) / 100);
}

function getNumericMetric(metrics: Record<string, unknown> | undefined, key: string) {
  const value = metrics?.[key];
  return typeof value === "number" ? value : undefined;
}

function countSubscriptionsByStatus(
  subscriptions: Array<{ status?: string | null }>,
  targetStatus: string,
) {
  return subscriptions.filter((subscription) => subscription.status === targetStatus).length;
}

function countCriticalAuditEvents(events: AdminAuditRecord[]) {
  return events.filter((event) => getAuditField(event, "severity", "").toLowerCase() === "critical")
    .length;
}

function getAuditEventId(event: AdminAuditRecord, index: number) {
  return getAuditField(event, "id", `audit-${index}`);
}

function getAuditField(event: AdminAuditRecord, key: keyof AdminAuditRecord, fallback: string) {
  const value = event[key];
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}
