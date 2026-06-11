import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CreditCard, Download, Search, ShieldAlert, Wallet } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
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
import { companies, formatCop, invoices, type InvoiceRecord } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/facturacion")({
  head: () => ({
    meta: [{ title: "Facturación · SuperAdmin Krevo" }],
  }),
  component: BillingAdminPage,
});

type BillingFilter = "all" | InvoiceRecord["status"];

function BillingAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillingFilter>("all");

  const invoiceRows = useMemo(
    () =>
      invoices.map((invoice) => {
        const company = companies.find((item) => item.name === invoice.company);
        return {
          ...invoice,
          nextBillingDate: company?.nextBillingDate ?? null,
          owner: company?.owner.name ?? "Sin administrador",
          region: company?.region ?? "Sin región",
        };
      }),
    [],
  );

  const paidInvoices = invoiceRows.filter((invoice) => invoice.status === "paid");
  const failedInvoices = invoiceRows.filter((invoice) => invoice.status === "failed");
  const pendingInvoices = invoiceRows.filter((invoice) => invoice.status === "pending");
  const collectedTotal = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const atRiskTotal = failedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const filteredInvoices = invoiceRows.filter((invoice) => {
    const normalizedQuery = normalizeSearch(invoice, searchQuery);
    const statusMatches = statusFilter === "all" || invoice.status === statusFilter;
    return normalizedQuery && statusMatches;
  });

  return (
    <>
      <AdminTopbar
        title="Facturación"
        description="Control de ingresos, riesgo de cobro y cuentas con impacto directo en el SaaS."
        action={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <BillingStat
              icon={Wallet}
              label="Cobrado este ciclo"
              tone="success"
              value={`$${formatCop(collectedTotal)}`}
              helper={`${paidInvoices.length} facturas conciliadas`}
            />
            <BillingStat
              icon={ShieldAlert}
              label="MRR en riesgo"
              tone="danger"
              value={`$${formatCop(atRiskTotal)}`}
              helper={`${failedInvoices.length} pagos fallidos`}
            />
            <BillingStat
              icon={CreditCard}
              label="Pendiente de confirmación"
              tone="warning"
              value={`${pendingInvoices.length}`}
              helper="Facturas emitidas sin confirmación"
            />
            <BillingStat
              icon={AlertTriangle}
              label="Empresas con incidente"
              tone="danger"
              value={`${new Set(failedInvoices.map((invoice) => invoice.company)).size}`}
              helper="Candidatas a seguimiento prioritario"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-sm">
                    <label htmlFor="billing-search" className="sr-only">
                      Buscar factura
                    </label>
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="billing-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por empresa, factura o admin..."
                      className="h-10 bg-background pl-9"
                    />
                  </div>

                  <Tabs
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as BillingFilter)}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                      <TabsTrigger value="all">Todas</TabsTrigger>
                      <TabsTrigger value="paid">Pagadas</TabsTrigger>
                      <TabsTrigger value="failed">Fallidas</TabsTrigger>
                      <TabsTrigger value="pending">Pendientes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {filteredInvoices.length} de {invoiceRows.length} registros
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prioriza fallidas y pendientes antes del siguiente ciclo
                  </p>
                </div>

                {filteredInvoices.length > 0 ? (
                  <>
                    <div className="mt-4 grid gap-3 md:hidden">
                      {filteredInvoices.map((invoice) => (
                        <article
                          key={invoice.id}
                          className="rounded-lg border border-border bg-background/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-muted-foreground">
                                {invoice.id}
                              </p>
                              <p className="mt-1 truncate font-semibold text-foreground">
                                {invoice.company}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {invoice.owner} · {invoice.region}
                              </p>
                            </div>
                            <StatusBadge status={invoice.status} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <InfoPair label="Plan" value={invoice.plan} />
                            <InfoPair label="Fecha factura" value={invoice.date} mono />
                            <InfoPair
                              label="Próximo cobro"
                              value={invoice.nextBillingDate ?? "Sin cobro activo"}
                              mono
                            />
                            <InfoPair label="Valor" value={`$${formatCop(invoice.amount)}`} mono />
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="mt-4 hidden overflow-hidden rounded-lg border border-border md:block">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="px-4">Factura</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Próximo cobro</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="px-4 py-4">
                                <div>
                                  <p className="font-mono text-xs text-foreground">{invoice.id}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {invoice.owner} · {invoice.region}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{invoice.company}</TableCell>
                              <TableCell>
                                <StatusBadge status={invoice.status} />
                              </TableCell>
                              <TableCell>{invoice.plan}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {invoice.nextBillingDate ?? "Sin cobro activo"}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {invoice.date}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                ${formatCop(invoice.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <EmptyBillingState
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    onClear={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle>Alertas del ciclo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {failedInvoices.map((invoice) => (
                    <AlertRow
                      key={invoice.id}
                      tone="danger"
                      title={invoice.company}
                      description={`Pago fallido por $${formatCop(invoice.amount)} en ${invoice.date}`}
                    />
                  ))}
                  {pendingInvoices.map((invoice) => (
                    <AlertRow
                      key={invoice.id}
                      tone="warning"
                      title={invoice.company}
                      description={`Pendiente por conciliar ${invoice.id}`}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle>Lectura para dueño del SaaS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Esta vista debe responder primero: cuánto se cobró, cuánto está en riesgo y qué
                    cuentas requieren intervención antes del próximo cobro.
                  </p>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <p className="font-medium text-foreground">
                      Qué no debería dominar esta pantalla
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li>Detalle contable profundo por tenant.</li>
                      <li>Historial infinito de facturas sin señal operativa.</li>
                      <li>Acciones financieras finas que pertenecen al backend real.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function BillingStat({
  helper,
  icon: Icon,
  label,
  tone,
  value,
}: {
  helper: string;
  icon: typeof Wallet;
  label: string;
  tone: "danger" | "success" | "warning";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "grid size-9 place-items-center rounded-lg",
            tone === "success" && "bg-success/10 text-success",
            tone === "warning" && "bg-warning/10 text-warning",
            tone === "danger" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function AlertRow({
  description,
  title,
  tone,
}: {
  description: string;
  title: string;
  tone: "danger" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md",
            tone === "danger" && "bg-destructive/10 text-destructive",
            tone === "warning" && "bg-warning/10 text-warning",
          )}
        >
          <AlertTriangle className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InfoPair({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md bg-muted/30 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate font-medium text-foreground", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}

function EmptyBillingState({
  onClear,
  searchQuery,
  statusFilter,
}: {
  onClear: () => void;
  searchQuery: string;
  statusFilter: BillingFilter;
}) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-background">
        <Search className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">Sin resultados</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        No encontramos registros para "{searchQuery.trim() || "el filtro actual"}" en{" "}
        {getFilterLabel(statusFilter)}.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}

function getFilterLabel(filter: BillingFilter) {
  if (filter === "all") return "todas las facturas";
  if (filter === "paid") return "facturas pagadas";
  if (filter === "failed") return "facturas fallidas";
  return "facturas pendientes";
}

function normalizeSearch(
  invoice: {
    company: string;
    date: string;
    id: string;
    owner: string;
    plan: string;
    region: string;
    status: string;
  },
  query: string,
) {
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (!normalizedQuery) {
    return true;
  }

  const target = [
    invoice.id,
    invoice.company,
    invoice.plan,
    invoice.owner,
    invoice.region,
    invoice.status,
    invoice.date,
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return normalizedQuery.split(/\s+/).every((term) => target.includes(term));
}
