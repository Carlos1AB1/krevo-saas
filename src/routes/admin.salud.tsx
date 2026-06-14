import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  HardDrive,
  RefreshCw,
  Server,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, type AdminHealth } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/salud")({
  head: () => ({
    meta: [{ title: "Salud Plataforma · SuperAdmin Krevo" }],
  }),
  component: PlatformHealthPage,
});

function PlatformHealthPage() {
  const healthQuery = useQuery({
    queryFn: () => adminApi.getHealth(),
    queryKey: ["admin-health"],
    refetchInterval: 30_000,
  });
  const health = healthQuery.data;
  const databaseStatus = health?.database === "up" ? "active" : "blocked";
  const platformStatus = health?.status === "ok" ? "active" : health ? "blocked" : "pending";
  const memoryUsagePercent = getMemoryUsagePercent(health);

  return (
    <>
      <AdminTopbar
        title="Salud Plataforma"
        description="Estado técnico protegido del backend SaaS, base de datos y runtime."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => healthQuery.refetch()}
            disabled={healthQuery.isFetching}
          >
            <RefreshCw className={cn("size-4", healthQuery.isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        }
      />

      <main className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HealthStat
              label="Estado general"
              value={
                healthQuery.isLoading
                  ? "Consultando"
                  : health?.status === "ok"
                    ? "Operativo"
                    : "Error"
              }
              helper={
                health
                  ? `Generado ${formatDateTime(health.generatedAt)}`
                  : "Esperando respuesta del backend"
              }
              tone={platformStatus}
            />
            <HealthStat
              label="Base de datos"
              value={health?.database === "up" ? "Disponible" : health ? "Caída" : "Pendiente"}
              helper="Check directo con Prisma sobre PostgreSQL"
              tone={databaseStatus}
            />
            <HealthStat
              label="Uptime"
              value={health ? formatDuration(health.uptimeSeconds) : "-"}
              helper="Tiempo activo del proceso backend"
              tone="active"
            />
            <HealthStat
              label="Heap usado"
              value={health ? `${memoryUsagePercent}%` : "-"}
              helper={
                health
                  ? `${formatBytes(health.memory.heapUsedBytes)} de ${formatBytes(health.memory.heapTotalBytes)}`
                  : "Sin datos todavía"
              }
              tone={
                memoryUsagePercent >= 85
                  ? "blocked"
                  : memoryUsagePercent >= 70
                    ? "pending"
                    : "active"
              }
            />
          </section>

          {healthQuery.isError ? (
            <Card className="border-destructive/30 bg-destructive/5 shadow-[var(--shadow-soft)]">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">No fue posible cargar salud</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Verifica la sesión SuperAdmin y que el backend esté disponible en
                    `/api/v1/admin/health`.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => healthQuery.refetch()}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle>Componentes críticos</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ServiceCard
                  icon={Server}
                  name="API Admin"
                  status={platformStatus}
                  metric={health?.status ?? "pendiente"}
                  note="Respuesta autenticada del endpoint protegido de plataforma."
                />
                <ServiceCard
                  icon={Database}
                  name="PostgreSQL"
                  status={databaseStatus}
                  metric={health?.database ?? "pendiente"}
                  note="Consulta `SELECT 1` ejecutada desde el servicio admin."
                />
                <ServiceCard
                  icon={HardDrive}
                  name="Memoria RSS"
                  status={getRssStatus(health)}
                  metric={health ? formatBytes(health.memory.rssBytes) : "pendiente"}
                  note="Memoria residente del proceso Node.js."
                />
                <ServiceCard
                  icon={Clock}
                  name="Runtime"
                  status="active"
                  metric={health ? formatDuration(health.uptimeSeconds) : "pendiente"}
                  note="Señal útil para detectar reinicios recientes."
                />
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4 text-nuclear" />
                  Lectura operativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RiskRow
                  tone={platformStatus}
                  title="Backend admin"
                  description={
                    health?.status === "ok"
                      ? "La API protegida responde correctamente para usuarios platform admin."
                      : "El panel debe tratar esta señal como incidente de plataforma."
                  }
                />
                <RiskRow
                  tone={databaseStatus}
                  title="Base de datos"
                  description={
                    health?.database === "up"
                      ? "Prisma pudo comunicarse con PostgreSQL."
                      : "Sin base de datos, el resto de métricas admin no es confiable."
                  }
                />
                <RiskRow
                  tone={memoryUsagePercent >= 70 ? "pending" : "active"}
                  title="Uso de memoria"
                  description={
                    health
                      ? `Heap en ${memoryUsagePercent}%. RSS actual: ${formatBytes(health.memory.rssBytes)}.`
                      : "Pendiente de respuesta del backend."
                  }
                />
              </CardContent>
            </Card>
          </section>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle>Memoria del proceso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <MemoryMeter
                label="Heap usado"
                value={health?.memory.heapUsedBytes}
                max={health?.memory.heapTotalBytes}
              />
              <MemoryMeter
                label="Heap total"
                value={health?.memory.heapTotalBytes}
                max={health?.memory.rssBytes}
              />
              <MemoryMeter
                label="RSS"
                value={health?.memory.rssBytes}
                max={health?.memory.rssBytes}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function HealthStat({
  helper,
  label,
  tone,
  value,
}: {
  helper: string;
  label: string;
  tone: "active" | "blocked" | "pending";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-3 font-display text-3xl font-semibold tracking-tight text-foreground",
          tone === "active" && "text-success",
          tone === "pending" && "text-warning",
          tone === "blocked" && "text-destructive",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  metric,
  name,
  note,
  status,
}: {
  icon: typeof Server;
  metric: string;
  name: string;
  note: string;
  status: "active" | "blocked" | "pending";
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-border bg-background text-nuclear">
            <Icon className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{metric}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function RiskRow({
  description,
  title,
  tone,
}: {
  description: string;
  title: string;
  tone: "active" | "blocked" | "pending";
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            tone === "active" && "bg-success/10 text-success",
            tone === "pending" && "bg-warning/10 text-warning",
            tone === "blocked" && "bg-destructive/10 text-destructive",
          )}
        >
          <AlertTriangle className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MemoryMeter({ label, max, value }: { label: string; max?: number; value?: number }) {
  const percent = value && max ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className="font-mono text-xs text-muted-foreground">
          {value ? formatBytes(value) : "-"}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 85 ? "bg-destructive" : percent >= 70 ? "bg-warning" : "bg-success",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function getMemoryUsagePercent(health?: AdminHealth) {
  if (!health || health.memory.heapTotalBytes <= 0) {
    return 0;
  }

  return Math.round((health.memory.heapUsedBytes / health.memory.heapTotalBytes) * 100);
}

function getRssStatus(health?: AdminHealth): "active" | "blocked" | "pending" {
  if (!health) {
    return "pending";
  }

  return health.memory.rssBytes >= 512 * 1024 * 1024 ? "pending" : "active";
}

function formatBytes(value: number) {
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
