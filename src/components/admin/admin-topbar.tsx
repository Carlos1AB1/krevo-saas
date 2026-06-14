import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type AdminTopbarProps = {
  title: string;
  description: string;
  action?: ReactNode;
  searchAriaLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function AdminTopbar({
  title,
  description,
  action,
  searchAriaLabel = "Buscar",
  searchPlaceholder = "Buscar empresa, NIT o factura...",
  searchValue,
  onSearchChange,
}: AdminTopbarProps) {
  const hasSearchHandler = typeof onSearchChange === "function";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="flex min-h-16 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 lg:px-6">
        <AdminMobileNav />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h1>
            <Badge
              variant="outline"
              className="hidden border-nuclear/25 bg-nuclear/10 text-[10px] uppercase tracking-wider text-nuclear sm:inline-flex"
            >
              SuperAdmin
            </Badge>
          </div>
          <p className="hidden max-w-[68ch] truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        </div>

        <div className="hidden w-full max-w-xs items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="size-3.5 shrink-0" />
          <Input
            aria-label={searchAriaLabel}
            placeholder={searchPlaceholder}
            value={hasSearchHandler ? (searchValue ?? "") : undefined}
            onChange={
              hasSearchHandler
                ? (event) => onSearchChange(event.target.value)
                : undefined
            }
            className="h-6 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        <button
          type="button"
          aria-label="Notificaciones globales"
          className="relative grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>

        {action ? <div className="flex shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
