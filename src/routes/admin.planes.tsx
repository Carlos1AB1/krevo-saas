import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Crown,
  Plus,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  adminApi,
  type AdminPlan as BackendAdminPlan,
  type AdminPlanPayload,
} from "@/lib/admin-api";
import { formatCop } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/planes")({
  head: () => ({
    meta: [{ title: "Planes · SuperAdmin Krevo" }],
  }),
  component: PlansPage,
});

type PlanStatus = "active" | "draft" | "legacy";

type PlanFormState = {
  billingInterval: string;
  code: string;
  currency: string;
  description: string;
  dLocalCountry: string;
  dLocalPlanId: string;
  dLocalPlanToken: string;
  features: string[];
  id: string;
  isActive: boolean;
  maxProducts: string;
  maxUsers: string;
  name: string;
  price: string;
  sortOrder: string;
};

type AdminPlan = BackendAdminPlan;

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

function PlansPage() {
  const queryClient = useQueryClient();
  const [editingPlanId, setEditingPlanId] = useState<AdminPlan["id"] | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<AdminPlan | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const plansQuery = useQuery({
    queryFn: () => adminApi.getPlans(),
    queryKey: ["admin-plans"],
  });
  const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];
  const createPlanMutation = useMutation({
    mutationFn: (payload: AdminPlanPayload) => adminApi.createPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
    },
  });
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminPlanPayload> }) =>
      adminApi.updatePlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
    },
  });
  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
    },
  });

  const editingPlan = plans.find((plan) => plan?.id === editingPlanId) ?? null;
  const activePlans = plans.filter((plan) => getPlanStatus(plan) === "active").length;
  const highestPrice = plans.reduce(
    (max, plan) => Math.max(max, centsToUnit(getPlanPriceCents(plan)) ?? 0),
    0,
  );
  const recommendedPlan = plans.find((plan) => getPlanStatus(plan) === "active") ?? plans[0];

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
            <SummaryTile label="Planes totales" value={plans.length.toString()} icon={UsersRound} />
            <SummaryTile
              label="Plan destacado"
              value={getPlanName(recommendedPlan)}
              icon={Sparkles}
            />
            <SummaryTile
              label="Ticket más alto"
              value={highestPrice ? `$${formatCop(highestPrice)}` : "A medida"}
              icon={Crown}
            />
          </section>

          {plansQuery.isLoading ? (
            <PlansLoadingState />
          ) : plansQuery.isError ? (
            <PlansErrorState onRetry={() => plansQuery.refetch()} />
          ) : !plans.length ? (
            <PlansEmptyState />
          ) : (
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
              <div className="grid gap-5 lg:grid-cols-2">
                {plans.map((plan, index) => {
                  const status = getPlanStatus(plan);
                  const statusTone = getStatusTone(status);
                  const features = getPlanFeatures(plan);
                  const price = centsToUnit(getPlanPriceCents(plan));
                  const planId = getPlanId(plan, index);

                  return (
                    <Card
                      key={planId}
                      className={cn(
                        "border-border shadow-[var(--shadow-soft)]",
                        status === "active" && "border-nuclear/35 bg-nuclear/5",
                      )}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle>{getPlanName(plan)}</CardTitle>
                              {status === "active" && (
                                <span className="rounded-full bg-nuclear px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-nuclear-foreground">
                                  Activo
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={statusTone} />
                              <span className="text-xs text-muted-foreground">
                                Código {getPlanCode(plan)}
                              </span>
                            </div>
                          </div>
                          <span className="grid size-9 place-items-center rounded-lg border border-border bg-background text-nuclear">
                            <SlidersHorizontal className="size-4" />
                          </span>
                        </div>

                        <div className="rounded-xl border border-border bg-background/80 p-4">
                          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
                            {price ? `$${formatCop(price)}` : "A medida"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getPlanCurrency(plan)} / {getBillingLabel(plan)}
                          </p>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {getPlanDescription(plan)}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                          <Limit label="Usuarios" value={getPlanLimit(plan, "users")} />
                          <Limit label="Productos" value={getPlanLimit(plan, "products")} />
                        </div>

                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Módulos incluidos
                          </p>
                          {features.length ? (
                            <ul className="grid gap-2 text-sm sm:grid-cols-2">
                              {features.map((module) => (
                                <li
                                  key={module}
                                  className="flex items-start gap-2 rounded-md bg-muted/30 p-2"
                                >
                                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                  <span>{module}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                              Sin módulos definidos.
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3 rounded-lg border border-border bg-background/80 p-4 text-sm sm:grid-cols-2">
                          <ImpactMetric
                            label="Orden"
                            value={formatNumber(plan?.sortOrder) ?? "-"}
                            helper="Prioridad de presentación del catálogo"
                          />
                          <ImpactMetric
                            label="Tipo comercial"
                            value={price ? "Self-serve" : "Negociado"}
                            helper="Segmentación usada en ventas"
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={!plan?.id}
                            onClick={() => setEditingPlanId(plan.id)}
                          >
                            Editar plan
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-destructive hover:text-destructive"
                            disabled={!plan?.id}
                            onClick={() => setDeletingPlan(plan)}
                          >
                            <Trash2 className="size-4" />
                            Eliminar
                          </Button>
                        </div>
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
                          <th className="px-3 py-2 font-medium text-muted-foreground">Usuarios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map((plan, index) => {
                          const price = centsToUnit(getPlanPriceCents(plan));

                          return (
                            <tr key={getPlanId(plan, index)} className="border-t border-border">
                              <td className="px-3 py-3 font-medium text-foreground">
                                {getPlanName(plan)}
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">
                                {price ? `$${formatCop(price)}` : "A medida"}
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">
                                {formatLimit(getPlanLimit(plan, "users"))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Qué controla esta vista</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Precio, periodo y visibilidad comercial del catálogo.</li>
                      <li>Límites operativos que afectan onboarding y expansión.</li>
                      <li>Campos dLocal usados para sincronización de planes de pago.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>

      <PlanDialog
        mode="create"
        open={isCreateOpen}
        plan={null}
        onOpenChange={setIsCreateOpen}
        saving={createPlanMutation.isPending}
        onSave={async (nextPlan) => {
          await createPlanMutation.mutateAsync(nextPlan);
          setIsCreateOpen(false);
        }}
      />

      <PlanDialog
        mode="edit"
        open={Boolean(editingPlan)}
        plan={editingPlan}
        saving={updatePlanMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPlanId(null);
          }
        }}
        onSave={async (payload) => {
          if (!editingPlan?.id) return;

          await updatePlanMutation.mutateAsync({
            id: editingPlan.id,
            payload,
          });
          setEditingPlanId(null);
        }}
      />

      <AlertDialog
        open={Boolean(deletingPlan)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPlan(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plan</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará {getPlanName(deletingPlan)} del catálogo de planes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlanMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePlanMutation.isPending || !deletingPlan?.id}
              onClick={async (event) => {
                event.preventDefault();
                if (!deletingPlan?.id) return;

                await deletePlanMutation.mutateAsync(deletingPlan.id);
                setDeletingPlan(null);
              }}
            >
              {deletePlanMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PlanDialog({
  mode,
  onOpenChange,
  onSave,
  open,
  plan,
  saving,
}: {
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSave: (payload: AdminPlanPayload) => Promise<void>;
  open: boolean;
  plan: AdminPlan | null;
  saving: boolean;
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
            {mode === "create" ? "Nuevo plan" : `Editar plan ${getPlanName(plan)}`}
          </DialogTitle>
          <DialogDescription>
            Configura el catálogo comercial, límites y datos de integración del plan.
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
              <Label htmlFor="plan-code">Código</Label>
              <Input
                id="plan-code"
                value={draft.code}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="basic, pro, enterprise"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-status">Estado del plan</Label>
              <Select
                value={draft.isActive ? "active" : "draft"}
                onValueChange={(value: PlanStatus) =>
                  setDraft((current) => ({ ...current, isActive: value === "active" }))
                }
              >
                <SelectTrigger id="plan-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="plan-price">Precio</Label>
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
              <Label htmlFor="plan-currency">Moneda</Label>
              <Input
                id="plan-currency"
                value={draft.currency}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, currency: event.target.value }))
                }
                placeholder="COP"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-period">Periodo</Label>
              <Select
                value={draft.billingInterval}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, billingInterval: value }))
                }
              >
                <SelectTrigger id="plan-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                  <SelectItem value="CONTRACT">Contrato</SelectItem>
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
                value={draft.maxUsers}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, maxUsers: event.target.value }))
                }
                placeholder="25 o ilimitado"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-products">Productos</Label>
              <Input
                id="plan-products"
                inputMode="numeric"
                value={draft.maxProducts}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, maxProducts: event.target.value }))
                }
                placeholder="1000 o ilimitado"
              />
            </Field>

            <Field>
              <Label htmlFor="plan-sort-order">Orden</Label>
              <Input
                id="plan-sort-order"
                inputMode="numeric"
                value={draft.sortOrder}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, sortOrder: event.target.value }))
                }
                placeholder="0"
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="plan-description">Descripción</Label>
            <Input
              id="plan-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Describe el uso comercial o contractual"
            />
          </Field>

          <div className="grid gap-3">
            <div>
              <Label>Módulos incluidos</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Define qué habilita este plan dentro del catálogo comercial.
              </p>
            </div>
            <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
              {availableModules.map((module) => {
                const checked = draft.features.includes(module);

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
                          features: nextChecked
                            ? [...current.features, module]
                            : current.features.filter((item) => item !== module),
                        }))
                      }
                    />
                    <span className="text-sm text-foreground">{module}</span>
                  </label>
                );
              })}
            </div>
            <Field>
              <Label htmlFor="plan-features">Features adicionales</Label>
              <Input
                id="plan-features"
                value={draft.features
                  .filter((feature) => !availableModules.includes(feature))
                  .join(", ")}
                onChange={(event) => {
                  const checkedFeatures = draft.features.filter((feature) =>
                    availableModules.includes(feature),
                  );
                  const customFeatures = parseFeatureList(event.target.value);

                  setDraft((current) => ({
                    ...current,
                    features: [...checkedFeatures, ...customFeatures],
                  }));
                }}
                placeholder="Separadas por coma"
              />
            </Field>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-3">
            <Field>
              <Label htmlFor="plan-dlocal-token">dLocal token</Label>
              <Input
                id="plan-dlocal-token"
                value={draft.dLocalPlanToken}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, dLocalPlanToken: event.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="plan-dlocal-id">dLocal plan ID</Label>
              <Input
                id="plan-dlocal-id"
                value={draft.dLocalPlanId}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, dLocalPlanId: event.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="plan-dlocal-country">dLocal país</Label>
              <Input
                id="plan-dlocal-country"
                value={draft.dLocalCountry}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, dLocalCountry: event.target.value }))
                }
                placeholder="CO"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => {
              onOpenChange(false);
              resetDraft(mode, plan);
            }}
          >
            Cancelar
          </Button>
          <Button disabled={saving} onClick={async () => await onSave(buildPlanPayload(draft))}>
            {saving ? "Guardando..." : mode === "create" ? "Crear plan" : "Guardar cambios"}
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
      <span className="font-mono font-semibold text-foreground">{formatLimit(value)}</span>
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

