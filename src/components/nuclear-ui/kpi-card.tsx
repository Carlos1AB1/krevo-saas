import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  delta?: number; // percentual
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "nuclear" | "reactor" | "plasma";
  className?: string;
  children?: ReactNode;
}

const toneRing: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "before:opacity-0",
  nuclear:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklab,var(--nuclear)_22%,transparent)_0%,transparent_60%)]",
  reactor:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--reactor)_24%,transparent)_0%,transparent_60%)]",
  plasma:
    "before:opacity-100 before:bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--plasma)_28%,transparent)_0%,transparent_60%)]",
};

export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  format,
  delta,
  icon: Icon,
  hint,
  tone = "default",
  className,
  children,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
        "before:pointer-events-none before:absolute before:inset-0 before:transition-opacity before:duration-500",
        toneRing[tone],
        className,
      )}
    >
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
        {Icon ? (
          <span className="grid size-9 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-baseline gap-2">
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          format={format}
          className="font-display text-3xl font-semibold tracking-tight text-foreground"
        />
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {positive ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        ) : null}
      </div>

      {hint ? <p className="relative mt-2 text-xs text-muted-foreground">{hint}</p> : null}

      {children ? <div className="relative mt-4">{children}</div> : null}
    </div>
  );
}
