import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Bell,
  ChevronDown,
  Building2,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Menu,
  Command as CmdIcon,
  Check,
  Loader2,
  PlusCircle,
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
import { useAuth } from "@/features/auth/AuthProvider";
import { getAccessToken, saveTokens } from "@/features/auth/auth.storage";
import { switchOrganization } from "@/features/auth/auth.api";
import { getOrganizations } from "@/features/organizations/organizations.api";

const notifications = [
  { id: 1, title: "Lote L-2031 vence en 7 días", level: "warning", time: "Hace 4 min" },
  { id: 2, title: "Stock bajo: SKU-0451 (ROP)", level: "danger", time: "Hace 22 min" },
  { id: 3, title: "Recepción RC-0089 confirmada", level: "info", time: "Hace 1 h" },
];

interface AppTopbarProps {
  breadcrumb?: { label: string; to?: string }[];
  onMobileMenuClick?: () => void;
}

export function AppTopbar({ breadcrumb = [], onMobileMenuClick }: AppTopbarProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logoutUser, reloadSession } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const isPlatformAdmin = user?.isPlatformAdmin ?? false;

  const { data: orgs = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
    enabled: isPlatformAdmin,
    staleTime: 60_000,
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      toast.success("Sesión cerrada", {
        description: "Has cerrado tu sesión de forma segura.",
      });
      navigate({ to: "/login" });
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === user?.organizationId || switching) return;
    setSwitching(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error("No token");
      const tokens = await switchOrganization(accessToken, orgId);
      saveTokens(tokens.accessToken, tokens.refreshToken);
      await reloadSession();
      await qc.invalidateQueries();
      toast.success("Organización cambiada", {
        description: `Ahora estás en ${orgs.find((o) => o.id === orgId)?.name ?? orgId}.`,
      });
    } catch {
      toast.error("No fue posible cambiar de organización.");
    } finally {
      setSwitching(false);
    }
  };

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

  const currentOrgName = user?.organizationName ?? "Organización";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        {/* Hamburger — only on mobile */}
        {onMobileMenuClick && (
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={onMobileMenuClick}
            className="grid size-9 cursor-pointer place-items-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Tenant switcher — solo visible para super admins de Krevo */}
        {isPlatformAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              <span className="grid size-6 place-items-center rounded bg-nuclear/10 text-nuclear">
                {switching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Building2 className="size-3.5" />
                )}
              </span>
              <span className="max-w-[180px] truncate">{currentOrgName}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Cambiar de organización
              </DropdownMenuLabel>
              {orgs.map((org) => {
                const isActive = org.id === user?.organizationId;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSwitchOrg(org.id)}
                    disabled={isActive || switching}
                    className="flex items-start gap-2"
                  >
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                    </div>
                    {isActive && (
                      <Check className="size-3.5 shrink-0 text-nuclear" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm"
                onClick={() => navigate({ to: "/register" })}
              >
                <PlusCircle className="size-4 text-muted-foreground" />
                Crear organización
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground">
            <span className="grid size-6 place-items-center rounded bg-nuclear/10 text-nuclear">
              <Building2 className="size-3.5" />
            </span>
            <span className="max-w-[180px] truncate">{currentOrgName}</span>
          </div>
        )}

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
          className="hidden cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex md:w-72"
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
          className="grid size-9 cursor-pointer place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent md:hidden"
        >
          <Search className="size-4" />
        </button>

        <LiveBadge className="hidden md:inline-flex" label="En vivo" />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative grid size-9 cursor-pointer place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">Notificaciones</p>
              <button className="cursor-pointer text-xs text-nuclear hover:underline">Marcar leídas</button>
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
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card pl-1 pr-2 py-1 transition-colors hover:bg-accent">
            <Avatar className="size-7">
              <AvatarFallback className="bg-nuclear/15 text-xs font-semibold text-nuclear">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user ? `${user.firstName} ${user.lastName}` : "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "Sin sesión"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70 font-mono truncate">
                {currentOrgName}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })}>
              <User className="mr-2 size-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>
              <Settings className="mr-2 size-4" />
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 size-4" />
              Ayuda
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
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

function getUserInitials(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user) return "U";
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || user.email.charAt(0).toUpperCase();
}
