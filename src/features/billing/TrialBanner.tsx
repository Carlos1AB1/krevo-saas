import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CreditCard, AlertTriangle } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { differenceInHours, parseISO } from "date-fns";

export function TrialBanner() {
  const { user } = useAuth();

  if (!user) return null;

  const trialDaysLeft = user.trialEndsAt 
    ? Math.max(0, Math.ceil(differenceInHours(parseISO(user.trialEndsAt), new Date()) / 24))
    : null;

  if (user.subscriptionStatus === "TRIALING" && trialDaysLeft !== null) {
    if (trialDaysLeft >= 0) {
      return (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-warning-foreground">
          <AlertCircle className="size-4 mr-2 text-warning" />
          Estás en periodo de prueba. Te quedan {trialDaysLeft} días de tu prueba gratuita.
          <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold text-warning">
            Mejorar plan <ArrowRight className="size-3 ml-1" />
          </Link>
        </div>
      );
    } else {
      return (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-destructive">
          <AlertCircle className="size-4 mr-2" />
          Tu periodo de prueba ha terminado. Activa un plan para seguir utilizando la plataforma.
          <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold">
            Ver planes <ArrowRight className="size-3 ml-1" />
          </Link>
        </div>
      );
    }
  }

  if (user.subscriptionStatus === "PAST_DUE") {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-destructive">
        <AlertTriangle className="size-4 mr-2" />
        Tu último pago falló. Actualiza tu método de pago para recuperar el acceso completo.
        <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold">
          Actualizar pago <ArrowRight className="size-3 ml-1" />
        </Link>
      </div>
    );
  }

  if (user.subscriptionStatus === "CANCELED") {
    return (
      <div className="bg-orange-500/10 border-b border-orange-500/30 px-4 py-2 flex items-center justify-center text-xs font-medium text-orange-700 dark:text-orange-400">
        <CreditCard className="size-4 mr-2" />
        Tu suscripción está cancelada. Puedes reactivar tu plan en cualquier momento.
        <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold">
          Reactivar <ArrowRight className="size-3 ml-1" />
        </Link>
      </div>
    );
  }

  return null;
}
