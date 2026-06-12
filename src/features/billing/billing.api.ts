import { authRequest } from "@/features/auth/authRequest";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type BillingInterval = "MONTHLY" | "YEARLY";

export interface SaasPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  maxUsers: number | null;
  maxProducts: number | null;
  features: Record<string, unknown> | null;
  dLocalPlanToken: string | null;
  dLocalCountry: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  seats: number;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  plan: Pick<
    SaasPlan,
    | "id"
    | "code"
    | "name"
    | "priceCents"
    | "currency"
    | "billingInterval"
    | "maxUsers"
    | "maxProducts"
    | "features"
  >;
}

export interface CheckoutTokenResponse {
  redirectUrl: string;
  plan: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    billingInterval: string;
  };
}

// ─── API functions ─────────────────────────────────────────────────────────────

/** Obtiene la lista de planes de suscripción activos */
export function getPlans(): Promise<SaasPlan[]> {
  return authRequest<SaasPlan[]>("/billing/plans");
}

/** Obtiene el estado actual de suscripción de la organización del usuario */
export function getSubscription(): Promise<OrganizationSubscription | null> {
  return authRequest<OrganizationSubscription | null>("/billing/subscription");
}

/**
 * Crea un pago en dLocalGo y obtiene el merchant_checkout_token
 * necesario para inicializar SmartFields.
 */
export function createCheckoutToken(planId: string): Promise<CheckoutTokenResponse> {
  return authRequest<CheckoutTokenResponse>("/billing/create-checkout-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId }),
  });
}

/**
 * Sincroniza el estado del pago con dLocalGo de manera explícita
 */
export function syncPayment(): Promise<{ status: string }> {
  return authRequest<{ status: string }>("/billing/sync-payment", {
    method: "POST",
  });
}


