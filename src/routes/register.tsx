import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Rocket } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { OrSeparator, SsoButtons } from "@/components/auth/sso-buttons";
import { PasswordStrength, scorePassword } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres").max(80),
    email: z.string().trim().email("Formato de email inválido").max(255),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72, "Máximo 72 caracteres")
      .refine((v) => /[A-Z]/.test(v) && /[a-z]/.test(v), "Combina mayúsculas y minúsculas")
      .refine((v) => /\d/.test(v), "Incluye al menos un número"),
    confirm: z.string(),
    org: z.string().trim().min(2, "Nombre de la organización").max(80),
    size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"], {
      message: "Selecciona el tamaño de tu equipo",
    }),
    role: z.enum(["owner", "ops", "warehouse", "finance", "other"], {
      message: "Selecciona tu rol",
    }),
    accept: z.boolean().refine((v) => v === true, "Debes aceptar los términos"),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

type RegisterValues = z.infer<typeof registerSchema>;

const steps = [
  { key: "account", title: "Tu cuenta", subtitle: "Empezamos por ti." },
  { key: "org", title: "Tu organización", subtitle: "Cuéntanos del CEDI que vas a operar." },
  { key: "confirm", title: "Listo para encender", subtitle: "Revisa y crea tu workspace." },
] as const;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Krevo" },
      {
        name: "description",
        content:
          "Crea tu organización en Krevo en 3 pasos. Inventario inteligente para tu CEDI desde el día uno.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [showPw, setShowPw] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirm: "",
      org: "",
      size: undefined as unknown as RegisterValues["size"],
      role: undefined as unknown as RegisterValues["role"],
      accept: false,
    },
  });
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();

  const next = async () => {
    const ok =
      step === 0
        ? await trigger(["fullName", "email", "password", "confirm"], { shouldFocus: true })
        : await trigger(["org", "size", "role"], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(2, s + 1) as 0 | 1 | 2);
  };

  const onSubmit = async (data: RegisterValues) => {
    await new Promise((r) => setTimeout(r, 1100));
    toast.success("¡Workspace creado!", {
      description: `Bienvenido a Nuclear, ${data.fullName.split(" ")[0]}.`,
    });
    navigate({ to: "/login" });
  };

  return (
    <AuthShell side="plasma">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>
        <Stepper step={step} />

        <div className="mt-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {steps[step].title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </div>

        {step === 0 ? (
          <div className="mt-7">
            <SsoButtons mode="register" />
            <OrSeparator>o regístrate con email</OrSeparator>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <Field id="fullName" label="Nombre completo" error={errors.fullName?.message}>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    placeholder="Camila Restrepo"
                    {...register("fullName")}
                  />
                </Field>
                <Field id="email" label="Email corporativo" error={errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    {...register("email")}
                  />
                </Field>
                <Field id="password" label="Contraseña" error={errors.password?.message}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label="Mostrar/ocultar contraseña"
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <PasswordStrength value={values.password ?? ""} />
                </Field>
                <Field id="confirm" label="Confirmar contraseña" error={errors.confirm?.message}>
                  <Input
                    id="confirm"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    {...register("confirm")}
                  />
                </Field>
              </motion.div>
            ) : null}

            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <Field id="org" label="Nombre de la organización" error={errors.org?.message}>
                  <Input id="org" placeholder="Ej. Distribuidora Andes SAS" {...register("org")} />
                </Field>
                <Field id="size" label="Tamaño del equipo" error={errors.size?.message}>
                  <Select
                    value={values.size}
                    onValueChange={(v) =>
                      setValue("size", v as RegisterValues["size"], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1 – 10 personas</SelectItem>
                      <SelectItem value="11-50">11 – 50 personas</SelectItem>
                      <SelectItem value="51-200">51 – 200 personas</SelectItem>
                      <SelectItem value="201-1000">201 – 1.000 personas</SelectItem>
                      <SelectItem value="1000+">Más de 1.000</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="role" label="Tu rol" error={errors.role?.message}>
                  <Select
                    value={values.role}
                    onValueChange={(v) =>
                      setValue("role", v as RegisterValues["role"], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="¿En qué rol vas a operar?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Founder / Dueño</SelectItem>
                      <SelectItem value="ops">Líder de Operaciones</SelectItem>
                      <SelectItem value="warehouse">Jefe de Bodega</SelectItem>
                      <SelectItem value="finance">Finanzas / Compras</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </motion.div>
            ) : null}

            {step === 2 ? (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <Summary values={values} />

                <label
                  htmlFor="accept"
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card/40 p-3 text-sm"
                >
                  <Controller
                    name="accept"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="accept"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <span className="text-muted-foreground">
                    Acepto los{" "}
                    <Link to="/legal/terms" className="font-medium text-foreground hover:underline">
                      Términos
                    </Link>{" "}
                    y la{" "}
                    <Link
                      to="/legal/privacy"
                      className="font-medium text-foreground hover:underline"
                    >
                      Política de privacidad
                    </Link>
                    .
                  </span>
                </label>
                {errors.accept ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.accept.message}
                  </p>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1) as 0 | 1 | 2)}
                className="gap-2"
              >
                <ArrowLeft className="size-4" /> Atrás
              </Button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <Button
                type="button"
                variant="nuclear"
                size="lg"
                className="gap-2"
                onClick={next}
                disabled={step === 0 && scorePassword(values.password ?? "").score < 3}
              >
                Siguiente <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="plasma"
                size="lg"
                className="gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Encendiendo reactor…
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" /> Crear mi workspace
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso de registro">
      {steps.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-transparent bg-[var(--nuclear)] text-white",
                current &&
                "border-[var(--nuclear)] bg-background text-[var(--nuclear)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--nuclear)_18%,transparent)]",
                !done && !current && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:block",
                current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.title}
            </span>
            {i < steps.length - 1 ? (
              <span className="ml-1 h-px flex-1 bg-border" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Summary({ values }: { values: Partial<z.infer<typeof registerSchema>> }) {
  const rows: Array<[string, string | undefined]> = [
    ["Nombre", values.fullName],
    ["Email", values.email],
    ["Organización", values.org],
    ["Tamaño", values.size],
    ["Rol", values.role],
  ];
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resumen
      </p>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 sm:block">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="truncate font-medium text-foreground">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
