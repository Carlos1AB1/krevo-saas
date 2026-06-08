import { apiFetch } from "@/lib/api";
import type { CompanyStatus } from "@/lib/admin-mock";

export type AdminOverview = {
  criticalEvents: number;
  failedPayments: number;
  immediateRisks: Array<{
    action: string;
    actor: string;
    company: string;
    id: string;
    timestamp: string;
  }>;
  monthlyRevenue: number;
  planDistribution: Array<{
    id: string;
    name: string;
    period: string;
    price: number | null;
    tenantCount: number;
  }>;
  recentCompanies: Array<{
    id: string;
    lastActivity: string;
    mrr: number;
    name: string;
    planName: string;
    region: string;
    status: CompanyStatus;
  }>;
  topUsage: Array<{
    id: string;
    name: string;
    planName: string;
    transactionUsagePercent: number;
  }>;
  totalCompanies: number;
  activeCompanies: number;
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
export type AdminBillingRecord = Record<string, unknown>;
export type AdminAuditRecord = Record<string, unknown>;
export type AdminHealth = Record<string, unknown>;
export type AdminUserRecord = Record<string, unknown>;

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
    return apiFetch<AdminAuditRecord[]>("/admin/audit", { method: "GET" });
  },
  getBilling() {
    return apiFetch<AdminBillingRecord[]>("/admin/billing", { method: "GET" });
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
