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
  id: string;
  lastActivity: string;
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
  region: string;
  status: CompanyStatus;
  usage: {
    transactions: number;
    transactionsLimit: number | null;
    users: number;
    usersLimit: number | null;
    warehouses: number;
    warehousesLimit: number | null;
  };
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
    return apiFetch<AdminCompany[]>("/admin/companies", { method: "GET" });
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
