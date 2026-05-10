import { createFileRoute } from "@tanstack/react-router";
import { Users2, Plus, Search, Shield, Settings2, UserCog, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/team")({
  head: () => ({
    meta: [{ title: "Equipo · Nuclear WMS" }],
  }),
  component: TeamPage,
});

const mockTeam = [
  {
    id: "usr_1",
    name: "Valentina Aristizábal",
    email: "valentina@cafequipe.com.co",
    role: "Admin",
    status: "active",
    lastActive: "Hace 5 minutos",
  },
  {
    id: "usr_2",
    name: "Carlos Mejía",
    email: "carlos.mejia@cafequipe.com.co",
    role: "Supervisor CEDI Armenia",
    status: "active",
    lastActive: "Hace 2 horas",
  },
  {
    id: "usr_3",
    name: "Jorge Ramírez",
    email: "jorge.r@cafequipe.com.co",
    role: "Operario Planta Circasia",
    status: "offline",
    lastActive: "Ayer 18:30",
  },
  {
    id: "usr_4",
    name: "Laura Martínez",
    email: "laura.m@cafequipe.com.co",
    role: "Operario Logístico",
    status: "active",
    lastActive: "Hace 10 minutos",
  },
];

function TeamPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Equipo</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Gestión de usuarios y permisos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            <span>Invitar Miembro</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <label htmlFor="search-team" className="sr-only">
                Buscar por nombre o email
              </label>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="search-team"
                placeholder="Buscar por nombre o email..."
                className="pl-9 h-10 bg-card shadow-sm"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Última Actividad</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {mockTeam.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nuclear/10 text-nuclear font-bold text-xs uppercase">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {user.role === "Admin" && (
                            <Shield className="size-3.5 text-destructive" />
                          )}
                          {user.role === "Supervisor" && (
                            <UserCog className="size-3.5 text-warning" />
                          )}
                          <span className="font-medium">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${user.status === "active" ? "bg-success" : "bg-muted-foreground"}`}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{user.lastActive}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Settings2 className="size-4" />
                        </Button>
                      </td>
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
