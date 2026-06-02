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
            Nueva empresa
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
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
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Building2 className="size-4" />
                    Filtrar estado
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="size-4" />
                    Exportar CSV
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border">
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
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 95 ? "bg-destructive" : percent >= 80 ? "bg-warning" : "bg-nuclear",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
