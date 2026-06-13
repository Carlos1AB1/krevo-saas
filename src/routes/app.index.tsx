import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app/app-topbar";
import { DashboardContent } from "@/components/app/dashboard-content";
import { useAuth } from "@/features/auth/AuthProvider";
import { differenceInHours, parseISO } from "date-fns";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Dashboard · Krevo" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  const trialDaysLeft = user?.trialEndsAt 
    ? Math.max(0, Math.ceil(differenceInHours(parseISO(user.trialEndsAt), new Date()) / 24))
    : null;

  return (
    <>
      <AppTopbar breadcrumb={[{ label: "Dashboard" }]} />
      <main className="flex-1 flex flex-col">
        {user?.subscriptionStatus === "TRIALING" && trialDaysLeft !== null && trialDaysLeft <= 14 && trialDaysLeft >= 0 && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-warning-foreground">
            <AlertCircle className="size-4 mr-2 text-warning" />
            Estás en periodo de prueba. Te quedan {trialDaysLeft} días de tu prueba gratuita.
            <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold text-warning">
              Mejorar plan <ArrowRight className="size-3 ml-1" />
            </Link>
          </div>
        )}
        {user?.subscriptionStatus === "TRIALING" && trialDaysLeft !== null && trialDaysLeft < 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center text-xs font-medium text-destructive">
            <AlertCircle className="size-4 mr-2" />
            Tu periodo de prueba ha terminado. Activa un plan para seguir utilizando la plataforma.
            <Link to="/app/billing" className="ml-2 flex items-center hover:underline font-bold">
              Ver planes <ArrowRight className="size-3 ml-1" />
            </Link>
          </div>
        )}
        <DashboardContent />
      </main>
    </>
  );
}
