import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, ShieldCheck, UserCog, UserPlus, UserX } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type AdminUserPayload, type AdminUserRecord } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type UserFilter = "all" | "active" | "invited" | "blocked";
type AdminUserForm = AdminUserPayload;

const EMPTY_USER_FORM: AdminUserForm = {
  email: "",
  firstName: "",
  lastName: "",
  organizationId: "",
  password: "",
};

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuarios · SuperAdmin Krevo" }],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<AdminUserForm>(EMPTY_USER_FORM);

  const usersQuery = useQuery({
    queryFn: () => adminApi.getAdminUsers(),
    queryKey: ["admin-users"],
  });
  const companiesQuery = useQuery({
    queryFn: () => adminApi.getCompanies(),
    queryKey: ["admin-companies"],
  });
  const users = Array.isArray(usersQuery.data) ? usersQuery.data : [];
  const companies = Array.isArray(companiesQuery.data) ? companiesQuery.data : [];

  const createUserMutation = useMutation({
    mutationFn: (payload: AdminUserPayload) => adminApi.createAdminUser(payload),
    onSuccess: () => {
      toast.success("Usuario con acceso global creado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsCreateOpen(false);
      setForm(EMPTY_USER_FORM);
    },
    onError: (error: Error) => {
      toast.error(error.message || "No fue posible crear el usuario");
    },
  });

  const filteredUsers = useMemo(() => {
    const term = normalizeSearch(searchQuery);

    return users.filter((user) => {
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const haystack = normalizeSearch(
        [getUserName(user), user.email, user.role, user.lastActive, user.organizationName].join(
          " ",
        ),
      );
      const matchesSearch = !term || haystack.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, statusFilter, users]);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const invitedUsers = users.filter((user) => user.status === "invited").length;
  const blockedUsers = users.filter((user) => user.status === "blocked").length;
  const ownerUsers = users.filter((user) => user.role === "Owner SaaS").length;

  function submitCreateUser() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Nombre y apellido son obligatorios");
      return;
    }
    if (!form.email.trim()) {
      toast.error("El correo es obligatorio");
      return;
    }
    if (!form.organizationId) {
      toast.error("Selecciona una empresa base");
      return;
    }
    if (form.password.length < 8) {
      toast.error("La contraseña inicial debe tener al menos 8 caracteres");
      return;
    }

    createUserMutation.mutate({
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      organizationId: form.organizationId,
      password: form.password,
    });
  }

  return (
    <>
      <AdminTopbar
        title="Usuarios"
        description="Gobierno del equipo interno con acceso a la consola global del SaaS."
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Invitar usuario</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <UserStat
              label="Admins activos"
              value={activeUsers}
              hint="Acceso vigente sobre la consola global."
              tone="success"
              icon={ShieldCheck}
            />
            <UserStat
              label="Invitaciones pendientes"
              value={invitedUsers}
              hint="Accesos aún no aceptados."
              tone="info"
              icon={UserPlus}
            />
            <UserStat
              label="Accesos bloqueados"
              value={blockedUsers}
              hint="Cuentas sin entrada operativa."
              tone="critical"
              icon={UserX}
            />
            <UserStat
              label="Owners SaaS"
              value={ownerUsers}
              hint={`${companies.length} empresas bajo este perímetro de gobierno.`}
              tone="neutral"
              icon={UserCog}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Accesos internos</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {usersQuery.isLoading
                        ? "Cargando usuarios..."
                        : `${filteredUsers.length} usuario${
                            filteredUsers.length === 1 ? "" : "s"
                          } visible${searchQuery ? ` para "${searchQuery}"` : ""}.`}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[420px]">
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar por nombre, correo, rol o actividad..."
                      className="h-10"
                    />

                    <Tabs
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as UserFilter)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="active">Activos</TabsTrigger>
                        <TabsTrigger value="invited">Invitados</TabsTrigger>
                        <TabsTrigger value="blocked">Bloqueados</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid gap-3 sm:hidden">
                  {usersQuery.isLoading ? (
                    <UsersLoadingState />
                  ) : usersQuery.isError ? (
                    <UsersErrorState onRetry={() => usersQuery.refetch()} />
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <article
                        key={getUserId(user)}
                        className="rounded-lg border border-border bg-background/80 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-nuclear/10 text-xs font-bold text-nuclear">
                            {getInitials(getUserName(user))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {getUserName(user)}
                                </p>
                                <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <Mail className="size-3 shrink-0" />
                                  <span className="truncate">{user.email ?? "Sin correo"}</span>
                                </p>
                              </div>
                              <StatusBadge status={getUserStatus(user)} />
                            </div>

                            <div className="mt-4 space-y-3 text-sm">
                              <InfoPair label="Rol" value={getUserRole(user)} />
                              <InfoPair label="Última actividad" value={getLastActive(user)} />
                              <InfoPair
                                label="Acceso"
                                value={
                                  getUserStatus(user) === "invited"
                                    ? "Invitación enviada, sin acceso efectivo."
                                    : getUserStatus(user) === "blocked"
                                      ? "Acceso revocado temporalmente."
                                      : "Consola global habilitada."
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyUsersState />
                  )}
                </div>

                <div className="hidden sm:block">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="px-4">Usuario</TableHead>
                          <TableHead>Rol interno</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Última actividad</TableHead>
                          <TableHead>Acceso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersQuery.isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="px-4 py-10">
                              <UsersLoadingState />
                            </TableCell>
                          </TableRow>
                        ) : usersQuery.isError ? (
                          <TableRow>
                            <TableCell colSpan={5} className="px-4 py-10">
                              <UsersErrorState onRetry={() => usersQuery.refetch()} />
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.length ? (
                          filteredUsers.map((user) => (
                            <TableRow key={getUserId(user)}>
                              <TableCell className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-nuclear/10 text-xs font-bold text-nuclear">
                                    {getInitials(getUserName(user))}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {getUserName(user)}
                                    </p>
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Mail className="size-3" />
                                      {user.email ?? "Sin correo"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>{getUserRole(user)}</span>
                                  {getUserRole(user) === "Owner SaaS" ? (
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                      Control total
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={getUserStatus(user)} />
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {getLastActive(user)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                                    getUserStatus(user) === "active" &&
                                      "bg-success/10 text-success ring-1 ring-success/15",
                                    getUserStatus(user) === "invited" &&
                                      "bg-info/10 text-info ring-1 ring-info/15",
                                    getUserStatus(user) === "blocked" &&
                                      "bg-destructive/10 text-destructive ring-1 ring-destructive/15",
                                  )}
                                >
                                  <ShieldCheck className="size-3" />
                                  {getUserStatus(user) === "invited"
                                    ? "Pendiente"
                                    : getUserStatus(user) === "blocked"
                                      ? "Bloqueado"
                                      : "Consola global"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="px-4 py-10">
                              <EmptyUsersState />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base">Qué revisar primero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ReadingNote
                    tone="critical"
                    title="Owners con privilegio total"
                    body="Pocas cuentas deberían tener autoridad completa sobre cobros, catálogo y acceso cross-tenant."
                  />
                  <ReadingNote
                    tone="warning"
                    title="Alta con contraseña inicial"
                    body="Esta versión no envía correos: crea el acceso global y exige entregar la contraseña por un canal controlado."
                  />
                  <ReadingNote
                    tone="info"
                    title="Actividad reciente"
                    body="Cruza esta vista con auditoría cuando haya cambios críticos y necesites atribución inmediata."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base">Lectura correcta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Esta pantalla no administra usuarios de clientes. Administra el perímetro humano
                    que gobierna todo el SaaS.
                  </p>
                  <p>
                    Un escéptico diría que mostrar roles sin contexto de acceso efectivo es
                    maquillaje. Por eso la vista separa estado, actividad y privilegio operativo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar usuario interno</DialogTitle>
            <DialogDescription>
              Crea un usuario activo con acceso a la consola global. No se enviará correo
              automático.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Nombre" id="admin-first-name">
                <Input
                  id="admin-first-name"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                />
              </Field>
              <Field label="Apellido" id="admin-last-name">
                <Input
                  id="admin-last-name"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                />
              </Field>
            </div>

            <Field label="Correo" id="admin-email">
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </Field>

            <Field label="Empresa base" id="admin-company">
              <Select
                value={form.organizationId}
                onValueChange={(organizationId) =>
                  setForm((current) => ({ ...current, organizationId }))
                }
              >
                <SelectTrigger id="admin-company">
                  <SelectValue
                    placeholder={
                      companiesQuery.isLoading ? "Cargando empresas..." : "Selecciona empresa"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Contraseña inicial" id="admin-password">
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setForm(EMPTY_USER_FORM);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitCreateUser}
              disabled={createUserMutation.isPending || companiesQuery.isLoading}
            >
              {createUserMutation.isPending ? "Creando..." : "Crear acceso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserStat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: number;
  hint: string;
  tone: "success" | "info" | "critical" | "neutral";
}) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border",
              tone === "success" && "border-success/25 bg-success/10 text-success",
              tone === "info" && "border-info/25 bg-info/10 text-info",
              tone === "critical" && "border-destructive/25 bg-destructive/10 text-destructive",
              tone === "neutral" && "border-border bg-muted/60 text-foreground",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function Field({ children, id, label }: { children: ReactNode; id: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function UsersLoadingState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="font-medium text-foreground">Cargando usuarios</p>
      <p className="mt-1 text-sm text-muted-foreground">Consultando accesos internos reales.</p>
    </div>
  );
}

function UsersErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
      <p className="font-medium text-foreground">No fue posible cargar usuarios</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Verifica la sesión SuperAdmin y la disponibilidad del backend.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function ReadingNote({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "critical" | "warning" | "info";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "critical" && "border-destructive/20 bg-destructive/5",
        tone === "warning" && "border-warning/20 bg-warning/5",
        tone === "info" && "border-info/20 bg-info/5",
      )}
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function EmptyUsersState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-10 text-center">
      <p className="font-medium text-foreground">No hay usuarios con esos filtros</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajusta el estado o el término de búsqueda.
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function getUserId(user: AdminUserRecord) {
  return user.id ?? `${user.email ?? "admin"}-${getUserName(user)}`;
}

function getUserName(user: AdminUserRecord) {
  const fullName = user.name?.trim();

  if (fullName) {
    return fullName;
  }

  const derivedName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return derivedName || user.email || "Usuario sin nombre";
}

function getUserRole(user: AdminUserRecord) {
  return user.role || user.roles?.[0] || "Owner SaaS";
}

function getUserStatus(user: AdminUserRecord): UserFilter {
  if (user.status === "invited" || user.status === "blocked") {
    return user.status;
  }

  return "active";
}

function getLastActive(user: AdminUserRecord) {
  return user.lastActive || "Sin actividad registrada";
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
