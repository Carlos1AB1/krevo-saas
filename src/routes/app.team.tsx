import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users2, Plus, Search, Shield, UserCog, Loader2, Settings2,
  CheckCircle2, XCircle, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getUsers, createUser, updateUserStatus, updateUserRoles, type UserResponse } from "@/features/users/users.api";
import { getRoles } from "@/features/roles/roles.api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/app/team")({
  head: () => ({ meta: [{ title: "Equipo · Krevo" }] }),
  component: () => (
    <RequirePermission action="read" subject="users">
      <TeamPage />
    </RequirePermission>
  ),
});

function TeamPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);

  // Create form state
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleIds, setNewRoleIds] = useState<string[]>([]);

  // Edit roles state
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);

  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ["users", { limit: 100 }],
    queryFn: () => getUsers({ limit: 100 }),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const users = usersData?.data ?? [];

  const filtered = users.filter((u) => {
    const ql = q.toLowerCase();
    if (!ql) return true;
    return (
      u.email.toLowerCase().includes(ql) ||
      u.firstName.toLowerCase().includes(ql) ||
      u.lastName.toLowerCase().includes(ql)
    );
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      setCreateOpen(false);
      resetCreateForm();
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),
    onSuccess: (updated) => {
      toast.success(updated.isActive ? "Usuario activado" : "Usuario desactivado");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rolesMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      updateUserRoles(id, roleIds),
    onSuccess: () => {
      toast.success("Roles actualizados");
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetCreateForm() {
    setNewEmail("");
    setNewFirstName("");
    setNewLastName("");
    setNewPassword("");
    setNewRoleIds([]);
  }

  function openEditRoles(user: UserResponse) {
    setEditUser(user);
    setEditRoleIds(user.roles.map((r) => r.id));
  }

  function toggleRole(id: string) {
    setEditRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  function toggleCreateRole(id: string) {
    setNewRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
            <Users2 className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Equipo</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Gestión de usuarios y roles · {users.length} miembro(s)
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" /> Invitar Miembro
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-4">

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="pl-9 h-10 bg-card shadow-sm" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Cargando equipo…
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No fue posible cargar los usuarios. Verifica que tengas el permiso <code>read:users</code>.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">Roles</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Último acceso</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          {q ? "Sin resultados para la búsqueda." : "No hay usuarios registrados."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nuclear/10 text-nuclear font-bold text-xs uppercase">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.length === 0 ? (
                                <span className="text-xs text-muted-foreground">Sin roles</span>
                              ) : (
                                user.roles.map((r) => (
                                  <span key={r.id} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold">
                                    <Shield className="size-2.5 text-muted-foreground" /> {r.name}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={cn("size-2 rounded-full", user.isActive ? "bg-success" : "bg-muted-foreground")} />
                              <span className="text-xs text-muted-foreground">
                                {user.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {user.lastLoginAt
                              ? format(parseISO(user.lastLoginAt), "dd MMM yyyy HH:mm", { locale: es })
                              : "Nunca"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Editar roles" onClick={() => openEditRoles(user)}>
                                <UserCog className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon"
                                className={cn("h-8 w-8", user.isActive ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-success")}
                                title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: user.id, isActive: !user.isActive })}>
                                {user.isActive ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roles section */}
          {roles.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-4 flex items-center gap-2">
                <ShieldCheck className="size-4 text-nuclear" />
                <h2 className="font-semibold text-sm">Roles del Sistema</h2>
                <span className="ml-auto text-xs text-muted-foreground">{roles.length} roles</span>
              </div>
              <div className="divide-y divide-border/50">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start justify-between px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{role.name}</p>
                        {role.isSystem && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Sistema</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {role.permissions.map((p) => (
                          <span key={p.code} className="font-mono text-[10px] bg-muted/60 rounded px-1.5 py-0.5 text-muted-foreground">
                            {p.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invitar Miembro Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invitar Miembro</SheetTitle>
            <SheetDescription>Crea un usuario y asígnale roles dentro de tu organización.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Ej: Juan" />
              </div>
              <div className="space-y-1.5">
                <Label>Apellido</Label>
                <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Ej: Pérez" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="juan@empresa.com" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Contraseña temporal</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mín. 8 chars, mayús., número y símbolo" />
                <p className="text-[11px] text-muted-foreground">Debe incluir mayúscula, número y símbolo especial.</p>
              </div>
            </div>
            {roles.length > 0 && (
              <div className="space-y-2">
                <Label>Roles (opcional)</Label>
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={newRoleIds.includes(role.id)}
                        onChange={() => toggleCreateRole(role.id)}
                        className="size-4"
                      />
                      <div>
                        <p className="text-sm font-medium">{role.name}</p>
                        <p className="text-[10px] text-muted-foreground">{role.permissions.map((p) => p.code).join(", ") || "Sin permisos"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createMutation.isPending}
              onClick={() => {
                if (!newEmail.trim() || !newFirstName.trim() || !newLastName.trim() || !newPassword) {
                  toast.error("Completa todos los campos requeridos");
                  return;
                }
                createMutation.mutate({
                  email: newEmail.trim(),
                  firstName: newFirstName.trim(),
                  lastName: newLastName.trim(),
                  password: newPassword,
                  roleIds: newRoleIds.length > 0 ? newRoleIds : undefined,
                });
              }}>
              {createMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creando…</> : "Crear Usuario"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Roles Sheet */}
      <Sheet open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
          {editUser && (
            <>
              <SheetHeader>
                <SheetTitle>Editar Roles</SheetTitle>
                <SheetDescription>{editUser.firstName} {editUser.lastName} · {editUser.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Label>Roles asignados</Label>
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={editRoleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="size-4"
                      />
                      <div>
                        <p className="text-sm font-medium">{role.name}</p>
                        <p className="text-[10px] text-muted-foreground">{role.permissions.map((p) => p.code).join(", ") || "Sin permisos"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
                <Button variant="nuclear" disabled={rolesMutation.isPending}
                  onClick={() => rolesMutation.mutate({ id: editUser.id, roleIds: editRoleIds })}>
                  {rolesMutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</> : "Guardar Roles"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
