import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Lock, Save, Settings, Shield, Sparkles, Workflow } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/configuracion")({
  head: () => ({
    meta: [{ title: "Configuración · SuperAdmin Krevo" }],
  }),
  component: AdminSettingsPage,
});

type ConfigSection = "billing" | "general" | "notifications" | "operations" | "security";

type SettingState = {
  auditPlanChanges: boolean;
  autoSuspendAfterDays: string;
  blockCrossTenantSignals: boolean;
  collectBeforeSuspend: boolean;
  dunningSequence: string;
  failedLoginWindow: string;
  invoiceDueDays: string;
  maxTrialTransactions: string;
  maxTrialUsers: string;
  maxTrialWarehouses: string;
  nextFailureEscalation: boolean;
  notifyFinanceOnFailure: boolean;
  notifyOpsOnPending: boolean;
  notifyOwnersBeforeRenewal: boolean;
  paymentToleranceDays: string;
  requireSuperAdminMfa: boolean;
  trialDays: string;
  trialMode: string;
  webhookRetries: string;
};

const sectionItems: Array<{
  description: string;
  icon: typeof Settings;
  id: ConfigSection;
  label: string;
}> = [
  {
    id: "general",
    icon: Settings,
    label: "General",
    description: "Parámetros globales del producto y trial.",
  },
  {
    id: "billing",
    icon: CreditCard,
    label: "Cobros",
    description: "Dunning, vencimientos y suspensión.",
  },
  {
    id: "security",
    icon: Shield,
    label: "Seguridad",
    description: "Controles de acceso y auditoría.",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notificaciones",
    description: "Escalamiento y avisos operativos.",
  },
  {
    id: "operations",
    icon: Workflow,
    label: "Operación",
    description: "Automatismos y postura del SaaS.",
  },
];

const initialState: SettingState = {
  auditPlanChanges: true,
  autoSuspendAfterDays: "10",
  blockCrossTenantSignals: true,
  collectBeforeSuspend: true,
  dunningSequence: "3_intentos",
  failedLoginWindow: "5",
  invoiceDueDays: "5",
  maxTrialTransactions: "10000",
  maxTrialUsers: "3",
  maxTrialWarehouses: "1",
  nextFailureEscalation: true,
  notifyFinanceOnFailure: true,
  notifyOpsOnPending: true,
  notifyOwnersBeforeRenewal: true,
  paymentToleranceDays: "3",
  requireSuperAdminMfa: true,
  trialDays: "14",
  trialMode: "self_serve",
  webhookRetries: "6",
};

