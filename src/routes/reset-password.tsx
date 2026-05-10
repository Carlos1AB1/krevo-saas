import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72)
      .refine((v) => /[A-Z]/.test(v) && /[a-z]/.test(v), "Combina mayúsculas y minúsculas")
      .refine((v) => /\d/.test(v), "Incluye al menos un número"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });
type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reiniciar contraseña — Krevo" },
      {
        name: "description",
        content: "Crea una contraseña nueva y vuelve a tu Centro de Distribución.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (_v: Values) => {
    await new Promise((r) => setTimeout(r, 1000));
    setDone(true);
    toast.success("Contraseña actualizada");
    setTimeout(() => navigate({ to: "/login" }), 1400);
  };

  return (
    <AuthShell side="nuclear">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {done ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl text-white shadow-elevated"
              style={{ background: "var(--gradient-nuclear)" }}
            >
              <CheckCircle2 className="size-6" />
            </motion.div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Contraseña actualizada
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Te llevamos al login para que entres con tus nuevas credenciales.
            </p>
            <Button asChild variant="nuclear" size="lg" className="mt-6">
              <Link to="/login">Ir al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Crea tu nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Por seguridad, usa una contraseña única que no uses en otros sistemas.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                ) : null}
                <PasswordStrength value={password ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  aria-invalid={!!errors.confirm}
                  {...register("confirm")}
                />
                {errors.confirm ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.confirm.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="nuclear"
                size="lg"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" /> Actualizar contraseña
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}
