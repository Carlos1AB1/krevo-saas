import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, ShieldAlert, CheckCircle2, AlertTriangle, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [{ title: "Facturación y Suscripción · Nuclear WMS" }],
  }),
  component: BillingPage,
});

const currentPlan = {
  name: "Pro Plan",
  price: 299000,
  currency: "COP",
  period: "mes",
  status: "active", // can be 'active', 'past_due'
  nextBillingDate: "2026-06-12",
  limits: {
    users: { current: 18, max: 20 },
    warehouses: { current: 3, max: 5 },
    transactions: { current: 45000, max: 100000 },
  },
};

const pastInvoices = [
  { id: "INV-2026-05", date: "2026-05-12", amount: 299000, status: "paid" },
  { id: "INV-2026-04", date: "2026-04-12", amount: 299000, status: "paid" },
  { id: "INV-2026-03", date: "2026-03-12", amount: 299000, status: "paid" },
];

function BillingPage() {
  const isPastDue = currentPlan.status === "past_due";

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Facturación (Billing)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Gestión de suscripción SaaS, límites y pasarela de pago.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {isPastDue && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3 text-destructive shadow-sm">
              <ShieldAlert className="size-5 mt-0.5" />
              <div>
                <h2 className="font-semibold text-base text-destructive">Suscripción en Mora (Modo Solo Lectura)</h2>
                <p className="text-sm mt-1 opacity-90">
                  La pasarela de pagos reportó un rechazo en el último intento de cobro. Las
                  acciones de escritura (crear, editar, eliminar) han sido suspendidas. Actualice su
                  método de pago inmediatamente para restaurar la operación normal del CEDI.
                </p>
                <Button
                  variant="outline"
                  className="mt-3 bg-background border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  size="sm"
                >
                  Actualizar Método de Pago Vía PSE/Wompi
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Plan Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-1">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      Plan Actual: <span className="text-nuclear">{currentPlan.name}</span>
                      {currentPlan.status === "active" ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20 ml-2"
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20 ml-2"
                        >
                          En Mora
                        </Badge>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Facturación {currentPlan.period === "mes" ? "mensual" : "anual"}. Próximo
                      pago: {currentPlan.nextBillingDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">
                      $ {currentPlan.price.toLocaleString("es-CO")}{" "}
                      <span className="text-sm font-normal text-muted-foreground">COP</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Uso de Límites del Plan
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Usuarios</span>
                        <span className="text-muted-foreground">
                          {currentPlan.limits.users.current} / {currentPlan.limits.users.max}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-nuclear"
                          style={{
                            width: `${(currentPlan.limits.users.current / currentPlan.limits.users.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Bodegas (CEDI)</span>
                        <span className="text-muted-foreground">
                          {currentPlan.limits.warehouses.current} /{" "}
                          {currentPlan.limits.warehouses.max}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-nuclear"
                          style={{
                            width: `${(currentPlan.limits.warehouses.current / currentPlan.limits.warehouses.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Movimientos</span>
                        <span className="text-muted-foreground">
                          {(currentPlan.limits.transactions.current / 1000).toFixed(0)}k /{" "}
                          {(currentPlan.limits.transactions.max / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-nuclear"
                          style={{
                            width: `${(currentPlan.limits.transactions.current / currentPlan.limits.transactions.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button variant="default">Mejorar Plan (Upgrade)</Button>
                  <Button variant="outline">Cancelar Suscripción</Button>
                </div>
              </div>

              {/* Planes Disponibles */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-5 sm:p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground text-base">
                  <Zap className="size-4 text-nuclear" /> Opciones de Suscripción
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-border rounded-lg p-4 opacity-70">
                    <h3 className="font-medium text-sm text-foreground">Básico</h3>
                    <p className="text-2xl font-bold font-mono mt-2">
                      $99.000{" "}
                      <span className="text-xs font-normal text-muted-foreground">COP/mes</span>
                    </p>
                    <ul className="text-sm space-y-2 mt-4 text-muted-foreground">
                      <li>• Hasta 5 usuarios</li>
                      <li>• 1 Bodega / CEDI</li>
                      <li>• 10,000 tx / mes</li>
                    </ul>
                  </div>
                  <div className="border-2 border-nuclear rounded-lg p-4 bg-nuclear/5 relative">
                    <div className="absolute top-0 right-0 bg-nuclear text-background text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-sm">
                      Actual
                    </div>
                    <h3 className="font-medium text-nuclear text-sm">Pro (Recomendado)</h3>
                    <p className="text-2xl font-bold font-mono mt-2">
                      $299.000{" "}
                      <span className="text-xs font-normal text-muted-foreground">COP/mes</span>
                    </p>
                    <ul className="text-sm space-y-2 mt-4 text-foreground/80">
                      <li>• Hasta 20 usuarios</li>
                      <li>• Hasta 5 Bodegas / CEDI</li>
                      <li>• 100,000 tx / mes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices and Payment Method */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground text-base">
                  <CreditCard className="size-4" /> Método de Pago
                </h2>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                  <div className="bg-background p-1 rounded border shadow-sm">
                    <Wallet className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">VISA terminada en 4242</p>
                    <p className="text-xs text-muted-foreground">Expira 12/28</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Actualizar Método (ePayco/Wompi)
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                <h2 className="font-semibold mb-4 text-foreground text-base">Historial de Pagos</h2>
                <div className="space-y-3">
                  {pastInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{inv.date}</p>
                        <p className="text-xs text-muted-foreground">{inv.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">${inv.amount.toLocaleString("es-CO")}</p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          {inv.status === "paid" ? (
                            <>
                              <CheckCircle2 className="size-3 text-success" />
                              <span className="text-[10px] uppercase text-success font-medium">
                                Pagado
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="size-3 text-warning" />
                              <span className="text-[10px] uppercase text-warning font-medium">
                                Pendiente
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" size="sm" className="w-full mt-2 text-muted-foreground">
                  Ver todo el historial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
