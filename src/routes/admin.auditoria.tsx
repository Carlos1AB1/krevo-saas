import { createFileRoute } from "@tanstack/react-router";
import { Download, ScrollText, ShieldAlert } from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { globalAuditEvents } from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [{ title: "Auditoría · SuperAdmin Krevo" }],
  }),
  component: GlobalAuditPage,
});

function GlobalAuditPage() {
  return (
    <>
      <AdminTopbar
        title="Auditoría"
        description="Registro global de eventos administrativos, cobros y seguridad multi-tenant."
        action={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Exportar
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <Card className="border-warning/25 bg-warning/5 shadow-[var(--shadow-soft)]">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <p className="font-semibold text-foreground">Auditoría global inmutable</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Toda acción de SuperAdmin debe quedar registrada porque puede afectar múltiples
                  empresas o reglas de aislamiento.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="size-4 text-nuclear" />
                Eventos recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="px-4">Fecha</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Severidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalAuditEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                          {event.timestamp}
                        </TableCell>
                        <TableCell className="font-medium">{event.actor}</TableCell>
                        <TableCell>{event.action}</TableCell>
                        <TableCell>{event.company}</TableCell>
                        <TableCell>
                          <SeverityBadge severity={event.severity} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function SeverityBadge({ severity }: { severity: "info" | "warning" | "critical" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-[10px] uppercase tracking-wider",
        severity === "info" && "border-info/25 bg-info/10 text-info",
        severity === "warning" && "border-warning/25 bg-warning/10 text-warning",
        severity === "critical" && "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {severity === "critical" ? "Crítico" : severity === "warning" ? "Advertencia" : "Info"}
    </Badge>
  );
}
