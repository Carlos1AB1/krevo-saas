import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Bell,
  ChevronDown,
  Building2,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Command as CmdIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tenants = [
  { id: "t1", name: "Distribuidora Andina", role: "Owner" },
  { id: "t2", name: "FarmaLogística SAS", role: "Admin" },
  { id: "t3", name: "Supermercados Norte", role: "Operador" },
];

const notifications = [
  { id: 1, title: "Lote L-2031 vence en 7 días", level: "warning", time: "Hace 4 min" },
  { id: 2, title: "Stock bajo: SKU-0451 (ROP)", level: "danger", time: "Hace 22 min" },
  { id: 3, title: "Recepción RC-0089 confirmada", level: "info", time: "Hace 1 h" },
];

interface AppTopbarProps {
  breadcrumb?: { label: string; to?: string }[];
}

export function AppTopbar({ breadcrumb = [] }: AppTopbarProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [tenant, setTenant] = useState(tenants[0]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        {/* Tenant switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <span className="grid size-6 place-items-center rounded bg-nuclear/10 text-nuclear">
              <Building2 className="size-3.5" />
            </span>
            <span className="max-w-[180px] truncate">{tenant.name}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Cambiar de organización
            </DropdownMenuLabel>
            {tenants.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTenant(t)}
                className="flex items-start gap-2"
              >
                <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                {tenant.id === t.id && (
                  <span className="text-[10px] font-semibold text-nuclear">Activa</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">+ Crear organización</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <span className="text-border">/</span>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <span className="text-border">/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="flex-1" />

        {/* Command palette trigger */}
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex md:w-72"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Buscar SKU, lote, cliente…</span>
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            <CmdIcon className="inline size-2.5" />K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          aria-label="Buscar"
          className="grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent md:hidden"
        >
          <Search className="size-4" />
        </button>

        <LiveBadge className="hidden md:inline-flex" label="En vivo" />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">Notificaciones</p>
              <button className="text-xs text-nuclear hover:underline">Marcar leídas</button>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 px-3 py-2.5 hover:bg-accent">
                  <span
                    className={
                      "mt-1 size-2 shrink-0 rounded-full " +
                      (n.level === "danger"
                        ? "bg-destructive"
                        : n.level === "warning"
                          ? "bg-warning"
                          : "bg-info")
                    }
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border bg-card pl-1 pr-2 py-1 transition-colors hover:bg-accent">
            <Avatar className="size-7">
              <AvatarFallback className="bg-nuclear/15 text-xs font-semibold text-nuclear">
                CG
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">Carlos Gómez</p>
              <p className="text-xs text-muted-foreground">carlos@andina.co</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 size-4" />
              Ayuda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Command palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Buscar SKUs, lotes, recepciones, clientes…" />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Acciones rápidas">
            <CommandItem>Crear recepción</CommandItem>
            <CommandItem>Crear despacho</CommandItem>
            <CommandItem>Iniciar conteo cíclico</CommandItem>
            <CommandItem>Importar productos (CSV)</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ir a">
            <CommandItem>Dashboard</CommandItem>
            <CommandItem>Productos</CommandItem>
            <CommandItem>Stock & Lotes</CommandItem>
            <CommandItem>Bodegas</CommandItem>
            <CommandItem>Analítica ABC/Pareto</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Resultados recientes">
            <CommandItem>SKU-0451 · Acetaminofén 500mg</CommandItem>
            <CommandItem>Lote L-2031 · Vence 14/05/2026</CommandItem>
            <CommandItem>Recepción RC-0089 · 12 cajas</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
