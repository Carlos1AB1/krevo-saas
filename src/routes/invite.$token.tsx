import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Building2, Eye, EyeOff, Loader2, UserCheck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvitationByToken, acceptInvitation } from "@/features/users/users.api";

const acceptSchema = z
  .object({
    firstName: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
    lastName: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72)
      .refine((v) => /[A-Z]/.test(v), "Debe incluir al menos una mayúscula")
      .refine((v) => /[a-z]/.test(v), "Debe incluir al menos una minúscula")
      .refine((v) => /\d/.test(v), "Debe incluir al menos un número")
      .refine((v) => /[^A-Za-z\d]/.test(v), "Debe incluir al menos un símbolo"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

type AcceptValues = z.infer<typeof acceptSchema>;

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [{ title: "Aceptar invitación — Krevo" }],
  }),
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const invitationQuery = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationByToken(token),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptValues>({
    resolver: zodResolver(acceptSchema),
    mode: "onBlur",
  });

  const acceptMutation = useMutation({
    mutationFn: (values: AcceptValues) =>
      acceptInvitation(token, {
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      }),
    onSuccess: () => {
      toast.success("¡Cuenta creada!", {
        description: "Ya puedes iniciar sesión con tu correo y contraseña.",
      });
      navigate({ to: "/login" });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const invitation = invitationQuery.data;
  const isExpired = invitation && (invitation.status !== "PENDING" || new Date(invitation.expiresAt) <= new Date());
  const isAlreadyAccepted = invitation?.status === "ACCEPTED";

  return (
    <AuthShell side="reactor">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          to="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Ir al inicio de sesión
        </Link>

        {invitationQuery.isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verificando invitación…</p>
          </div>
        )}

        {invitationQuery.isError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-center">
            <AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
            <p className="font-medium text-foreground">Invitación no válida</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Este enlace de invitación no existe o ya no es válido.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/login">Ir al inicio de sesión</Link>
            </Button>
          </div>
        )}

        {invitation && isAlreadyAccepted && (
          <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-6 text-center">
            <UserCheck className="mx-auto mb-2 size-8 text-success" />
            <p className="font-medium text-foreground">Invitación ya aceptada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta invitación ya fue usada. Inicia sesión con tu cuenta.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </div>
        )}

        {invitation && !isAlreadyAccepted && isExpired && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-center">
            <AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
            <p className="font-medium text-foreground">Invitación expirada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Este enlace ya no es válido. Pide al administrador que te envíe una nueva invitación.
            </p>
          </div>
        )}

        {invitation && !isExpired && !isAlreadyAccepted && (
          <>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              <span>Invitación a <strong className="text-foreground">{invitation.email}</strong></span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Completa tus datos para activar tu acceso. La invitación expira el{" "}
              <strong className="text-foreground">
                {new Date(invitation.expiresAt).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={handleSubmit((values) => acceptMutation.mutate(values))}
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    aria-invalid={!!errors.firstName}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    aria-invalid={!!errors.lastName}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Mín. 8 chars, mayús., número y símbolo"
                    className="pr-10"
                    aria-invalid={!!errors.password}
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
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    className="pr-10"
                    aria-invalid={!!errors.confirm}
                    {...register("confirm")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-xs text-destructive">{errors.confirm.message}</p>
                )}
              </div>

              {acceptMutation.isError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{acceptMutation.error.message}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="nuclear"
                size="lg"
                className="w-full"
                disabled={isSubmitting || acceptMutation.isPending}
              >
                {isSubmitting || acceptMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creando cuenta…
                  </>
                ) : (
                  <>
                    <UserCheck className="size-4" /> Activar mi cuenta
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
