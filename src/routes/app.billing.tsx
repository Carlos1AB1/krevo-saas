import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Zap,
  BarChart3,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  getSubscription,
  getPlans,
  createCheckoutToken,
  syncPayment,
  type OrganizationSubscription,
  type SaasPlan,
} from "@/features/billing/billing.api";
import { PlanSelector } from "@/features/billing/PlanSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


// ─── Route ────────────────────────────────────────────────────────────────────

const searchSchema = z.object({
  payment: z.enum(["success", "error"]).optional(),
});

export const Route = createFileRoute("/app/billing")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Facturación · Krevo" }],
  }),
  errorComponent: ({ error }) => {
    return (
      <div className="p-8 text-red-500 bg-red-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error Boundary Crashed</h1>
        <pre className="whitespace-pre-wrap text-sm">{error.message}</pre>
        <pre className="whitespace-pre-wrap text-xs mt-4 opacity-70">{error.stack}</pre>
      </div>
    );
  },
  component: () => (
    <RequirePermission action="manage" subject="organizations">
      <BillingPage />
    </RequirePermission>
  ),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

type View = "overview" | "plans";

function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/app/billing" });
  const queryClient = useQueryClient();

  const [view, setView] = useState<View>("overview");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // ─── Queries ─────────────────────────────────────────────────────────────────

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: getSubscription,
    staleTime: 60_000,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: getPlans,
    staleTime: 10 * 60_000,
  });

  // ─── Handle redirect from 3DS / dLocalGo ─────────────────────────────────────

  const syncMutation = useMutation({
    mutationFn: syncPayment,
    onSuccess: (data) => {
      if (data.status === "ACTIVE") {
        toast.success("¡Pago exitoso!", {
          description: "Tu suscripción está activa. Bienvenido a Krevo.",
        });
      } else {
        toast.success("Pago recibido", {
          description: `Tu pago está siendo procesado (Estado: ${data.status}).`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      navigate({ to: "/app/billing", replace: true });
    },
    onError: () => {
      toast.error("Error verificando pago", {
        description: "El pago pudo completarse, pero hubo un error al sincronizar.",
      });
      navigate({ to: "/app/billing", replace: true });
    },
  });

  const syncCalled = useRef(false);

  useEffect(() => {
    if (search.payment === "success" && !syncCalled.current) {
      syncCalled.current = true;
      syncMutation.mutate();
    } else if (search.payment === "error" && !syncCalled.current) {
      syncCalled.current = true;
      toast.error("El pago no se completó", {
        description: "Por favor verifica los datos de tu tarjeta e intenta de nuevo.",
      });
      navigate({ to: "/app/billing", replace: true });
    }
  }, [search.payment]);

  // ─── Mutations ────────────────────────────────────────────────────────────────

  const createTokenMutation = useMutation({
    mutationFn: (planId: string) => createCheckoutToken(planId),
    onSuccess: (data) => {
      // Redirigir al usuario al Checkout Estándar de dLocalGo
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error("Error", { description: "No se recibió la URL de pago." });
      }
    },
    onError: () => {
      toast.error("Error al iniciar el pago", {
        description: "No se pudo conectar con la pasarela de pagos. Intenta de nuevo.",
      });
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleProceedToCheckout = () => {
    if (!selectedPlanId) return;
    createTokenMutation.mutate(selectedPlanId);
  };


  // ─── Derived state ────────────────────────────────────────────────────────────

  const isActive = subscription?.status === "ACTIVE";
  const isPastDue = subscription?.status === "PAST_DUE";
  const isTrialing = subscription?.status === "TRIALING";
  const isExpired = subscription?.status === "EXPIRED" || subscription?.status === "CANCELED";

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/90 backdrop-blur-xl px-4 sm:px-6">
        {view !== "overview" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setView("overview");
              setSelectedPlanId(null);
            }}
            className="-ml-2 gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
        )}
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Facturación</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {view === "overview" && "Suscripción y plan de tu organización"}
            {view === "plans" && "Selecciona un plan para continuar"}
          </p>
        </div>
        <SubscriptionBadge subscription={subscription} loading={subLoading} />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {/* ── Overview ── */}
            {view === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Status card */}
                <SubscriptionStatusCard
                  subscription={subscription}
                  loading={subLoading}
                  onUpgrade={() => setView("plans")}
                />

                {/* Stats */}
                {subscription && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                      icon={Users}
                      label="Usuarios incluidos"
                      value={subscription.plan.maxUsers ?? "Ilimitados"}
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Productos incluidos"
                      value={
                        subscription.plan.maxProducts
                          ? subscription.plan.maxProducts.toLocaleString("es-CO")
                          : "Ilimitados"
                      }
                    />
                    <StatCard
                      icon={Shield}
                      label="Plan activo"
                      value={subscription.plan.name}
                      highlight
                    />
                  </div>
                )}

                {/* What's included */}
                <div className="rounded-xl border border-border bg-card shadow-sm p-5">
                  <h3 className="font-semibold flex items-center gap-2 text-base mb-4">
                    <Zap className="size-4 text-[var(--nuclear)]" />
                    Tu plan incluye
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                    {[
                      "Gestión de inventario WMS",
                      "Órdenes de producción y fórmulas BOM",
                      "Logística: recepciones y despachos",
                      "Auditoría completa de cambios",
                      "Control de roles y permisos RBAC",
                      "Soporte por chat prioritario",
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade CTA for non-active subscriptions */}
                {!isActive && (
                  <div className="rounded-xl border border-[var(--nuclear)]/30 bg-[var(--nuclear)]/5 p-6 text-center">
                    <Sparkles className="mx-auto mb-3 size-8 text-[var(--nuclear)]" />
                    <h2 className="text-lg font-semibold">
                      {isPastDue ? "Actualiza tu método de pago" : "Activa tu suscripción"}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                      {isPastDue || isExpired
                        ? "Tu acceso está limitado. Completa el pago para restaurar todas las funcionalidades."
                        : `Tienes ${subscription?.trialDaysLeft ?? 0} días de prueba. Activa un plan para continuar sin interrupciones.`}
                    </p>
                    <Button
                      variant="nuclear"
                      className="mt-4 gap-2"
                      onClick={() => setView("plans")}
                    >
                      <CreditCard className="size-4" />
                      {isPastDue ? "Actualizar pago" : "Ver planes"}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Plan selector ── */}
            {view === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Elige tu plan</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sin contratos, cancela cuando quieras.
                  </p>
                </div>

                <PlanSelector
                  plans={plans}
                  currentPlanId={subscription?.planId ?? null}
                  currentStatus={subscription?.status ?? null}
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={handleSelectPlan}
                  isLoading={plansLoading || createTokenMutation.isPending}
                />

                {selectedPlanId && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end pt-2"
                  >
                    <Button
                      variant="nuclear"
                      size="lg"
                      className="gap-2 min-w-48"
                      onClick={handleProceedToCheckout}
                      disabled={createTokenMutation.isPending}
                    >
                      {createTokenMutation.isPending ? (
                        <>Preparando pago…</>
                      ) : (
                        <>
                          <CreditCard className="size-4" />
                          Continuar al pago
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}


          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubscriptionBadge({
  subscription,
  loading,
}: {
  subscription: OrganizationSubscription | null | undefined;
  loading: boolean;
}) {
  if (loading) return null;
  if (!subscription) return null;

  const variants: Record<string, { label: string; className: string }> = {
    TRIALING: {
      label: `Trial · ${subscription.trialDaysLeft ?? 0}d`,
      className: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    ACTIVE: {
      label: "Activo",
      className: "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400",
    },
    PAST_DUE: {
      label: "Pago pendiente",
      className: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
    },
    EXPIRED: {
      label: "Expirado",
      className: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
    },
    CANCELED: {
      label: "Cancelado",
      className: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
  };

  const v = variants[subscription.status];
  if (!v) return null;

  return (
    <Badge variant="outline" className={cn("text-xs", v.className)}>
      {v.label}
    </Badge>
  );
}

function SubscriptionStatusCard({
  subscription,
  loading,
  onUpgrade,
}: {
  subscription: OrganizationSubscription | null | undefined;
  loading: boolean;
  onUpgrade: () => void;
}) {
  if (loading) {
    return (
      <div className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
    );
  }

  if (!subscription) return null;

  const isActive = subscription.status === "ACTIVE";
  const isPastDue = subscription.status === "PAST_DUE";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border p-5",
        isActive
          ? "border-green-500/30 bg-green-500/5"
          : isPastDue
            ? "border-red-500/30 bg-red-500/5"
            : "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          isActive
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : isPastDue
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        )}
      >
        {isActive ? (
          <CheckCircle2 className="size-6" />
        ) : isPastDue ? (
          <AlertTriangle className="size-6" />
        ) : (
          <Clock className="size-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-lg leading-tight">
          Plan {subscription.plan.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isActive && subscription.currentPeriodEnd
            ? `Próximo cobro: ${new Date(subscription.currentPeriodEnd).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}`
            : isPastDue
              ? "Tu último pago falló. Actualiza tu método de pago."
              : subscription.trialDaysLeft !== null && subscription.trialDaysLeft > 0
                ? `Tu prueba vence en ${subscription.trialDaysLeft} día${subscription.trialDaysLeft !== 1 ? "s" : ""}`
                : "Tu prueba ha finalizado"}
        </p>
      </div>
      <Button
        variant={isActive ? "outline" : "nuclear"}
        size="sm"
        onClick={onUpgrade}
        className="shrink-0"
      >
        {isActive ? "Cambiar plan" : isPastDue ? "Actualizar pago" : "Activar plan"}
      </Button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon
          className={cn(
            "size-4",
            highlight ? "text-[var(--nuclear)]" : "text-muted-foreground"
          )}
        />
      </div>
      <p className={cn("text-xl font-semibold truncate", highlight && "text-[var(--nuclear)]")}>
        {value}
      </p>
    </div>
  );
}

function OrderSummary({ plan }: { plan: SaasPlan }) {
  const price = plan.priceCents / 100;
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: plan.currency,
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-fit">
      <h3 className="font-semibold text-base mb-4">Resumen del pedido</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium">{plan.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Facturación</span>
          <span>{plan.billingInterval === "MONTHLY" ? "Mensual" : "Anual"}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatted}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          + IVA según aplique en Colombia
        </p>
      </div>

      <div className="mt-5 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-green-500 shrink-0" />
          Pago 100% seguro · PCI DSS
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
          Cancela cuando quieras
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
          Soporte incluido
        </div>
      </div>
    </div>
  );
}
