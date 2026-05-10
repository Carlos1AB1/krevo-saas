import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card/40 px-6 py-14 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "var(--gradient-nuclear)" }}
      />
      {Icon ? (
        <div className="relative mb-4 grid size-14 place-items-center rounded-2xl border border-border bg-background shadow-[var(--shadow-soft)]">
          <Icon className="size-6 text-nuclear" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="relative font-display text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="relative mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <div className="relative mt-5 flex items-center gap-2">
          {action.href ? (
            <Button asChild variant="nuclear">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant="nuclear" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
