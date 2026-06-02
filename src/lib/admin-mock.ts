export type CompanyStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

export type SaaSPlan = {
  id: "basic" | "pro" | "enterprise";
  name: string;
  price: number | null;
  period: string;
  limits: {
    users: number | null;
    warehouses: number | null;
    transactions: number | null;
  };
  enabledModules: string[];
  tenantCount: number;
};

export type CompanyAccount = {
  id: string;
  name: string;
  nit: string;
  planId: SaaSPlan["id"];
  status: CompanyStatus;
  owner: {
    name: string;
    email: string;
  };
  usage: {
    users: number;
    usersLimit: number | null;
    warehouses: number;
    warehousesLimit: number | null;
    transactions: number;
    transactionsLimit: number | null;
  };
  mrr: number;
  nextBillingDate: string | null;
  lastActivity: string;
  createdAt: string;
  region: string;
};

export type GlobalAuditEvent = {
  id: string;
  actor: string;
  action: string;
  company: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
};

export type InvoiceRecord = {
  id: string;
  company: string;
  plan: string;
  amount: number;
  status: "paid" | "failed" | "pending";
  date: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Owner SaaS" | "Operaciones" | "Finanzas" | "Soporte técnico";
  status: "active" | "invited" | "blocked";
  lastActive: string;
};

export const saasPlans: SaaSPlan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 149000,
    period: "mes",
    limits: { users: 3, warehouses: 1, transactions: 10000 },
    enabledModules: ["Kárdex", "FEFO/FIFO", "Recepciones", "Despachos"],
    tenantCount: 6,
  },
  {
    id: "pro",
    name: "Pro",
    price: 449000,
    period: "mes",
    limits: { users: 25, warehouses: 5, transactions: 100000 },
    enabledModules: ["Todo Básico", "ABC/Pareto", "ROP dinámico", "PWA operario"],
    tenantCount: 11,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "contrato",
    limits: { users: null, warehouses: null, transactions: null },
    enabledModules: ["Todo Pro", "SSO/SAML", "SLA dedicado", "Onboarding asistido"],
    tenantCount: 3,
  },
];

export const companies: CompanyAccount[] = [
  {
    id: "tenant_001",
    name: "Cafequipe S.A.S.",
    nit: "890.000.000-1",
    planId: "pro",
    status: "active",
    owner: { name: "Valentina Aristizábal", email: "valentina@cafequipe.com.co" },
    usage: {
      users: 18,
      usersLimit: 25,
      warehouses: 3,
      warehousesLimit: 5,
      transactions: 45000,
      transactionsLimit: 100000,
    },
    mrr: 449000,
    nextBillingDate: "2026-06-12",
    lastActivity: "Hace 5 min",
    createdAt: "2026-03-14",
    region: "Quindío",
  },
  {
    id: "tenant_002",
    name: "Distribuidora Andina",
    nit: "901.223.490-7",
    planId: "enterprise",
    status: "active",
    owner: { name: "Carlos Gómez", email: "carlos@andina.co" },
    usage: {
      users: 64,
      usersLimit: null,
      warehouses: 12,
      warehousesLimit: null,
      transactions: 312000,
      transactionsLimit: null,
    },
    mrr: 1200000,
    nextBillingDate: "2026-06-20",
    lastActivity: "Hace 2 min",
    createdAt: "2026-01-19",
    region: "Cundinamarca",
  },
  {
    id: "tenant_003",
    name: "FarmaLogística SAS",
    nit: "900.771.882-3",
    planId: "pro",
    status: "past_due",
    owner: { name: "Diana Ruiz", email: "diana@farmalogistica.co" },
    usage: {
      users: 24,
      usersLimit: 25,
      warehouses: 5,
      warehousesLimit: 5,
      transactions: 93000,
      transactionsLimit: 100000,
    },
    mrr: 449000,
    nextBillingDate: "2026-06-01",
    lastActivity: "Hace 1 h",
    createdAt: "2026-02-02",
    region: "Antioquia",
  },
  {
    id: "tenant_004",
    name: "Supermercados Norte",
    nit: "805.441.220-9",
    planId: "basic",
    status: "trial",
    owner: { name: "Manuel Rivas", email: "manuel@supernorte.com" },
    usage: {
      users: 2,
      usersLimit: 3,
      warehouses: 1,
      warehousesLimit: 1,
      transactions: 1600,
      transactionsLimit: 10000,
    },
    mrr: 0,
    nextBillingDate: "2026-06-16",
    lastActivity: "Hoy 08:40",
    createdAt: "2026-05-29",
    region: "Valle del Cauca",
  },
  {
    id: "tenant_005",
    name: "Frigoríficos del Norte",
    nit: "811.002.331-5",
    planId: "basic",
    status: "suspended",
    owner: { name: "Laura Méndez", email: "laura@frionorte.co" },
    usage: {
      users: 4,
      usersLimit: 3,
      warehouses: 1,
      warehousesLimit: 1,
      transactions: 9800,
      transactionsLimit: 10000,
    },
    mrr: 149000,
    nextBillingDate: null,
    lastActivity: "31 May, 2026",
    createdAt: "2026-04-04",
    region: "Atlántico",
  },
];

