import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl text-center items-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-nuclear">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-balance text-base text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
