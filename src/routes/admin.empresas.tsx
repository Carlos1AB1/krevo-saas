import { createFileRoute } from "@tanstack/react-router";
import { Building2, Download, MoreHorizontal, Plus, Search } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { companies, formatCop, getPlanName, usagePercent } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/empresas")({
  head: () => ({
    meta: [{ title: "Empresas · SuperAdmin Krevo" }],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <>
      <AdminTopbar
        title="Empresas"
        description="Gestión de clientes, estados de suscripción, límites y actividad reciente."
        action={
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nueva empresa</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <SummaryTile label="Total empresas" value={companies.length.toString()} />
            <SummaryTile
              label="Activas"
              value={companies.filter((company) => company.status === "active").length.toString()}
              tone="success"
            />
            <SummaryTile
              label="En mora"
              value={companies.filter((company) => company.status === "past_due").length.toString()}
              tone="warning"
            />
            <SummaryTile
              label="Suspendidas"
              value={companies
                .filter((company) => company.status === "suspended")
                .length.toString()}
              tone="danger"
            />
          </section>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <label htmlFor="company-search" className="sr-only">
                    Buscar empresa
                  </label>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-search"
                    placeholder="Buscar por empresa, NIT o admin..."
                    className="h-10 bg-background pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button variant="outline" size="sm">
                    <Building2 className="size-4" />
                    <span className="truncate">Filtrar</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="size-4" />
                    <span className="truncate">Exportar</span>
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:hidden">
                {companies.map((company) => (
                  <article
                    key={company.id}
                    className="rounded-lg border border-border bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{company.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {company.nit} · {company.region}
                        </p>
                      </div>
                      <StatusBadge status={company.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <MobileMetric label="Plan" value={getPlanName(company.planId)} />
                      <MobileMetric label="MRR" value={`$${formatCop(company.mrr)}`} mono />
                      <MobileMetric
                        label="Usuarios"
                        value={`${company.usage.users}/${company.usage.usersLimit ?? "∞"}`}
                      />
                      <MobileMetric
                        label="Bodegas"
                        value={`${company.usage.warehouses}/${company.usage.warehousesLimit ?? "∞"}`}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Transacciones
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {usagePercent(
                            company.usage.transactions,
                            company.usage.transactionsLimit,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <UsageBar
                          percent={usagePercent(
                            company.usage.transactions,
                            company.usage.transactionsLimit,
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {company.owner.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Próximo cobro: {company.nextBillingDate ?? "sin cobro"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground"
                        aria-label={`Acciones para ${company.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 hidden overflow-hidden rounded-lg border border-border md:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="px-4">Empresa</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Usuarios</TableHead>
                      <TableHead>Bodegas</TableHead>
                      <TableHead>Transacciones</TableHead>
                      <TableHead>Próximo cobro</TableHead>
                      <TableHead className="text-right">MRR</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} className="bg-card/40">
                        <TableCell className="px-4 py-4">
                          <div className="min-w-[220px]">
                            <p className="font-semibold text-foreground">{company.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {company.nit} · {company.region}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {company.owner.name} · {company.owner.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{getPlanName(company.planId)}</TableCell>
                        <TableCell>
                          <StatusBadge status={company.status} />
                        </TableCell>
                        <TableCell>
                          <UsageCell
                            current={company.usage.users}
                            limit={company.usage.usersLimit}
                          />
                        </TableCell>
                        <TableCell>
                          <UsageCell
                            current={company.usage.warehouses}
                            limit={company.usage.warehousesLimit}
                          />
                        </TableCell>
                        <TableCell>
                          <UsageCell
                            current={company.usage.transactions}
                            limit={company.usage.transactionsLimit}
                            compact
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {company.nextBillingDate ?? "Sin cobro activo"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ${formatCop(company.mrr)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            aria-label={`Acciones para ${company.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function SummaryTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-semibold tracking-tight text-foreground",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function UsageCell({
  current,
  limit,
  compact = false,
}: {
  current: number;
  limit: number | null;
  compact?: boolean;
}) {
  const percent = usagePercent(current, limit);
  const label = limit
    ? `${current.toLocaleString("es-CO")} / ${limit.toLocaleString("es-CO")}`
    : `${current.toLocaleString("es-CO")} / ilimitado`;

  return (
    <div className="min-w-[120px] space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-foreground">{label}</span>
        {!compact && <span className="text-[10px] text-muted-foreground">{percent}%</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <UsageBar percent={percent} />
      </div>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-md bg-muted/30 p-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 truncate font-semibold text-foreground", mono && "font-mono")}>
        {value}
      </p>
    </div>
  );
}

function UsageBar({ percent }: { percent: number }) {
  return (
    <div
      className={cn(
        "h-full rounded-full",
        percent >= 95 ? "bg-destructive" : percent >= 80 ? "bg-warning" : "bg-nuclear",
      )}
      style={{ width: `${percent}%` }}
    />
  );
}