export const invoices: InvoiceRecord[] = [
  {
    id: "INV-2026-0601",
    company: "Cafequipe S.A.S.",
    plan: "Pro",
    amount: 449000,
    status: "paid",
    date: "2026-06-01",
  },
  {
    id: "INV-2026-0602",
    company: "FarmaLogística SAS",
    plan: "Pro",
    amount: 449000,
    status: "failed",
    date: "2026-06-01",
  },
  {
    id: "INV-2026-0603",
    company: "Distribuidora Andina",
    plan: "Enterprise",
    amount: 1200000,
    status: "pending",
    date: "2026-06-02",
  },
  {
    id: "INV-2026-0529",
    company: "Frigoríficos del Norte",
    plan: "Básico",
    amount: 149000,
    status: "failed",
    date: "2026-05-29",
  },
];

export const globalAuditEvents: GlobalAuditEvent[] = [
  {
    id: "aud_001",
    actor: "Sistema de cobros",
    action: "Marcó renovación como fallida",
    company: "FarmaLogística SAS",
    severity: "critical",
    timestamp: "Hoy 09:15",
  },
  {
    id: "aud_002",
    actor: "Sebastián Ordóñez",
    action: "Actualizó límites del plan Pro",
    company: "Todas las empresas Pro",
    severity: "warning",
    timestamp: "Ayer 16:22",
  },
  {
    id: "aud_003",
    actor: "Sistema IAM",
    action: "Bloqueó intento de acceso trans-tenant",
    company: "Distribuidora Andina",
    severity: "critical",
    timestamp: "Ayer 10:04",
  },
  {
    id: "aud_004",
    actor: "Carlos Barón",
    action: "Reactivó cuenta suspendida",
    company: "Supermercados Norte",
    severity: "info",
    timestamp: "30 May, 2026",
  },
];

export const adminUsers: AdminUser[] = [
  {
    id: "adm_001",
    name: "Sebastián Ordóñez",
    email: "sebastian@krevo.co",
    role: "Owner SaaS",
    status: "active",
    lastActive: "Hace 3 min",
  },
  {
    id: "adm_002",
    name: "Carlos Arturo Barón",
    email: "carlos@krevo.co",
    role: "Operaciones",
    status: "active",
    lastActive: "Hace 18 min",
  },
  {
    id: "adm_003",
    name: "Jerónimo Rodríguez",
    email: "jeronimo.r@krevo.co",
    role: "Soporte técnico",
    status: "invited",
    lastActive: "Invitación pendiente",
  },
  {
    id: "adm_004",
    name: "Jerónimo Vallejo",
    email: "jeronimo.v@krevo.co",
    role: "Finanzas",
    status: "active",
    lastActive: "Ayer 17:45",
  },
];

export function formatCop(value: number) {
  return value.toLocaleString("es-CO");
}

export function getPlanName(planId: SaaSPlan["id"]) {
  return saasPlans.find((plan) => plan.id === planId)?.name ?? planId;
}

export function usagePercent(current: number, limit: number | null) {
  if (!limit) return 68;
  return Math.min(100, Math.round((current / limit) * 100));
}