function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<ConfigSection>("general");
  const [settings, setSettings] = useState(initialState);

  return (
    <>
      <AdminTopbar
        title="Configuración"
        description="Centro de control del SaaS: trials, cobro, seguridad y automatismos globales."
        action={
          <Button size="sm">
            <Save className="size-4" />
            Guardar cambios
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ConfigStat
              label="Trial estándar"
              value={`${settings.trialDays} días`}
              helper={`${settings.maxTrialUsers} usuarios / ${settings.maxTrialWarehouses} bodega`}
              tone="primary"
            />
            <ConfigStat
              label="Suspensión automática"
              value={`${settings.autoSuspendAfterDays} días`}
              helper="Tiempo máximo sin regularizar cobro"
              tone="warning"
            />
            <ConfigStat
              label="MFA SuperAdmin"
              value={settings.requireSuperAdminMfa ? "Activo" : "Desactivado"}
              helper="Protección sobre cuentas críticas"
              tone="success"
            />
            <ConfigStat
              label="Webhooks reintento"
              value={settings.webhookRetries}
              helper="Número de reintentos por evento"
              tone="neutral"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-2">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeSection;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full rounded-xl border border-transparent px-4 py-3 text-left transition-colors",
                      active
                        ? "border-border bg-card shadow-[var(--shadow-soft)]"
                        : "hover:border-border/70 hover:bg-card/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-nuclear text-nuclear-foreground"
                            : "bg-muted/60 text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            active ? "text-foreground" : "text-foreground/85",
                          )}
                        >
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="space-y-6">
              {activeSection === "general" && (
                <>
                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Política global de trial</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field label="Días de prueba" id="trial-days">
                        <Input
                          id="trial-days"
                          value={settings.trialDays}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              trialDays: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Modo de trial" id="trial-mode">
                        <Select
                          value={settings.trialMode}
                          onValueChange={(value) =>
                            setSettings((current) => ({ ...current, trialMode: value }))
                          }
                        >
                          <SelectTrigger id="trial-mode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self_serve">Self-serve</SelectItem>
                            <SelectItem value="asistido">Asistido</SelectItem>
                            <SelectItem value="solo_ventas">Solo ventas</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Usuarios máximos" id="trial-users">
                        <Input
                          id="trial-users"
                          value={settings.maxTrialUsers}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              maxTrialUsers: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Bodegas máximas" id="trial-warehouses">
                        <Input
                          id="trial-warehouses"
                          value={settings.maxTrialWarehouses}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              maxTrialWarehouses: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Transacciones trial" id="trial-transactions">
                        <Input
                          id="trial-transactions"
                          value={settings.maxTrialTransactions}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              maxTrialTransactions: event.target.value,
                            }))
                          }
                        />
                      </Field>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Postura del catálogo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <SettingToggle
                        icon={Sparkles}
                        title="Cobrar antes de habilitar suspensión"
                        description="Reduce falsos positivos cuando hay demoras de pasarela o conciliación."
                        checked={settings.collectBeforeSuspend}
                        onCheckedChange={(checked) =>
                          setSettings((current) => ({ ...current, collectBeforeSuspend: checked }))
                        }
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "billing" && (
                <>
                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Reglas de cobro y vencimiento</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field label="Días de vencimiento de factura" id="invoice-due-days">
                        <Input
                          id="invoice-due-days"
                          value={settings.invoiceDueDays}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              invoiceDueDays: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Tolerancia antes de marcar mora" id="payment-tolerance-days">
                        <Input
                          id="payment-tolerance-days"
                          value={settings.paymentToleranceDays}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              paymentToleranceDays: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Suspensión automática después de" id="auto-suspend-days">
                        <Input
                          id="auto-suspend-days"
                          value={settings.autoSuspendAfterDays}
                          onChange={(event) =>
                            setSettings((current) => ({
                              ...current,
                              autoSuspendAfterDays: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Secuencia de cobro" id="dunning-sequence">
                        <Select
                          value={settings.dunningSequence}
                          onValueChange={(value) =>
                            setSettings((current) => ({ ...current, dunningSequence: value }))
                          }
                        >
                          <SelectTrigger id="dunning-sequence">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2_intentos">2 intentos</SelectItem>
                            <SelectItem value="3_intentos">3 intentos</SelectItem>
                            <SelectItem value="4_intentos">4 intentos</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </CardContent>
                  </Card>

                  <Card className="shadow-[var(--shadow-soft)]">
                    <CardHeader>
                      <CardTitle>Política operativa de cobros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <SettingToggle
                        icon={CreditCard}
                        title="Escalar al siguiente fallo de pago"
                        description="Notifica a operación y finanzas para revisar antes de afectar acceso."
                        checked={settings.nextFailureEscalation}
                        onCheckedChange={(checked) =>
                          setSettings((current) => ({ ...current, nextFailureEscalation: checked }))
                        }
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "security" && (
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle>Seguridad y trazabilidad global</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      icon={Lock}
                      title="Forzar MFA para usuarios SuperAdmin"
                      description="Recomendado antes de habilitar acciones críticas entre empresas."
                      checked={settings.requireSuperAdminMfa}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, requireSuperAdminMfa: checked }))
                      }
                    />
                    <SettingToggle
                      icon={Shield}
                      title="Auditar cambios de planes y límites"
                      description="Registra antes y después de cada cambio global del catálogo."
                      checked={settings.auditPlanChanges}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, auditPlanChanges: checked }))
                      }
                    />
                    <SettingToggle
                      icon={Shield}
                      title="Bloquear señales cross-tenant"
                      description="Aísla eventos y alertas sospechosas entre tenants."
                      checked={settings.blockCrossTenantSignals}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, blockCrossTenantSignals: checked }))
                      }
                    />

                    <Field
                      label="Ventana de fallos de login antes de alerta"
                      id="failed-login-window"
                    >
                      <Input
                        id="failed-login-window"
                        value={settings.failedLoginWindow}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            failedLoginWindow: event.target.value,
                          }))
                        }
                      />
                    </Field>
                  </CardContent>
                </Card>
              )}

              {activeSection === "notifications" && (
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle>Escalamiento y notificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingToggle
                      icon={Bell}
                      title="Avisar a finanzas en pagos fallidos"
                      description="Abre seguimiento financiero antes de suspensión."
                      checked={settings.notifyFinanceOnFailure}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, notifyFinanceOnFailure: checked }))
                      }
                    />
                    <SettingToggle
                      icon={Bell}
                      title="Avisar a operación en pendientes"
                      description="Permite revisar conciliaciones o webhooks retrasados."
                      checked={settings.notifyOpsOnPending}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, notifyOpsOnPending: checked }))
                      }
                    />
                    <SettingToggle
                      icon={Bell}
                      title="Avisar a owners antes de renovación"
                      description="Mantiene comunicación preventiva con clientes activos."
                      checked={settings.notifyOwnersBeforeRenewal}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({
                          ...current,
                          notifyOwnersBeforeRenewal: checked,
                        }))
                      }
                    />
                  </CardContent>
                </Card>
              )}

              {activeSection === "operations" && (
                <Card className="shadow-[var(--shadow-soft)]">
                  <CardHeader>
                    <CardTitle>Automatismos operativos del SaaS</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field label="Reintentos de webhook" id="webhook-retries">
                      <Input
                        id="webhook-retries"
                        value={settings.webhookRetries}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            webhookRetries: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Qué debe resolver esta vista</p>
                      <ul className="mt-2 space-y-2">
                        <li>Gobernar reglas globales del SaaS.</li>
                        <li>Reducir decisiones manuales repetitivas.</li>
                        <li>Evitar que la operación dependa de memoria del equipo.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function ConfigStat({
  helper,
  label,
  tone,
  value,
}: {
  helper: string;
  label: string;
  tone: "neutral" | "primary" | "success" | "warning";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-3 font-display text-3xl font-semibold tracking-tight text-foreground",
          tone === "primary" && "text-nuclear",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function Field({ children, id, label }: { children: React.ReactNode; id: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function SettingToggle({
  checked,
  description,
  icon: Icon,
  onCheckedChange,
  title,
}: {
  checked: boolean;
  description: string;
  icon: typeof Shield;
  onCheckedChange: (checked: boolean) => void;
  title: string;
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
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
