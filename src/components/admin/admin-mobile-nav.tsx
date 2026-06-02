import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShieldCheck } from "lucide-react";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { adminGroups } from "@/components/admin/admin-nav-data";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0 lg:hidden"
          aria-label="Abrir navegación SuperAdmin"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[86vw] max-w-[340px] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border px-4 py-4 text-left">
          <SheetTitle className="flex items-center gap-2">
            <NuclearLogo withWordmark />
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs">
            <span className="grid size-6 place-items-center rounded-md bg-nuclear/10 text-nuclear">
              <ShieldCheck className="size-3.5" />
            </span>
            Consola SuperAdmin
          </SheetDescription>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {adminGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
                  const Icon = item.icon;

                  return (
                    <li key={item.to}>
                      <SheetClose asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-nuclear" />
                          )}
                          <Icon className="size-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-nuclear/15 px-1.5 py-0.5 text-[10px] font-semibold text-nuclear">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fase 1
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/80">
            Sin Soporte ni Feature Flags por ahora.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
