import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  CalendarClock,
  CreditCard,
  Download,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
  UsersRound,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type AdminCompany } from "@/lib/admin-api";
import { formatCop, usagePercent } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/empresas")({
  head: () => ({
    meta: [{ title: "Empresas · SuperAdmin Krevo" }],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const companiesQuery = useQuery({
    queryFn: () => adminApi.getCompanies(),
    queryKey: ["admin-companies"],
  });
  const companies = companiesQuery.data ?? [];
  const filteredCompanies = companies.filter((company) =>
    matchesCompanySearch(company, searchQuery),
  );
  const hasSearch = searchQuery.trim().length > 0;

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
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoComplete="off"
                    className="h-10 bg-background pl-9 pr-9"
                  />
                  {hasSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                      aria-label="Limpiar búsqueda"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    {hasSearch
                      ? `${filteredCompanies.length} de ${companies.length} empresas`
                      : `${companies.length} empresas registradas`}
                  </p>
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
              </div>

              {companiesQuery.isLoading ? (
                <CompaniesLoadingState />
              ) : companiesQuery.isError ? (
                <CompaniesErrorState onRetry={() => companiesQuery.refetch()} />
              ) : filteredCompanies.length > 0 ? (
                <>
                  <div className="mt-4 grid gap-3 md:hidden">
                    {filteredCompanies.map((company) => (
                      <article
                        key={company.id}
                        className="rounded-lg border border-border bg-background/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Empresa
                            </p>
                            <p className="truncate font-semibold text-foreground">{company.name}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {company.nit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground"
                            aria-label={`Ver detalles de ${company.name}`}
                            onClick={() => setSelectedCompany(company)}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                          <MobileMetric label="Plan" value={company.planName} />
                          <div className="min-w-0 rounded-md bg-muted/30 p-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Estado
                            </p>
                            <div className="mt-1">
                              <StatusBadge status={company.status} />
                            </div>
                          </div>
                          <MobileMetric
                            label="Próximo cobro"
                            value={company.nextBillingDate ?? "Sin cobro activo"}
                          />
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
                          <TableHead>Próximo cobro</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompanies.map((company) => (
                          <TableRow key={company.id} className="bg-card/40">
                            <TableCell className="px-4 py-4">
                              <div className="min-w-[220px]">
                                <p className="font-semibold text-foreground">{company.name}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {company.nit}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{company.planName}</TableCell>
                            <TableCell>
                              <StatusBadge status={company.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {company.nextBillingDate ?? "Sin cobro activo"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground"
                                aria-label={`Ver detalles de ${company.name}`}
                                onClick={() => setSelectedCompany(company)}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <EmptyCompaniesState
                  hasCompanies={companies.length > 0}
                  searchQuery={searchQuery}
                  onClear={() => setSearchQuery("")}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <CompanyDetailsSheet
        company={selectedCompany}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCompany(null);
          }
        }}
      />
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

function EmptyCompaniesState({
  hasCompanies,
  searchQuery,
  onClear,
}: {
  hasCompanies: boolean;
  searchQuery: string;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background">
        <Search className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        {hasCompanies ? "Sin resultados" : "Sin empresas"}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {hasCompanies
          ? `No encontramos empresas para "${searchQuery.trim()}". Prueba con otro nombre, NIT, plan, estado o administrador.`
          : "El backend no devolvió empresas para mostrar en esta vista."}
      </p>
      {hasCompanies ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onClear}>
          Limpiar búsqueda
        </Button>
      ) : null}
    </div>
  );
}

function matchesCompanySearch(company: AdminCompany, query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchTarget = normalizeSearchValue(
    [
      company.name,
      company.nit,
      company.owner.name,
      company.owner.email,
      company.region,
      company.planId,
      company.planName,
      company.status,
      companyStatusLabels[company.status],
      company.nextBillingDate ?? "",
    ].join(" "),
  );
  const compactTarget = compactSearchValue(searchTarget);

  return normalizedQuery.split(/\s+/).every((term) => {
    const compactTerm = compactSearchValue(term);

    return (
      searchTarget.includes(term) || (compactTerm.length > 0 && compactTarget.includes(compactTerm))
    );
  });
}

const companyStatusLabels: Record<AdminCompany["status"], string> = {
  trial: "Trial",
  active: "Activo",
  past_due: "En mora",
  suspended: "Suspendido",
  cancelled: "Cancelado",
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compactSearchValue(value: string) {
  return value.replace(/[^a-z0-9]/g, "");
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

function CompanyDetailsSheet({
  company,
  onOpenChange,
}: {
  company: AdminCompany | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(company)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        {company && (
          <>
            <div className="border-b border-border p-6 pr-12">
              <SheetHeader>
                <div className="flex items-start gap-3 text-left">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                    <Building2 className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{company.name}</SheetTitle>
                    <SheetDescription className="mt-1 truncate">
                      {company.nit} · {company.region}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StatusBadge status={company.status} />
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                  Plan {company.planName}
                </span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs font-medium text-foreground">
                  ${formatCop(company.mrr)} MRR
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <section className="space-y-3">
                <SectionTitle>Información</SectionTitle>
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailRow icon={UserRound} label="Administrador" value={company.owner.name} />
                  <DetailRow icon={Mail} label="Email" value={company.owner.email} />
                  <DetailRow icon={MapPin} label="Región" value={company.region} />
                  <DetailRow
                    icon={CalendarClock}
                    label="Última actividad"
                    value={company.lastActivity}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Uso del plan</SectionTitle>
                <div className="grid gap-3">
                  <DetailUsage
                    icon={UsersRound}
                    label="Usuarios"
                    current={company.usage.users}
                    limit={company.usage.usersLimit}
                  />
                  <DetailUsage
                    icon={Warehouse}
                    label="Bodegas"
                    current={company.usage.warehouses}
                    limit={company.usage.warehousesLimit}
                  />
                  <DetailUsage
                    icon={Activity}
                    label="Transacciones"
                    current={company.usage.transactions}
                    limit={company.usage.transactionsLimit}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Cobro</SectionTitle>
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailRow
                    icon={CalendarClock}
                    label="Próximo cobro"
                    value={company.nextBillingDate ?? "Sin cobro activo"}
                  />
                  <DetailRow
                    icon={CreditCard}
                    label="MRR"
                    value={`$${formatCop(company.mrr)}`}
                    mono
                  />
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CompaniesLoadingState() {
  return (
    <div className="mt-4 grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-background/70 p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-6 w-48" />
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

function CompaniesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <p className="font-semibold text-foreground">No se pudo cargar la lista de empresas</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Esta vista ya depende del backend. Revisa sesión, permisos o disponibilidad del servicio.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <p className="truncate text-[10px] font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("mt-2 truncate text-sm font-semibold text-foreground", mono && "font-mono")}>
        {value}
      </p>
    </div>
  );
}

function DetailUsage({
  icon: Icon,
  label,
  current,
  limit,
}: {
  icon: LucideIcon;
  label: string;
  current: number;
  limit: number | null;
}) {
  const percent = usagePercent(current, limit);
  const value = limit
    ? `${current.toLocaleString("es-CO")} / ${limit.toLocaleString("es-CO")}`
    : `${current.toLocaleString("es-CO")} / ilimitado`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/40">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{label}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{value}</p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {limit ? `${percent}%` : "Sin límite"}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <UsageBar percent={limit ? percent : 100} muted={!limit} />
      </div>
    </div>
  );
}

function UsageBar({ percent, muted = false }: { percent: number; muted?: boolean }) {
  return (
    <div
      className={cn(
        "h-full rounded-full",
        muted && "bg-muted-foreground/40",
        !muted && (percent >= 95 ? "bg-destructive" : percent >= 80 ? "bg-warning" : "bg-nuclear"),
      )}
      style={{ width: `${percent}%` }}
    />
  );
}
