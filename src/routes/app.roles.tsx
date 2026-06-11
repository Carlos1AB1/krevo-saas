import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { usePermissions } from "@/features/auth/usePermissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Plus, Lock, Key, Users, CheckCircle2, XCircle, Loader2, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  getRoles, createRole, updateRole, deleteRole, type RoleResponse,
} from "@/features/roles/roles.api";
import {
  getPermissions, groupByModule, actionLabel, type PermissionModule,
} from "@/features/permissions/permissions.api";
import { getUsers } from "@/features/users/users.api";

export const Route = createFileRoute("/app/roles")({
  head: () => ({
    meta: [{ title: "Roles y Permisos · Krevo" }],
  }),
  component: () => (
    <RequirePermission action="read" subject="roles">
      <RolesPage />
    </RequirePermission>
  ),
});

type SheetState = { mode: "create" } | { mode: "edit"; role: RoleResponse } | null;

function RolesPage() {
  const qc = useQueryClient();
  const can = usePermissions();
  const canCreate = can("create", "roles");
  const canUpdate = can("update", "roles");
  const canManage = can("manage", "roles");
  const canReadUsers = can("read", "users");

  const [sheet, setSheet] = useState<SheetState>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleResponse | null>(null);

  // Form state (shared by create/edit)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users", { limit: 100 }],
    queryFn: () => getUsers({ limit: 100 }),
    enabled: canReadUsers,
  });

  const modules: PermissionModule[] = useMemo(
    () => groupByModule(permissions),
    [permissions],
  );

  const userCountByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of usersData?.data ?? []) {
      for (const role of user.roles) {
        counts.set(role.id, (counts.get(role.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [usersData]);

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Rol creado correctamente");
      closeSheet();
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateRole>[1] }) =>
      updateRole(id, body),
    onSuccess: () => {
      toast.success("Rol actualizado");
      closeSheet();
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Rol eliminado");
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setName("");
    setDescription("");
    setSelected(new Set());
    setSheet({ mode: "create" });
  }

  function openEdit(role: RoleResponse) {
    setName(role.name);
    setDescription(role.description ?? "");
    setSelected(new Set(role.permissions.map((p) => p.code)));
    setSheet({ mode: "edit", role });
  }

  function closeSheet() {
    setSheet(null);
  }

  function toggleCode(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleModule(mod: PermissionModule, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of mod.permissions) {
        if (checked) next.add(p.code);
        else next.delete(p.code);
      }
      return next;
    });
  }

  function submitSheet() {
    if (!name.trim()) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }
    const permissionCodes = [...selected];

    if (sheet?.mode === "edit") {
      updateMutation.mutate({
        id: sheet.role.id,
        body: { name: name.trim(), description: description.trim() || undefined, permissions: permissionCodes },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: permissionCodes,
      });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const editingSystemRole = sheet?.mode === "edit" && sheet.role.isSystem;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Roles y Permisos (RBAC)</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Parametrización de control de acceso a módulos.
          </p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            <span>Nuevo Rol</span>
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando roles…
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar los roles. Verifica que tengas el permiso <code>read:roles</code>.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
                        <Shield className="size-4" />
                      </div>
                      <h2 className="font-semibold leading-none text-foreground flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Sistema
                          </span>
                        )}
                      </h2>
                      <div className="ml-auto flex items-center gap-0.5">
                        {canUpdate && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-40"
                            title={role.isSystem ? "Los roles de sistema no se editan" : "Editar rol"}
                            disabled={role.isSystem}
                            onClick={() => openEdit(role)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {canManage && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive disabled:opacity-40"
                            title={role.isSystem ? "Los roles de sistema no se eliminan" : "Eliminar rol"}
                            disabled={role.isSystem}
                            onClick={() => setDeleteTarget(role)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground min-h-[32px]">
                      {role.description ?? "Sin descripción."}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      {canReadUsers && (
                        <div className="flex items-center text-xs font-medium text-muted-foreground">
                          <Users className="mr-1.5 size-3.5" />
                          {userCountByRole.get(role.id) ?? 0} usuarios
                        </div>
                      )}
                      <div className="flex items-center text-xs font-medium text-muted-foreground">
                        <Key className="mr-1.5 size-3.5" />
                        {role.permissions.length} perms
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <PermissionMatrix roles={roles} modules={modules} />
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Sheet */}
      <Sheet open={sheet !== null} onOpenChange={(v) => !v && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{sheet?.mode === "edit" ? "Editar Rol" : "Nuevo Rol"}</SheetTitle>
            <SheetDescription>
              Define un rol personalizado y selecciona sus permisos por módulo.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre del rol</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Operador de Bodega"
                disabled={editingSystemRole}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Qué puede hacer este rol en la operación?"
                rows={2}
                disabled={editingSystemRole}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permisos por módulo</Label>
                <span className="text-[11px] text-muted-foreground">{selected.size} seleccionados</span>
              </div>

              {editingSystemRole && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground">
                  Los permisos de un rol de sistema no pueden modificarse.
                </div>
              )}

              <div className="space-y-3">
                {modules.map((mod) => {
                  const allChecked = mod.permissions.every((p) => selected.has(p.code));
                  return (
                    <div key={mod.subject} className="rounded-lg border border-border overflow-hidden">
                      <label className="flex items-center gap-2 bg-muted/40 px-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={allChecked}
                          disabled={editingSystemRole}
                          onChange={(e) => toggleModule(mod, e.target.checked)}
                        />
                        <span className="text-sm font-semibold">{mod.label}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3">
                        {mod.permissions.map((p) => (
                          <label key={p.code} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              className="size-3.5"
                              checked={selected.has(p.code)}
                              disabled={editingSystemRole}
                              onChange={() => toggleCode(p.code)}
                            />
                            <span>{actionLabel(p.action)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={closeSheet}>Cancelar</Button>
            <Button variant="nuclear" disabled={isSaving} onClick={submitSheet}>
              {isSaving ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</>
              ) : sheet?.mode === "edit" ? "Guardar cambios" : "Crear rol"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el rol "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo se permite si ningún usuario tiene este rol asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Eliminando…</>
              ) : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PermissionMatrix({
  roles,
  modules,
}: {
  roles: RoleResponse[];
  modules: PermissionModule[];
}) {
  if (modules.length === 0) return null;

  function accessLevel(role: RoleResponse, subject: string): "full" | "partial" | "none" {
    const codes = role.permissions.map((p) => p.code);
    if (codes.includes(`manage:${subject}`)) return "full";
    if (role.permissions.some((p) => p.subject === subject)) return "partial";
    return "none";
  }

  return (
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
              {roles.map((r) => (
                <th key={r.id} className="px-4 py-3 text-center whitespace-nowrap">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {modules.map((mod) => (
              <tr key={mod.subject} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{mod.label}</td>
                {roles.map((r) => {
                  const level = accessLevel(r, mod.subject);
                  return (
                    <td key={`${mod.subject}-${r.id}`} className="px-4 py-3 text-center">
                      {level === "full" ? (
                        <span
                          className="inline-flex items-center justify-center size-6 rounded-full bg-success/10 text-success"
                          title="Acceso total (manage)"
                        >
                          <CheckCircle2 className="size-3" />
                        </span>
                      ) : level === "partial" ? (
                        <span
                          className="inline-flex items-center justify-center size-6 rounded-full bg-warning/10 text-warning"
                          title="Acceso parcial"
                        >
                          <Key className="size-3" />
                        </span>
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
  );
}
