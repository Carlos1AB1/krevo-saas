import {
  Activity,
  Building2,
  CreditCard,
  Gauge,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Users2,
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  icon: typeof Gauge;
  badge?: string;
};

export const adminGroups: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Control SaaS",
    items: [
      { to: "/admin", label: "Dashboard", icon: Gauge },
      { to: "/admin/empresas", label: "Empresas", icon: Building2, badge: "5" },
      { to: "/admin/planes", label: "Planes", icon: SlidersHorizontal },
      { to: "/admin/facturacion", label: "Facturación", icon: CreditCard, badge: "2" },
    ],
  },
  {
    label: "Gobierno",
    items: [
      { to: "/admin/usuarios", label: "Usuarios", icon: Users2 },
      { to: "/admin/auditoria", label: "Auditoría", icon: ScrollText },
      { to: "/admin/salud", label: "Salud Plataforma", icon: Activity },
      { to: "/admin/configuracion", label: "Configuración", icon: Settings },
    ],
  },
];
