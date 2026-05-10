import { Crown, HardHat, Shield, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";

const roles: {
  icon: LucideIcon;
  role: string;
  title: string;
  beneficios: string[];
  tone: string;
}[] = [
  {
    icon: Crown,
    role: "SuperAdmin",
    title: "Dueño del SaaS",
    beneficios: ["Gestiona tenants y planes", "Métricas globales", "Webhooks de facturación"],
    tone: "from-nuclear to-reactor",
  },
  {
    icon: Shield,
    role: "Administrador",
    title: "Gerencia del cliente",
    beneficios: ["Configura bodegas y usuarios", "BI ejecutivo", "Suscripción y facturación"],
    tone: "from-reactor to-plasma",
  },
  {
    icon: UserCog,
    role: "Supervisor",
    title: "Jefe de operación",
    beneficios: ["Aprueba traslados", "Revisa kárdex", "Audita movimientos"],
    tone: "from-plasma to-nuclear",
  },
  {
    icon: HardHat,
    role: "Operario",
    title: "Manos en bodega",
    beneficios: ["PWA mobile-first", "Escáner por cámara", "Picking offline"],
    tone: "from-nuclear to-plasma",
  },
];

export function RolesSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Roles"
          title={
            <>
              Una plataforma. <span className="text-gradient-nuclear">Cuatro perfiles</span>.
            </>
          }
          description="Cada usuario ve exactamente lo que necesita. Sin más. Sin menos."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <article
              key={r.role}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r ${r.tone}`}
              />
              <span className="grid size-11 place-items-center rounded-lg border border-border bg-background">
                <r.icon className="size-5 text-nuclear" strokeWidth={1.5} />
              </span>
              <p className="font-mono mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {r.role}
              </p>
              <h3 className="font-display mt-1 text-lg font-semibold">{r.title}</h3>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {r.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-nuclear" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
