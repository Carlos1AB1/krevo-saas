import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Crown,
  Plus,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCop, saasPlans, type SaaSPlan } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/planes")({
  head: () => ({
    meta: [{ title: "Planes · SuperAdmin Krevo" }],
  }),
  component: PlansPage,
});

type PlanStatus = "active" | "draft" | "legacy";

type PlanFormState = {
  enabledModules: string[];
  id: SaaSPlan["id"] | `custom_${string}`;
  limits: {
    transactions: string;
    users: string;
    warehouses: string;
  };
  name: string;
  notes: string;
  period: string;
  price: string;
  status: PlanStatus;
  tenantCount: number;
};

type AdminPlan = SaaSPlan & {
  notes: string;
  recommended: boolean;
  status: PlanStatus;
};

const availableModules = [
  "Kárdex",
  "FEFO/FIFO",
  "Recepciones",
  "Despachos",
  "ABC/Pareto",
  "ROP dinámico",
  "PWA operario",
  "SSO/SAML",
  "SLA dedicado",
  "Onboarding asistido",
];

const initialPlans: AdminPlan[] = saasPlans.map((plan) => ({
  ...plan,
  notes:
    plan.id === "basic"
      ? "Plan de entrada para operación liviana y onboarding rápido."
      : plan.id === "pro"
        ? "Plan comercial principal para crecimiento y operación multi-bodega."
        : "Oferta consultiva para cuentas con negociación y alcance extendido.",
  recommended: plan.id === "pro",
  status: plan.id === "enterprise" ? "draft" : "active",
}));

function PlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [editingPlanId, setEditingPlanId] = useState<AdminPlan["id"] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const editingPlan = plans.find((plan) => plan.id === editingPlanId) ?? null;
  const activePlans = plans.filter((plan) => plan.status === "active").length;
  const totalTenants = plans.reduce((sum, plan) => sum + plan.tenantCount, 0);
  const highestPrice = plans.reduce((max, plan) => Math.max(max, plan.price ?? 0), 0);

  return (
    <>
      <AdminTopbar
        title="Planes"
        description="Catálogo comercial, límites operativos y empaque funcional de cada suscripción."
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Nuevo plan
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <SummaryTile label="Planes activos" value={activePlans.toString()} icon={Rocket} />
            <SummaryTile
              label="Empresas asignadas"
              value={totalTenants.toString()}
              icon={UsersRound}
            />
            <SummaryTile
              label="Plan recomendado"
              value={plans.find((plan) => plan.recommended)?.name ?? "-"}
              icon={Sparkles}
            />
            <SummaryTile
              label="Ticket más alto"
              value={`$${formatCop(highestPrice)}`}
              icon={Crown}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <div className="grid gap-5 lg:grid-cols-2">
              {plans.map((plan) => {
                const statusTone = getStatusTone(plan.status);

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "border-border shadow-[var(--shadow-soft)]",
                      plan.recommended && "border-nuclear/35 bg-nuclear/5",
                    )}
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle>{plan.name}</CardTitle>
                            {plan.recommended && (
                              <span className="rounded-full bg-nuclear px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-nuclear-foreground">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={statusTone} />
                            <span className="text-xs text-muted-foreground">
                              {plan.tenantCount} empresas usando este plan
                            </span>
                          </div>
                        </div>
                        <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-nuclear">
                          <SlidersHorizontal className="size-4" />
                        </span>
                      </div>

                      <div className="rounded-xl border border-border bg-background/80 p-4">
                        <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
                          {plan.price ? `$${formatCop(plan.price)}` : "A medida"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">COP / {plan.period}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{plan.notes}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                        <Limit label="Usuarios" value={plan.limits.users} />
                        <Limit label="Bodegas" value={plan.limits.warehouses} />
                        <Limit label="Transacciones" value={plan.limits.transactions} />
                      </div>

                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Módulos incluidos
                        </p>
                        <ul className="grid gap-2 text-sm sm:grid-cols-2">
                          {plan.enabledModules.map((module) => (
                            <li
                              key={module}
                              className="flex items-start gap-2 rounded-md bg-muted/30 p-2"
                            >
                              <Check className="mt-0.5 size-4 shrink-0 text-success" />
                              <span>{module}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid gap-3 rounded-lg border border-border bg-background/80 p-4 text-sm sm:grid-cols-2">
                        <ImpactMetric
                          label="Impacto actual"
                          value={`${plan.tenantCount} empresas`}
                          helper="Cuentas que heredan este empaque base"
                        />
                        <ImpactMetric
                          label="Tipo comercial"
                          value={plan.price ? "Self-serve" : "Negociado"}
                          helper="Segmentación usada en ventas"
                        />
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setEditingPlanId(plan.id)}
                      >
                        Editar plan
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="h-fit shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Comparativo rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Plan</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Precio</th>
                        <th className="px-3 py-2 font-medium text-muted-foreground">Empresas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan) => (
                        <tr key={plan.id} className="border-t border-border">
                          <td className="px-3 py-3 font-medium text-foreground">{plan.name}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {plan.price ? `$${formatCop(plan.price)}` : "A medida"}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{plan.tenantCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Qué debería controlar esta vista
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Precio, periodo y visibilidad comercial del catálogo.</li>
                    <li>Límites operativos que afectan onboarding y expansión.</li>
                    <li>Impacto por cantidad de empresas antes de tocar un plan activo.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <PlanDialog
        mode="create"
        open={isCreateOpen}
        plan={null}
        onOpenChange={setIsCreateOpen}
        onSave={(nextPlan) => {
          setPlans((current) => [nextPlan, ...current]);
          setIsCreateOpen(false);
        }}
      />

      <PlanDialog
        mode="edit"
        open={Boolean(editingPlan)}
        plan={editingPlan}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPlanId(null);
          }
        }}
        onSave={(nextPlan) => {
          setPlans((current) => current.map((plan) => (plan.id === nextPlan.id ? nextPlan : plan)));
          setEditingPlanId(null);
        }}
      />
    </>
  );
}

function PlanDialog({
  mode,
  onOpenChange,
  onSave,
  open,
  plan,
}: {
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSave: (plan: AdminPlan) => void;
  open: boolean;
  plan: AdminPlan | null;
}) {
  const [draft, setDraft] = useState<PlanFormState>(() => buildDraft(mode, plan));

  useEffect(() => {
    if (open) {
      setDraft(buildDraft(mode, plan));
    }
  }, [mode, open, plan]);

  const resetDraft = (nextMode: "create" | "edit", nextPlan: AdminPlan | null) => {
    setDraft(buildDraft(nextMode, nextPlan));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetDraft(mode, plan);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo plan" : `Editar plan ${plan?.name ?? ""}`}
          </DialogTitle>
          <DialogDescription>
            Configura el catálogo comercial del frontend. Aquí solo modelamos la interfaz y el
            impacto visible, no el backend.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <Label htmlFor="plan-name">Nombre</Label>
              <Input
                id="plan-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="plan-status">Estado del plan</Label>
              <Select
                value={draft.status}
                onValueChange={(value: PlanStatus) =>
                  setDraft((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger id="plan-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="legacy">Legacy</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="plan-price">Precio mensual</Label>
              <Input
                id="plan-price"
                inputMode="numeric"
                value={draft.price}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, price: event.target.value }))
                }
                placeholder="149000"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-period">Periodo</Label>
              <Select
                value={draft.period}
                onValueChange={(value) => setDraft((current) => ({ ...current, period: value }))}
              >
                <SelectTrigger id="plan-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Mes</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field>
              <Label htmlFor="plan-users">Usuarios</Label>
              <Input
                id="plan-users"
                inputMode="numeric"
                value={draft.limits.users}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    limits: { ...current.limits, users: event.target.value },
                  }))
                }
                placeholder="25 o ilimitado"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-warehouses">Bodegas</Label>
              <Input
                id="plan-warehouses"
                inputMode="numeric"
                value={draft.limits.warehouses}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    limits: { ...current.limits, warehouses: event.target.value },
                  }))
                }
                placeholder="5 o ilimitado"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-transactions">Transacciones</Label>
              <Input
                id="plan-transactions"
                inputMode="numeric"
                value={draft.limits.transactions}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    limits: { ...current.limits, transactions: event.target.value },
                  }))
                }
                placeholder="100000 o ilimitado"
              />
            </Field>
          </div>

          <div className="grid gap-3">
            <div>
              <Label>Módulos incluidos</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Define qué habilita este plan dentro del catálogo comercial.
              </p>
            </div>
            <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
              {availableModules.map((module) => {
                const checked = draft.enabledModules.includes(module);

                return (
                  <label
                    key={module}
                    className="flex items-start gap-3 rounded-md border border-border bg-background p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        setDraft((current) => ({
                          ...current,
                          enabledModules: nextChecked
                            ? [...current.enabledModules, module]
                            : current.enabledModules.filter((item) => item !== module),
                        }))
                      }
                    />
                    <span className="text-sm text-foreground">{module}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-2">
            <Field>
              <Label htmlFor="plan-tenants">Empresas afectadas</Label>
              <Input
                id="plan-tenants"
                inputMode="numeric"
                value={draft.tenantCount.toString()}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    tenantCount: Number.parseInt(event.target.value || "0", 10) || 0,
                  }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="plan-notes">Nota operativa</Label>
              <Input
                id="plan-notes"
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Describe el uso comercial o contractual"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetDraft(mode, plan);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onSave({
                enabledModules: draft.enabledModules,
                id:
                  mode === "edit" && plan
                    ? plan.id
                    : (`custom_${draft.name.toLowerCase().replace(/\s+/g, "_")}` as AdminPlan["id"]),
                limits: {
                  transactions: parseLimitValue(draft.limits.transactions),
                  users: parseLimitValue(draft.limits.users),
                  warehouses: parseLimitValue(draft.limits.warehouses),
                },
                name: draft.name.trim() || "Nuevo plan",
                notes: draft.notes.trim() || "Sin nota operativa definida.",
                period: draft.period.trim() || "mes",
                price: parsePriceValue(draft.price),
                recommended:
                  mode === "edit" && plan
                    ? plan.recommended
                    : draft.name.toLowerCase().includes("pro"),
                status: draft.status,
                tenantCount: draft.tenantCount,
              })
            }
          >
            {mode === "create" ? "Crear plan" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="grid size-8 place-items-center rounded-md bg-muted/50 text-nuclear">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function ImpactMetric({ helper, label, value }: { helper: string; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function Limit({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">
        {value ? value.toLocaleString("es-CO") : "Ilimitado"}
      </span>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

function getStatusTone(status: PlanStatus) {
  if (status === "active") return "active";
  if (status === "draft") return "pending";
  return "blocked";
}

function buildDraft(mode: "create" | "edit", plan: AdminPlan | null): PlanFormState {
  if (mode === "edit" && plan) {
    return {
      enabledModules: plan.enabledModules,
      id: plan.id,
      limits: {
        transactions: formatLimitValue(plan.limits.transactions),
        users: formatLimitValue(plan.limits.users),
        warehouses: formatLimitValue(plan.limits.warehouses),
      },
      name: plan.name,
      notes: plan.notes,
      period: plan.period,
      price: plan.price?.toString() ?? "",
      status: plan.status,
      tenantCount: plan.tenantCount,
    };
  }

  return {
    enabledModules: ["Kárdex", "Recepciones"],
    id: "custom_new",
    limits: {
      transactions: "",
      users: "",
      warehouses: "",
    },
    name: "",
    notes: "",
    period: "mes",
    price: "",
    status: "draft",
    tenantCount: 0,
  };
}

function formatLimitValue(value: number | null) {
  return value === null ? "ilimitado" : value.toString();
}

function parseLimitValue(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "ilimitado") {
    return null;
  }

  return Number.parseInt(normalized.replace(/\D/g, ""), 10) || null;
}

function parsePriceValue(value: string) {
  const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? null : numeric;
}
