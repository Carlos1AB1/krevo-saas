import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PackageSearch,
  Boxes,
  Warehouse,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  BarChart3,
  Users2,
  Settings,
  ChevronLeft,
  Shield,
  History,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; badge?: string };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Operación",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/receipts", label: "Recepciones", icon: ArrowDownToLine, badge: "3" },
      { to: "/app/picking", label: "Picking", icon: ClipboardCheck },
      { to: "/app/shipments", label: "Despachos", icon: ArrowUpFromLine },
    ],
  },
  {
    label: "Inventario",
    items: [
      { to: "/app/products", label: "Productos", icon: PackageSearch },
      { to: "/app/stock", label: "Stock & Lotes", icon: Boxes },
      { to: "/app/warehouses", label: "Bodegas", icon: Warehouse },
      { to: "/app/suppliers", label: "Proveedores", icon: Truck },
    ],
  },
  {
    label: "Inteligencia",
    items: [{ to: "/app/analytics", label: "Analítica ABC/Pareto", icon: BarChart3 }],
  },
  {
    label: "Administración",
    items: [
      { to: "/app/team", label: "Usuarios", icon: Users2 },
      { to: "/app/roles", label: "Roles y Permisos", icon: Shield },
      { to: "/app/audit", label: "Auditoría", icon: History },
      { to: "/app/settings", label: "Ajustes", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/app" className="flex items-center overflow-hidden">
          <NuclearLogo withWordmark={!collapsed} />
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
          onClick={() => setCollapsed((v) => !v)}
          className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {g.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active =
                  pathname === item.to || (item.to !== "/app" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-nuclear" />
                      )}
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
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
            Plan Reactor
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/80">12 días de prueba restantes</p>
          <Link
            to="/pricing"
            className="mt-2 inline-flex text-xs font-semibold text-nuclear hover:underline"
          >
            Activar suscripción →
          </Link>
        </div>
      )}
    </aside>
  );
}
