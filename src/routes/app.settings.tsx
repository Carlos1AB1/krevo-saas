import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Settings, Building, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useAuth } from "@/features/auth/AuthProvider";
import { useOrganizationSettings } from "@/features/settings/useOrganizationSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resolveOrganizationLogoSrc } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [{ title: "Ajustes · Krevo" }],
  }),
  component: () => (
    <RequirePermission action="update" subject="organizations">
      <SettingsPage />
    </RequirePermission>
  ),
});

const TIMEZONES = [
  "America/Bogota",
  "America/Mexico_City",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
];

const CURRENCIES = ["COP", "USD", "MXN", "PEN", "CLP"];

function SettingsPage() {
  const { user, reloadSession, updateUser } = useAuth();
  const orgId = user?.organizationId ?? "";
  const { organization, isLoading, isError, form, updateField, save, isSaving } =
    useOrganizationSettings(orgId);

  const isDirty =
    organization &&
    (form.name !== organization.name ||
      (form.legalName ?? "") !== (organization.legalName ?? "") ||
      (form.taxId ?? "") !== (organization.taxId ?? "") ||
      (form.logoUrl ?? "") !== (organization.logoUrl ?? "") ||
      form.currency !== organization.currency ||
      form.timezone !== organization.timezone);

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Settings className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Ajustes</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Perfil de la organización · {user?.organizationName}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          disabled={!isDirty || isSaving || isLoading}
          onClick={save}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20 flex xl:flex-row flex-col gap-6 items-start">
        <div className="w-full xl:max-w-xs space-y-1">
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-all">
              <Building className="size-4" />
              <span>Empresa</span>
            </button>
            <Link
              to="/app/billing"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
            >
              <CreditCard className="size-4" />
              <span>Facturación</span>
            </Link>
          </nav>
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando organización…
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              No fue posible cargar los datos de la organización. Verifica el permiso{" "}
              <code>read:organizations</code>.
            </div>
          )}

          {!isLoading && organization && (
            <>
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h3 className="font-semibold leading-none tracking-tight">Datos de la empresa</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Información fiscal y operativa del tenant SaaS. Slug:{" "}
                    <code className="text-xs">{organization.slug}</code>
                  </p>
                </div>
                <div className="p-5 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nombre comercial</Label>
                      <Input
                        id="companyName"
                        value={form.name ?? ""}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalName">Razón social</Label>
                      <Input
                        id="legalName"
                        value={form.legalName ?? ""}
                        onChange={(e) => updateField("legalName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nit">NIT / RUC</Label>
                      <Input
                        id="nit"
                        value={form.taxId ?? ""}
                        onChange={(e) => updateField("taxId", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo de la empresa</Label>
                      <div className="flex items-center gap-4">
                        {form.logoUrl && (
                          <img
                            src={resolveOrganizationLogoSrc(organization.id, form.logoUrl) ?? ""}
                            alt="Logo preview"
                            className="h-10 w-10 rounded object-contain border"
                          />
                        )}
                        <Input
                          id="logoFile"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const { uploadOrganizationLogo } = await import("@/features/organizations/organizations.api");
                              toast.loading("Subiendo logo...", { id: "logoUpload" });
                              const res = await uploadOrganizationLogo(organization.id, file);
                              const dbLogoUrl = res.logoUrl || "";
                              updateField("logoUrl", dbLogoUrl);
                              updateUser({ logoUrl: dbLogoUrl });
                              toast.success("Logo subido correctamente", { id: "logoUpload" });
                              await reloadSession();
                            } catch (err) {
                              toast.error("Error al subir el logo", { id: "logoUpload" });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Color Primario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColorPicker"
                          type="color"
                          value={form.primaryColor ?? "#000000"}
                          onChange={(e) => updateField("primaryColor", e.target.value)}
                          className="w-14 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          id="primaryColor"
                          type="text"
                          value={form.primaryColor ?? ""}
                          onChange={(e) => updateField("primaryColor", e.target.value)}
                          placeholder="#HexColor"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema (Diseño)</Label>
                      <select
                        id="theme"
                        value={form.theme ?? "light"}
                        onChange={(e) => updateField("theme", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda (ISO 4217)</Label>
                      <select
                        id="currency"
                        value={form.currency ?? "COP"}
                        onChange={(e) => updateField("currency", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona horaria</Label>
                      <select
                        id="timezone"
                        value={form.timezone ?? "America/Bogota"}
                        onChange={(e) => updateField("timezone", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Sesión actual:</span> {user?.firstName}{" "}
                  {user?.lastName} · {user?.email}
                </p>
                <p className="mt-1">
                  Roles: {user?.roles.join(", ") || "—"} · {user?.permissions.length} permisos activos
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
