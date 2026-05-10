import { cn } from "@/lib/utils";

export function ShimmerSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shimmer rounded-md bg-muted/40", className)} {...props} />;
}
