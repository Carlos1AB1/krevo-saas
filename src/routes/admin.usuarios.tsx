import { createFileRoute } from "@tanstack/react-router";
import { Mail, Plus, ShieldCheck } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUsers } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuarios · SuperAdmin Krevo" }],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <>
      <AdminTopbar
        title="Usuarios"
        description="Equipo interno con acceso a la consola SuperAdmin."
        action={
          <Button size="sm">
            <Plus className="size-4" />
            Invitar usuario
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardContent className="p-0">
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
                  {adminUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-nuclear/10 text-xs font-bold text-nuclear">
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
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
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.lastActive}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                          <ShieldCheck className="size-3 text-success" />
                          Consola global
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
