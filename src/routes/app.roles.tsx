import { createFileRoute } from "@tanstack/react-router";
import { Shield, Plus, Lock, Key, Users, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/roles")({
  head: () => ({
    meta: [{ title: "Roles y Permisos · Krevo" }],
  }),
  component: RolesPage,
});

const mockRoles = [
  {
    id: "role_1",
    name: "SuperAdmin",
    description: "Acceso total al sistema y facturación.",
    users: 1,
    permissions: ["all:read", "all:write", "billing:manage", "users:manage"],
  },
  {
    id: "role_2",
    name: "Administrador Tenant",
    description: "Gerencia general del centro de distribución.",
    users: 2,
    permissions: [
      "inventory:manage",
      "orders:manage",
      "reports:read",
      "users:read",
      "settings:manage",
    ],
  },
  {
    id: "role_3",
    name: "Supervisor",
    description: "Gestión operativa (Jefe de Producción/Bodega).",
    users: 4,
    permissions: ["inventory:manage", "orders:approve", "reports:read"],
  },
  {
    id: "role_4",
    name: "Operario",
    description: "Ejecución de actividades logísticas (Picking, Packing).",
    users: 12,
    permissions: ["inventory:read", "orders:process"],
  },
];

const permissionCategories = [
  { name: "Inventario", key: "inventory" },
  { name: "Órdenes", key: "orders" },
  { name: "Reportes y BI", key: "reports" },
  { name: "Configuración", key: "settings" },
];

function RolesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Roles y Permisos (RBAC)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Parametrización de control de acceso a módulos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            <span>Nuevo Rol</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockRoles.map((role) => (
              <div
                key={role.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
                    <Shield className="size-4" />
                  </div>
                  <h2 className="font-semibold leading-none text-foreground">{role.name}</h2>
                </div>
                <p className="text-xs text-muted-foreground min-h-[32px]">{role.description}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Users className="mr-1.5 size-3.5" />
                    {role.users} usuarios
                  </div>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Key className="mr-1.5 size-3.5" />
                    {role.permissions.length} perms
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold leading-none flex items-center gap-2 text-foreground text-base">
                <Lock className="size-4" /> Matriz de Permisos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualización general de acceso por módulo y rol.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Módulo</th>
                    {mockRoles.map((r) => (
                      <th key={r.id} className="px-4 py-3 text-center">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {permissionCategories.map((cat) => (
                    <tr key={cat.key} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      {mockRoles.map((r) => {
                        const hasAccess = r.permissions.some(
                          (p) => p.startsWith(cat.key) || p.startsWith("all"),
                        );
                        const isPartial = r.permissions.some((p) => p === `${cat.key}:read`);
                        return (
                          <td key={`${cat.key}-${r.id}`} className="px-4 py-3 text-center">
                            {hasAccess ? (
                              isPartial ? (
                                <span
                                  className="inline-flex items-center justify-center size-6 rounded-full bg-warning/10 text-warning"
                                  title="Solo lectura"
                                >
                                  <Key className="size-3" />
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center size-6 rounded-full bg-success/10 text-success"
                                  title="Acceso total"
                                >
                                  <CheckCircle2 className="size-3" />
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-muted text-muted-foreground">
                                <XCircle className="size-3 opacity-50" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
