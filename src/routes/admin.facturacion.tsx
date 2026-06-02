import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download, RotateCcw } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCop, invoices } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/facturacion")({
  head: () => ({
    meta: [{ title: "Facturación · SuperAdmin Krevo" }],
  }),
  component: BillingAdminPage,
});

function BillingAdminPage() {
  const paid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const failed = invoices.filter((invoice) => invoice.status === "failed");
  const pending = invoices.filter((invoice) => invoice.status === "pending");

  return (
    <>
      <AdminTopbar
        title="Facturación"
        description="Cobros recurrentes, facturas, fallos de pago y renovaciones SaaS."
        action={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <KpiCard
              label="Cobrado este ciclo"
              value={paid / 1000000}
              prefix="$"
              suffix="M COP"
              icon={CreditCard}
              tone="reactor"
            />
            <KpiCard
              label="Pagos fallidos"
              value={failed.length}
              icon={RotateCcw}
              hint="Cuentas candidatas a modo solo lectura"
            />
            <KpiCard
              label="Pendientes"
              value={pending.length}
              icon={CreditCard}
              hint="Facturas emitidas sin confirmación de pasarela"
            />
          </section>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle>Facturas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:hidden">
                {invoices.map((invoice) => (
                  <article
                    key={invoice.id}
                    className="rounded-lg border border-border bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{invoice.id}</p>
                        <p className="mt-1 truncate font-semibold text-foreground">
                          {invoice.company}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Plan
                        </p>
                        <p className="mt-1 truncate font-medium">{invoice.plan}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Fecha
                        </p>
                        <p className="mt-1 truncate font-mono text-xs">{invoice.date}</p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Valor
                        </p>
                        <p className="mt-1 truncate font-mono font-semibold">
                          ${formatCop(invoice.amount)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-lg border border-border md:block">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="px-4">Factura</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="px-4 font-mono text-xs">{invoice.id}</TableCell>
                        <TableCell className="font-medium">{invoice.company}</TableCell>
                        <TableCell>{invoice.plan}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {invoice.date}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ${formatCop(invoice.amount)}
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
