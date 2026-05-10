import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function scorePassword(pw: string): { score: number; label: string; tone: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Muy débil", tone: "bg-destructive" },
    { label: "Débil", tone: "bg-destructive" },
    { label: "Aceptable", tone: "bg-warning" },
    { label: "Buena", tone: "bg-info" },
    { label: "Fuerte", tone: "bg-success" },
    { label: "Excelente", tone: "bg-success" },
  ];
  return { score, ...map[score] };
}

export function PasswordStrength({ value }: { value: string }) {
  const { score, label, tone } = useMemo(() => scorePassword(value), [value]);
  const segments = 5;
  const filled = Math.min(score, segments);
  return (
    <div aria-live="polite" className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < filled ? tone : "bg-border/70",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Fortaleza: <span className="font-medium text-foreground">{value ? label : "—"}</span>
      </p>
    </div>
  );
}
