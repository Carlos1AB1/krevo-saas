import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, SlidersHorizontal } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCop, saasPlans } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/planes")({
  head: () => ({
    meta: [{ title: "Planes · SuperAdmin Krevo" }],
  }),
  component: PlansPage,
});

function PlansPage() {
  return (
    <>
      <AdminTopbar
        title="Planes"
        description="Configuración comercial de límites, precios y módulos por suscripción."
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Nuevo plan
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {saasPlans.map((plan) => (
            <Card key={plan.id} className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.tenantCount} empresas usando este plan
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-nuclear">
                    <SlidersHorizontal className="size-4" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    {plan.price ? `$${formatCop(plan.price)}` : "A medida"}
                  </p>
                  <p className="text-xs text-muted-foreground">COP / {plan.period}</p>
                </div>

                <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <Limit label="Usuarios" value={plan.limits.users} />
                  <Limit label="Bodegas" value={plan.limits.warehouses} />
                  <Limit label="Transacciones" value={plan.limits.transactions} />
                </div>

                <ul className="space-y-2 text-sm">
                  {plan.enabledModules.map((module) => (
                    <li key={module} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{module}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full">
                  Editar plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}

function Limit({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">
        {value ? value.toLocaleString("es-CO") : "Ilimitado"}
      </span>
    </div>
  );
}
