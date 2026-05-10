import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  label?: string;
  tone?: "success" | "nuclear" | "warning" | "destructive";
  className?: string;
}

const toneMap: Record<NonNullable<LiveBadgeProps["tone"]>, string> = {
  success: "bg-success",
  nuclear: "bg-nuclear",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function LiveBadge({ label = "EN VIVO", tone = "success", className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "font-mono inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", toneMap[tone])}
        style={{ animation: "var(--animate-pulse-live)" }}
        aria-hidden
      />
      {label}
    </span>
  );
}
