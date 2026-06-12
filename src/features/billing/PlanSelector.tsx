/**
 * PlanSelector — Grilla de planes de suscripción de Krevo.
 * Muestra las features de cada plan y permite seleccionar uno para pagar.
 */

import { Check, Zap, Rocket, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SaasPlan, SubscriptionStatus } from "./billing.api";

interface PlanSelectorProps {
  plans: SaasPlan[];
  currentPlanId: string | null;
  currentStatus: SubscriptionStatus | null;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  basico: Zap,
  pro: Rocket,
  enterprise: Building2,
};

const PLAN_GRADIENTS: Record<string, string> = {
  basico: "from-blue-500/10 to-blue-600/5",
  pro: "from-purple-500/10 to-violet-600/5",
  enterprise: "from-amber-500/10 to-orange-600/5",
};

const PLAN_BORDER: Record<string, string> = {
  basico: "border-blue-500/30 hover:border-blue-500/60",
  pro: "border-violet-500/30 hover:border-violet-500/60",
  enterprise: "border-amber-500/30 hover:border-amber-500/60",
};

const PLAN_BADGE: Record<string, string> = {
  basico: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pro: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  enterprise: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

/** Formatea precio en pesos colombianos */
function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Extrae el array de features del JSON del plan */
function getPlanFeatures(plan: SaasPlan): string[] {
  if (!plan.features) return [];
  const f = plan.features as Record<string, unknown>;
  if (Array.isArray(f.items)) return f.items as string[];
  return [];
}

export function PlanSelector({
  plans,
  currentPlanId,
  currentStatus,
  selectedPlanId,
  onSelectPlan,
  isLoading = false,
}: PlanSelectorProps) {
  const isActive = currentStatus === "ACTIVE";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const code = plan.code.toLowerCase();
        const Icon = PLAN_ICONS[code] ?? Zap;
        const gradient = PLAN_GRADIENTS[code] ?? PLAN_GRADIENTS.basico;
        const borderClass = PLAN_BORDER[code] ?? PLAN_BORDER.basico;
        const badgeClass = PLAN_BADGE[code] ?? PLAN_BADGE.basico;
        const features = getPlanFeatures(plan);

        const isCurrent = plan.id === currentPlanId && isActive;
        const isSelected = plan.id === selectedPlanId;
        const isPro = code === "pro";

        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-gradient-to-br p-5 transition-all duration-200 cursor-pointer",
              gradient,
              borderClass,
              isSelected && "ring-2 ring-[var(--nuclear)] ring-offset-2 ring-offset-background",
              isCurrent && "ring-2 ring-green-500/60 ring-offset-2 ring-offset-background",
            )}
            onClick={() => !isCurrent && !isLoading && onSelectPlan(plan.id)}
          >
            {/* Badge popular */}
            {isPro && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--nuclear)] px-3 py-0.5 text-xs font-semibold text-white shadow">
                Más popular
              </span>
            )}

            {/* Badge plan actual */}
            {isCurrent && (
              <Badge
                variant="outline"
                className="absolute right-3 top-3 border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
              >
                Plan actual
              </Badge>
            )}

            {/* Header */}
            <div className="mb-4">
              <div className={cn("mb-3 inline-flex rounded-xl p-2.5", badgeClass)}>
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.description && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>

            {/* Precio */}
            <div className="mb-4">
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(plan.priceCents, plan.currency)}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">
                /{plan.billingInterval === "MONTHLY" ? "mes" : "año"}
              </span>
            </div>

            {/* Límites */}
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              {plan.maxUsers !== null && (
                <div className="rounded-lg bg-background/50 p-2 text-center">
                  <p className="font-semibold">{plan.maxUsers}</p>
                  <p className="text-xs text-muted-foreground">usuarios</p>
                </div>
              )}
              {plan.maxProducts !== null && (
                <div className="rounded-lg bg-background/50 p-2 text-center">
                  <p className="font-semibold">{plan.maxProducts.toLocaleString("es-CO")}</p>
                  <p className="text-xs text-muted-foreground">productos</p>
                </div>
              )}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <ul className="mb-5 space-y-1.5 text-sm">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <div className="mt-auto">
              {isCurrent ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Check className="mr-1.5 size-3.5" />
                  Suscrito
                </Button>
              ) : (
                <Button
                  variant={isSelected ? "nuclear" : "outline"}
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isSelected ? "Plan seleccionado ✓" : "Seleccionar plan"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
