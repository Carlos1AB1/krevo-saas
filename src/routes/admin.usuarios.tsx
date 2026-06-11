import { createFileRoute } from "@tanstack/react-router";
import { Mail, Plus, ShieldCheck, UserCog, UserPlus, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUsers, companies } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

type UserFilter = "all" | "active" | "invited" | "blocked";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuarios · SuperAdmin Krevo" }],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserFilter>("all");

  const filteredUsers = useMemo(() => {
    const term = normalizeSearch(searchQuery);

    return adminUsers.filter((user) => {
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const haystack = normalizeSearch(
        [user.name, user.email, user.role, user.lastActive].join(" "),
      );
      const matchesSearch = !term || haystack.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, statusFilter]);

  const activeUsers = adminUsers.filter((user) => user.status === "active").length;
  const invitedUsers = adminUsers.filter((user) => user.status === "invited").length;
  const blockedUsers = adminUsers.filter((user) => user.status === "blocked").length;
  const ownerUsers = adminUsers.filter((user) => user.role === "Owner SaaS").length;

  return (
    <>
      <AdminTopbar
        title="Usuarios"
        description="Gobierno del equipo interno con acceso a la consola global del SaaS."
        action={
          <Button size="sm">
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
                      {filteredUsers.length} usuario{filteredUsers.length === 1 ? "" : "s"} visible
                      {searchQuery ? ` para "${searchQuery}"` : ""}.
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
                  {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <article
                        key={user.id}
                        className="rounded-lg border border-border bg-background/80 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-nuclear/10 text-xs font-bold text-nuclear">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {user.name}
                                </p>
                                <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <Mail className="size-3 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </p>
                              </div>
                              <StatusBadge status={user.status} />
                            </div>

                            <div className="mt-4 space-y-3 text-sm">
                              <InfoPair label="Rol" value={user.role} />
                              <InfoPair label="Última actividad" value={user.lastActive} />
                              <InfoPair
                                label="Acceso"
                                value={
                                  user.status === "invited"
                                    ? "Invitación enviada, sin acceso efectivo."
                                    : user.status === "blocked"
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
                        {filteredUsers.length ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-nuclear/10 text-xs font-bold text-nuclear">
                                    {getInitials(user.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{user.name}</p>
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Mail className="size-3" />
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>{user.role}</span>
                                  {user.role === "Owner SaaS" ? (
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                      Control total
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={user.status} />
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {user.lastActive}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                                    user.status === "active" &&
                                      "bg-success/10 text-success ring-1 ring-success/15",
                                    user.status === "invited" &&
                                      "bg-info/10 text-info ring-1 ring-info/15",
                                    user.status === "blocked" &&
                                      "bg-destructive/10 text-destructive ring-1 ring-destructive/15",
                                  )}
                                >
                                  <ShieldCheck className="size-3" />
                                  {user.status === "invited"
                                    ? "Pendiente"
                                    : user.status === "blocked"
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
                    title="Invitaciones abiertas"
                    body="Invitar sin fecha de expiración o seguimiento genera superficie innecesaria de acceso."
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

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
