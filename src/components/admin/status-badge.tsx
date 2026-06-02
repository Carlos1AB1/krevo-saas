import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompanyStatus } from "@/lib/admin-mock";

type StatusBadgeProps = {
  status: CompanyStatus | "paid" | "failed" | "pending" | "active" | "invited" | "blocked";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap border text-[10px] uppercase tracking-wider",
        status === "active" || status === "paid"
          ? "border-success/25 bg-success/10 text-success"
          : "",
        status === "trial" || status === "pending" || status === "invited"
          ? "border-warning/25 bg-warning/10 text-warning"
          : "",
        status === "past_due" || status === "failed" || status === "blocked"
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "",
        status === "suspended" || status === "cancelled"
          ? "border-muted-foreground/25 bg-muted text-muted-foreground"
          : "",
      )}
    >
      {label}
    </Badge>
  );
}

function getStatusLabel(status: StatusBadgeProps["status"]) {
  switch (status) {
    case "trial":
      return "Trial";
    case "active":
      return "Activo";
    case "past_due":
      return "En mora";
    case "suspended":
      return "Suspendido";
    case "cancelled":
      return "Cancelado";
    case "paid":
      return "Pagado";
    case "failed":
      return "Fallido";
    case "pending":
      return "Pendiente";
    case "invited":
      return "Invitado";
    case "blocked":
      return "Bloqueado";
  }
}
