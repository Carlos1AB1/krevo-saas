import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { OrSeparator, SsoButtons } from "@/components/auth/sso-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/features/auth/AuthProvider";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Ingresa tu email").email("Formato de email inválido").max(255),
  password: z.string().min(1, "Ingresa tu contraseña").max(72),
  remember: z.boolean().optional(),
});

const loginSearchSchema = z.object({
  forbidden: z.string().optional(),
  redirect: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Krevo" },
      {
        name: "description",
        content:
          "Accede a tu Centro de Distribución. Inventario en tiempo real, FEFO/FIFO y trazabilidad por lote.",
      },
    ],
  }),
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, isLoading, error, clearError } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const search = Route.useSearch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "superadmin@cedi.local",
      password: "Admin1234!",
      remember: true,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null);

    const success = await loginUser(values.email, values.password);

    if (success) {
      toast.success("Sesión iniciada", {
        description: `Bienvenido de vuelta, ${values.email.split("@")[0]}.`,
      });
      navigate({
        to: search.redirect && search.redirect.startsWith("/") ? search.redirect : "/app",
      });
    }
  };

  const isAuthenticating = isSubmitting || isLoading;

  return (
    <AuthShell side="reactor">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bienvenido de vuelta. Ingresa para ver tus KPIs en vivo.
        </p>

        <div className="mt-8">
          {(search.forbidden === "1" || authError) && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {authError ?? "Tu cuenta no tiene permisos para entrar al módulo SuperAdmin."}
            </div>
          )}

          <SsoButtons mode="login" />
          <OrSeparator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email corporativo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                aria-invalid={!!errors.email}
                {...register("email", { onChange: () => error && clearError() })}
              />
              {errors.email ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[var(--nuclear)] hover:underline"
                >
                  ¿La olvidaste?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register("password", { onChange: () => error && clearError() })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {error ? (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            ) : null}

            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked />
              <span>Mantener mi sesión iniciada en este equipo</span>
            </label>

            <Button
              type="submit"
              variant="nuclear"
              size="lg"
              className="w-full"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Iniciando…
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Iniciar sesión
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Aún sin cuenta?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Crea tu organización
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
}
