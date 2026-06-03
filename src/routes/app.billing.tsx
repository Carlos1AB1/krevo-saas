import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Sparkles, User, Building2, Shield } from "lucide-react";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useAuth } from "@/features/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/nuclear-ui/kpi-card";

export const Route = createFileRoute("/app/billing")({
  head: () => ({
    meta: [{ title: "Facturación · Krevo" }],
  }),
  component: () => (
    <RequirePermission action="manage" subject="organizations">
      <BillingPage />
    </RequirePermission>
  ),
});

function BillingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Facturación</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Suscripción SaaS · módulo en construcción
          </p>
        </div>
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Próximamente
        </Badge>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-xl border border-dashed border-nuclear/40 bg-nuclear/5 p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-nuclear/10 text-nuclear">
              <Sparkles className="size-7" />
            </div>
            <h2 className="text-xl font-semibold">
              Plan actual: <span className="text-nuclear">Demo</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              La facturación, pasarelas de pago (PSE/Wompi) y límites por plan estarán disponibles
              en una fase posterior del SaaS. Por ahora operas en modo demostración sin cobros.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Organización</p>
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-lg font-semibold truncate">{user?.organizationName ?? "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">ID: {user?.organizationId ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuario activo</p>
                <User className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-lg font-semibold truncate">
                {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <KpiCard
              label="Permisos activos"
              value={user?.permissions.length ?? 0}
              icon={Shield}
              hint={user?.roles.join(", ") || "Sin roles"}
            />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-muted-foreground" />
              Qué incluirá el módulo
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Planes Básico / Pro con límites de usuarios, bodegas y transacciones</li>
              <li>• Historial de facturas y estado de suscripción</li>
              <li>• Integración con pasarela de pagos colombiana</li>
              <li>• Modo solo lectura automático ante mora (<code>past_due</code>)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
