import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Lock, Save, Settings, Shield } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/configuracion")({
  head: () => ({
    meta: [{ title: "Configuración · SuperAdmin Krevo" }],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <>
      <AdminTopbar
        title="Configuración"
        description="Parámetros globales del SaaS para cobros, seguridad y notificaciones."
        action={
          <Button size="sm">
            <Save className="size-4" />
            Guardar
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="space-y-1">
            {[
              { icon: Settings, label: "General" },
              { icon: CreditCard, label: "Cobros" },
              { icon: Shield, label: "Seguridad" },
              { icon: Bell, label: "Notificaciones" },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={
                    index === 0
                      ? "flex w-full items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                      : "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </aside>

          <section className="space-y-6">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Política de trial</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Días de prueba" id="trial-days" value="14" />
                <Field label="Usuarios máximos en trial" id="trial-users" value="3" />
                <Field label="Bodegas máximas en trial" id="trial-warehouses" value="1" />
                <Field label="Transacciones trial" id="trial-transactions" value="10000" />
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Reglas globales de seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingToggle
                  icon={Lock}
                  title="Forzar MFA para usuarios SuperAdmin"
                  description="Recomendado antes de habilitar acciones destructivas sobre empresas."
                  checked
                />
                <SettingToggle
                  icon={Shield}
                  title="Auditar cambios de plan y límites"
                  description="Registra antes/después en la auditoría global."
                  checked
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}

function Field({ label, id, value }: { label: string; id: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={value} />
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  checked,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  checked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/25 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-background text-nuclear">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch defaultChecked={checked} />
    </div>
  );
}
