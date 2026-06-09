import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { OrSeparator, SsoButtons } from "@/components/auth/sso-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

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
      email: "demo@krevo.com",
      password: "password123",
      remember: true,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null);

    try {
      const user = await login({
        email: values.email,
        password: values.password,
      });

      if (!user.isPlatformAdmin) {
        setAuthError("Tu cuenta no tiene acceso a la consola SuperAdmin.");
        return;
      }

      toast.success("Sesión iniciada", {
        description: `Bienvenido de vuelta, ${user.name}.`,
      });

      navigate({
        to: search.redirect && search.redirect.startsWith("/") ? search.redirect : "/admin",
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "No fue posible iniciar sesión con el backend.";

      setAuthError(message);
      toast.error("Error al iniciar sesión", {
        description: message,
      });
    }
  };

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
                {...register("email")}
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
                  {...register("password")}
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

            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked />
              <span>Mantener mi sesión iniciada en este equipo</span>
            </label>

            <Button
              type="submit"
              variant="nuclear"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
