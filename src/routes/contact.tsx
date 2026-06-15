import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactRequest } from "@/features/contact/contact.api";
import { contactFormSchema, type ContactFormValues } from "@/features/contact/contact.schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacto — Krevo" },
      {
        name: "description",
        content:
          "Solicita una demo personalizada de Krevo. Te respondemos en menos de 24 horas hábiles.",
      },
      { property: "og:title", content: "Contacto — Krevo" },
      { property: "og:description", content: "Solicita tu demo de Krevo." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      message: "",
      source: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (!turnstileToken) return;

    try {
      await submitContactRequest({
        fullName: data.fullName,
        email: data.email,
        companyName: data.companyName || undefined,
        message: data.message,
        source: data.source || undefined,
        turnstileToken,
      });
      turnstileRef.current?.reset();
      setSubmitted(true);
      reset();
      toast.success("Solicitud enviada correctamente. Te contactaremos pronto.");
    } catch {
      turnstileRef.current?.reset();
      toast.error("No pudimos enviar tu solicitud. Verifica tu conexión e intenta de nuevo.");
    }
  };

  return (
    <div className="bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-5xl px-6 py-20">
          <SectionHeading
            eyebrow="Hablemos"
            title={
              <>
                Cuéntanos sobre tu <span className="text-gradient-nuclear">CEDI</span>.
              </>
            }
            description="Te respondemos en menos de 24 horas hábiles, en español y sin formularios eternos."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            {/* Side info */}
            <div className="space-y-4">
              {[
                { icon: Mail, title: "Email", value: "hola@nuclearwms.co" },
                { icon: Phone, title: "Teléfono", value: "+57 (1) 555-0142" },
                { icon: MessageSquare, title: "WhatsApp", value: "+57 300 555 0142" },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-nuclear/10 text-nuclear">
                    <c.icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold">{c.title}</p>
                    <p className="font-mono text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form / Success */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
                <div className="grid size-16 place-items-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-8 text-success" />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">Solicitud enviada</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Recibimos tu mensaje correctamente. Nuestro equipo se pondrá en contacto contigo
                  en menos de 24 horas hábiles.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                  Enviar otra solicitud
                </Button>
              </div>
            ) : (
              <form
                className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      placeholder="María Restrepo"
                      {...register("fullName")}
                      aria-invalid={!!errors.fullName}
                      className={cn(errors.fullName && "border-destructive")}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo corporativo</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="maria@empresa.co"
                        {...register("email")}
                        aria-invalid={!!errors.email}
                        className={cn(errors.email && "border-destructive")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Empresa</Label>
                      <Input
                        id="companyName"
                        placeholder="Empresa S.A.S."
                        {...register("companyName")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="message">¿Qué necesitas resolver?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tenemos 3 bodegas y queremos consolidar el inventario en tiempo real…"
                      rows={5}
                      {...register("message")}
                      aria-invalid={!!errors.message}
                      className={cn(errors.message && "border-destructive")}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <TurnstileWidget
                    ref={turnstileRef}
                    action="contact"
                    onTokenChange={setTurnstileToken}
                  />

                  <Button
                    type="submit"
                    variant="nuclear"
                    size="lg"
                    disabled={isSubmitting || !turnstileToken}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Enviando…
                      </>
                    ) : (
                      "Enviar solicitud"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Al enviar aceptas nuestros{" "}
                    <Link
                      to="/legal/terms"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      términos
                    </Link>{" "}
                    y{" "}
                    <Link
                      to="/legal/privacy"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      política de privacidad
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
