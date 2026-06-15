import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { saveTokens } from "@/features/auth/auth.storage";

const successSearchSchema = z.object({
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const Route = createFileRoute("/auth/google/success")({
  head: () => ({ meta: [{ title: "Iniciando sesión — Krevo" }] }),
  validateSearch: successSearchSchema,
  component: GoogleSuccessPage,
});

function GoogleSuccessPage() {
  const navigate = useNavigate();
  const { reloadSession } = useAuth();
  const search = Route.useSearch();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const { access_token, refresh_token } = search;

    if (!access_token || !refresh_token) {
      setFailed(true);
      return;
    }

    saveTokens(access_token, refresh_token);
    reloadSession().then(() => {
      toast.success("Sesión iniciada con Google");
      navigate({ to: "/app", replace: true });
    }).catch(() => {
      setFailed(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthShell side="reactor">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 py-12 text-center"
      >
        {failed ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No se pudo iniciar sesión</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Los tokens de acceso no son válidos o han expirado.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Iniciando sesión con Google…</p>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}
