import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

const errorSearchSchema = z.object({
  reason: z.string().optional(),
});

export const Route = createFileRoute("/auth/google/error")({
  head: () => ({ meta: [{ title: "Error de autenticación — Krevo" }] }),
  validateSearch: errorSearchSchema,
  component: GoogleErrorPage,
});

const REASON_MAP: Record<string, string> = {
  local_account:
    "Ya tienes una cuenta creada con email y contraseña. Inicia sesión con tus credenciales.",
  email_conflict: "Este correo ya está asociado a otra cuenta.",
  account_inactive: "Tu cuenta está desactivada. Contacta al administrador de tu organización.",
  oauth_failed: "No fue posible completar la autenticación con Google. Inténtalo de nuevo.",
};

function GoogleErrorPage() {
  const search = Route.useSearch();
  const message =
    (search.reason && REASON_MAP[search.reason]) ??
    "Ocurrió un error al autenticar con Google. Por favor intenta de nuevo.";

  return (
    <AuthShell side="reactor">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 py-12 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Error al autenticar con Google</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="nuclear"
            onClick={() => {
              window.location.href = `${API_BASE_URL}/auth/google`;
            }}
          >
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Iniciar sesión con email</Link>
          </Button>
        </div>
      </motion.div>
    </AuthShell>
  );
}