function getPlanId(plan: AdminPlan | null | undefined, index: number) {
  return plan?.id ?? `plan-${index}`;
}

function getPlanName(plan: AdminPlan | null | undefined) {
  return plan?.name?.trim() || "Plan sin nombre";
}

function getPlanCode(plan: AdminPlan | null | undefined) {
  return plan?.code?.trim() || "sin-codigo";
}

function getPlanCurrency(plan: AdminPlan | null | undefined) {
  return plan?.currency?.trim() || "COP";
}

function getPlanDescription(plan: AdminPlan | null | undefined) {
  return plan?.description?.trim() || "Sin descripción definida.";
}

function getPlanPriceCents(plan: AdminPlan | null | undefined) {
  return typeof plan?.priceCents === "number" ? plan.priceCents : null;
}

function getPlanLimit(plan: AdminPlan | null | undefined, limit: "products" | "users") {
  const value = limit === "users" ? plan?.maxUsers : plan?.maxProducts;

  return typeof value === "number" ? value : null;
}

function getPlanFeatures(plan: AdminPlan | null | undefined) {
  const items = plan?.features?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((feature): feature is string => typeof feature === "string")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function getPlanStatus(plan: AdminPlan | null | undefined): PlanStatus {
  return plan?.isActive === false ? "draft" : "active";
}

function getBillingLabel(plan: AdminPlan | null | undefined) {
  const interval = plan?.billingInterval?.trim().toUpperCase();

  if (interval === "MONTHLY") return "mes";
  if (interval === "YEARLY") return "año";
  if (interval === "CONTRACT") return "contrato";
  return interval?.toLowerCase() || "mes";
}

function buildDraft(mode: "create" | "edit", plan: AdminPlan | null): PlanFormState {
  if (mode === "edit" && plan) {
    return {
      billingInterval: plan.billingInterval ?? "MONTHLY",
      code: plan.code ?? "",
      currency: getPlanCurrency(plan),
      description: plan.description ?? "",
      dLocalCountry: plan.dLocalCountry ?? "",
      dLocalPlanId: plan.dLocalPlanId?.toString() ?? "",
      dLocalPlanToken: plan.dLocalPlanToken ?? "",
      features: getPlanFeatures(plan),
      id: plan.id,
      isActive: plan.isActive !== false,
      maxProducts: formatLimitValue(plan.maxProducts),
      maxUsers: formatLimitValue(plan.maxUsers),
      name: plan.name ?? "",
      price: centsToUnit(plan.priceCents)?.toString() ?? "",
      sortOrder: formatNumber(plan.sortOrder) ?? "",
    };
  }

  return {
    billingInterval: "MONTHLY",
    code: "",
    currency: "COP",
    description: "",
    dLocalCountry: "",
    dLocalPlanId: "",
    dLocalPlanToken: "",
    features: ["Kárdex", "Recepciones"],
    id: "custom_new",
    isActive: false,
    maxProducts: "",
    maxUsers: "",
    name: "",
    price: "",
    sortOrder: "0",
  };
}

function buildPlanPayload(draft: PlanFormState): AdminPlanPayload {
  return {
    billingInterval: draft.billingInterval.trim() || "MONTHLY",
    code: draft.code.trim() || slugify(draft.name || "plan"),
    currency: draft.currency.trim() || "COP",
    description: draft.description.trim() || null,
    features: draft.features.length ? { items: draft.features } : null,
    isActive: draft.isActive,
    maxProducts: parseLimitValue(draft.maxProducts),
    maxUsers: parseLimitValue(draft.maxUsers),
    name: draft.name.trim() || "Nuevo plan",
    priceCents: parsePriceCents(draft.price),
    sortOrder: parseIntegerValue(draft.sortOrder) ?? 0,
  };
}

function formatLimitValue(value: number | null | undefined) {
  return value === null || value === undefined ? "ilimitado" : value.toString();
}

function formatLimit(value: number | null) {
  return value ? value.toLocaleString("es-CO") : "Ilimitado";
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" ? value.toLocaleString("es-CO") : null;
}

function parseLimitValue(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "ilimitado") {
    return null;
  }

  return Number.parseInt(normalized.replace(/\D/g, ""), 10) || null;
}

function parseIntegerValue(value: string) {
  const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? null : numeric;
}

function parsePriceCents(value: string) {
  const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? null : numeric * 100;
}

function parseFeatureList(value: string) {
  return value
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function centsToUnit(value?: number | null) {
  return typeof value === "number" ? value / 100 : null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function PlansLoadingState() {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[520px] w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] w-full rounded-xl" />
    </section>
  );
}

function PlansErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-6">
        <p className="font-semibold text-foreground">No se pudo cargar el catálogo de planes</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Esta vista ya depende del backend para listar y administrar planes.
        </p>
        <Button className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

function PlansEmptyState() {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-6">
        <p className="font-semibold text-foreground">No hay planes</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El backend no devolvió planes para esta consola.
        </p>
      </CardContent>
    </Card>
  );
}
