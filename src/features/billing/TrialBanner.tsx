/**
 * TrialBanner — Banner persistente que muestra el estado de la suscripción.
 *
 * Casos:
 *   TRIALING  → Banner amarillo con días restantes y botón "Actualizar plan"
 *   PAST_DUE  → Banner rojo con mensaje de pago fallido
 *   EXPIRED   → Banner rojo con mensaje de suscripción expirada
 *   ACTIVE    → No muestra nada (null)
 *   CANCELED  → Banner naranja
 */

import { Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, X, ArrowRight, CreditCard } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getSubscription } from "./billing.api";

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: getSubscription,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: false,
  });

  // No mostrar si no hay datos, está activo, o fue descartado
  if (!subscription || dismissed) return null;
  const { status, trialDaysLeft } = subscription;
  if (status === "ACTIVE") return null;

  // ─── Configuración por estado ───────────────────────────────────────────────
  const config = {
    TRIALING: {
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: Clock,
      message:
        trialDaysLeft !== null && trialDaysLeft > 0
          ? `Tu período de prueba vence en ${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""}. Activa tu plan para mantener el acceso completo.`
          : "Tu período de prueba ha vencido. Activa tu plan para continuar.",
      cta: "Activar plan",
      dismissable: true,
    },
    PAST_DUE: {
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-700 dark:text-red-400",
      icon: AlertTriangle,
      message:
        "Tu último pago falló. Actualiza tu método de pago para recuperar el acceso completo.",
      cta: "Actualizar pago",
      dismissable: false,
    },
    EXPIRED: {
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-700 dark:text-red-400",
      icon: AlertTriangle,
      message:
        "Tu suscripción ha expirado. Renueva tu plan para continuar usando Krevo.",
      cta: "Renovar plan",
      dismissable: false,
    },
    CANCELED: {
      bg: "bg-orange-500/10 border-orange-500/30",
      text: "text-orange-700 dark:text-orange-400",
      icon: CreditCard,
      message:
        "Tu suscripción está cancelada. Puedes reactivar tu plan en cualquier momento.",
      cta: "Reactivar",
      dismissable: true,
    },
    ACTIVE: null,
  } as const;

  const cfg = config[status as keyof typeof config];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2.5 text-sm",
        cfg.bg,
        cfg.text
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="size-4 shrink-0" aria-hidden />

      <p className="flex-1 leading-snug">{cfg.message}</p>

      <Link
        to="/app/billing"
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md border border-current/30 bg-current/5 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-current/10",
          cfg.text
        )}
      >
        {cfg.cta}
        <ArrowRight className="size-3" />
      </Link>

      {cfg.dismissable && (
        <button
          type="button"
          aria-label="Cerrar aviso"
          onClick={() => setDismissed(true)}
          className={cn(
            "ml-1 shrink-0 rounded-md p-1 transition-colors hover:bg-current/10",
            cfg.text
          )}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
