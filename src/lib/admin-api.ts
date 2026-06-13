import { apiFetch } from "@/lib/api";
import type { CompanyStatus } from "@/lib/admin-mock";

export type AdminOverview = {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalUsers: number;
  activeUsers: number;
  platformAdminUsers: number;
  totalPlans: number;
  activePlans: number;
  billing: AdminBillingSnapshot;
  recentAudit: AdminAuditRecord[];
  generatedAt: string;
};

export type AdminBillingSnapshot = {
  monthlyRecurringRevenueCents: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  canceledSubscriptions: number;
};

export type AdminCompany = {
  currency?: string;
  id: string;
  lastActivity: string;
  legalName?: string | null;
  mrr: number;
  name: string;
  nextBillingDate: string | null;
  nit: string;
  owner: {
    email: string;
    name: string;
  };
  planId: string;
  planName: string;
  productsCount?: number;
  region: string;
  slug?: string;
  status: CompanyStatus;
  taxId?: string | null;
  usage: {
    transactions: number;
    transactionsLimit: number | null;
    users: number;
    usersLimit: number | null;
    warehouses: number;
    warehousesLimit: number | null;
  };
  usersCount?: number;
};

type BackendAdminCompany = {
  createdAt?: string;
  currency?: string;
  id: string;
  isActive: boolean;
  legalName: string | null;
  name: string;
  productsCount: number;
  slug: string;
  subscription: BackendAdminCompanySubscription | null;
  taxId: string | null;
  timezone?: string;
  updatedAt?: string;
  usersCount: number;
};

type BackendAdminCompanySubscription = {
  currentPeriodEnd: string | null;
  plan: BackendAdminCompanyPlan;
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  trialEndsAt: string | null;
};

type BackendAdminCompanyPlan = {
  id: string;
  maxProducts: number | null;
  maxUsers: number | null;
  name: string;
  priceCents: number;
};

export type AdminPlan = {
  enabledModules: string[];
  id: string;
  limits: {
    transactions: number | null;
    users: number | null;
    warehouses: number | null;
  };
  name: string;
  notes: string;
  period: string;
  price: number | null;
  recommended: boolean;
  status: "active" | "draft" | "legacy";
  tenantCount: number;
};

export type AdminSettings = Record<string, unknown>;

export type AdminBillingMetrics = Partial<AdminBillingSnapshot> & Record<string, unknown>;

export type AdminBillingSubscription = {
  id?: string;
  companyName?: string | null;
  planName?: string | null;
  status?: string | null;
} & Record<string, unknown>;

export type AdminBillingResponse = {
  metrics: AdminBillingMetrics;
  subscriptions: AdminBillingSubscription[];
  invoicesModeled: unknown;
};

export type AdminAuditRecord = {
  id?: string;
  actor?: string | null;
  action?: string | null;
  company?: string | null;
  severity?: "info" | "warning" | "critical" | string | null;
  timestamp?: string | null;
  createdAt?: string | null;
} & Record<string, unknown>;

export type AdminAuditResponse = {
  data: AdminAuditRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminHealth = Record<string, unknown>;
export type AdminUserRecord = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  status?: "active" | "invited" | "blocked" | string | null;
  lastActive?: string | null;
} & Record<string, unknown>;

export const adminApi = {
  createPlan(payload: Partial<AdminPlan>) {
    return apiFetch<AdminPlan>("/admin/plans", {
      body: payload,
      method: "POST",
    });
  },
  getAdminUsers() {
    return apiFetch<AdminUserRecord[]>("/admin/admin-users", { method: "GET" });
  },
  getAudit() {
    return apiFetch<AdminAuditResponse>("/admin/audit", { method: "GET" });
  },
  getBilling() {
    return apiFetch<AdminBillingResponse>("/admin/billing", { method: "GET" });
  },
  getCompanies() {
    return apiFetch<BackendAdminCompany[]>("/admin/companies", { method: "GET" }).then(
      (companies) => companies.map(toAdminCompany),
    );
  },
  getHealth() {
    return apiFetch<AdminHealth>("/admin/health", { method: "GET" });
  },
  getOverview() {
    return apiFetch<AdminOverview>("/admin/overview", { method: "GET" });
  },
  getPlans() {
    return apiFetch<AdminPlan[]>("/admin/plans", { method: "GET" });
  },
  getSettings() {
    return apiFetch<AdminSettings>("/admin/settings", { method: "GET" });
  },
  updatePlan(id: string, payload: Partial<AdminPlan>) {
    return apiFetch<AdminPlan>(`/admin/plans/${id}`, {
      body: payload,
      method: "PATCH",
    });
  },
  updateSettings(payload: Record<string, unknown>) {
    return apiFetch<AdminSettings>("/admin/settings", {
      body: payload,
      method: "PATCH",
    });
  },
};

function toAdminCompany(company: BackendAdminCompany): AdminCompany {
  const subscription = company.subscription;
  const plan = subscription?.plan;

  return {
    currency: company.currency,
    id: company.id,
    lastActivity: toDateLabel(company.updatedAt ?? company.createdAt) ?? "Sin actividad",
    legalName: company.legalName,
    mrr: centsToCop(plan?.priceCents),
    name: company.name,
    nextBillingDate: toDateLabel(subscription?.currentPeriodEnd ?? subscription?.trialEndsAt),
    nit: company.taxId ?? company.slug,
    owner: {
      email: "No disponible",
      name: "Sin administrador asignado",
    },
    planId: plan?.id ?? "",
    planName: plan?.name ?? "Sin plan",
    productsCount: company.productsCount,
    region: company.timezone ?? company.currency ?? "Sin región",
    slug: company.slug,
    status: toCompanyStatus(company),
    taxId: company.taxId,
    usage: {
      transactions: company.productsCount,
      transactionsLimit: plan?.maxProducts ?? null,
      users: company.usersCount,
      usersLimit: plan?.maxUsers ?? null,
      warehouses: 0,
      warehousesLimit: null,
    },
    usersCount: company.usersCount,
  };
}

function toCompanyStatus(company: BackendAdminCompany): CompanyStatus {
  if (!company.isActive) {
    return "suspended";
  }

  switch (company.subscription?.status) {
    case "ACTIVE":
      return "active";
    case "PAST_DUE":
      return "past_due";
    case "CANCELED":
    case "EXPIRED":
      return "cancelled";
    case "TRIALING":
    default:
      return "trial";
  }
}

function toDateLabel(value?: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

function centsToCop(value?: number): number {
  return value ? value / 100 : 0;
}
