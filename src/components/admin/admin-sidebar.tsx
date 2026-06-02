import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { adminGroups } from "@/components/admin/admin-nav-data";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[272px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/admin" className="flex min-w-0 items-center overflow-hidden">
          <NuclearLogo withWordmark={!collapsed} />
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expandir navegación" : "Colapsar navegación"}
          onClick={() => setCollapsed((v) => !v)}
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <div className="border-b border-sidebar-border px-3 py-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent/45 px-3 py-2",
            collapsed && "justify-center px-2",
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-nuclear/10 text-nuclear">
            <ShieldCheck className="size-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                Consola SuperAdmin
              </p>
              <p className="truncate text-[11px] text-muted-foreground">Dueño del SaaS</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
                const Icon = item.icon;

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-nuclear" />
                      )}
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-nuclear/15 px-1.5 py-0.5 text-[10px] font-semibold text-nuclear">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fase 1
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/80">
            Feature Flags y Soporte quedan fuera del primer corte.
          </p>
        </div>
      )}
    </aside>
  );
}
