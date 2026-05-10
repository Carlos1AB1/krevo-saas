import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MailCheck, Send } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
});
type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — Nuclear WMS" },
      {
        name: "description",
        content: "Te enviamos un enlace seguro para reiniciar tu contraseña en Nuclear WMS.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async (v: Values) => {
    await new Promise((r) => setTimeout(r, 900));
    setSent(v.email);
  };

  return (
    <AuthShell side="nuclear">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {sent ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-elevated"
              style={{ background: "var(--gradient-reactor)" }}
            >
              <MailCheck className="size-6 text-white" />
            </motion.div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Revisa tu bandeja
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enviamos un enlace seguro a{" "}
              <span className="font-medium text-foreground">{sent}</span>. El enlace expira en 30
              minutos.
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <Button asChild variant="nuclear" size="lg">
                <Link to="/login">Volver a iniciar sesión</Link>
              </Button>
              <Button variant="ghost" onClick={() => setSent(null)}>
                Reenviar a otro email
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No te preocupes. Ingresa tu email y te enviaremos un enlace para crear una nueva.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
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
              <Button
                type="submit"
                variant="nuclear"
                size="lg"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Enviando enlace…
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Enviar enlace de recuperación
                  </>
                )}
              </Button>
            </form>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Volver a iniciar sesión
            </Link>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}
