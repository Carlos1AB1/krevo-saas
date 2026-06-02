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
            Exportar
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
              <div className="overflow-hidden rounded-lg border border-border">
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
