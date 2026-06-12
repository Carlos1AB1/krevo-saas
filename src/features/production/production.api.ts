import { authRequest } from "@/features/auth/authRequest";

export interface FormulaIngredient {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  notes: string | null;
}

export interface FormulaResponse {
  id: string;
  name: string;
  description: string | null;
  outputProductId: string;
  outputProductSku: string;
  outputProductName: string;
  outputQty: number;
  isActive: boolean;
  organizationId: string;
  ingredients: FormulaIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrderActor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ProductionOrderResponse {
  id: string;
  orderNumber: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  formulaId: string;
  formulaName: string;
  outputProductId: string;
  outputProductName: string;
  plannedQty: number;
  actualQty: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  organizationId: string;
  createdBy: ProductionOrderActor;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getFormulas(): Promise<FormulaResponse[]> {
  return authRequest("/production/formulas");
}

export function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<ProductionOrderResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  return authRequest(`/production/orders?${qs.toString()}`);
}

export interface CreateOrderInput {
  orderNumber: string;
  formulaId: string;
  plannedQty: number;
  scheduledAt?: string;
  notes?: string;
}

export function createOrder(input: CreateOrderInput): Promise<ProductionOrderResponse> {
  return authRequest("/production/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function startOrder(id: string): Promise<ProductionOrderResponse> {
  return authRequest(`/production/orders/${id}/start`, { method: "POST" });
}

export interface CompleteOrderInput {
  actualQty: number;
  outputLotId?: string;
  notes?: string;
}

export function completeOrder(id: string, input: CompleteOrderInput): Promise<ProductionOrderResponse> {
  return authRequest(`/production/orders/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelOrder(id: string): Promise<ProductionOrderResponse> {
  return authRequest(`/production/orders/${id}/cancel`, { method: "POST" });
}

export interface AdjustPickingInput {
  productId: string;
  lotId: string;
  quantityAdjusted: number;
  reason: string;
}

export function adjustPicking(id: string, input: AdjustPickingInput): Promise<ProductionOrderResponse> {
  return authRequest(`/production/orders/${id}/adjust-picking`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface CreateFormulaIngredientInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateFormulaInput {
  name: string;
  description?: string;
  outputProductId: string;
  outputQty: number;
  ingredients: CreateFormulaIngredientInput[];
}

export function createFormula(input: CreateFormulaInput): Promise<FormulaResponse> {
  return authRequest("/production/formulas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface UpdateFormulaInput {
  name?: string;
  description?: string;
  outputProductId?: string;
  outputQty?: number;
  ingredients?: CreateFormulaIngredientInput[];
}

export function updateFormula(id: string, input: UpdateFormulaInput): Promise<FormulaResponse> {
  return authRequest(`/production/formulas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deactivateFormula(id: string): Promise<FormulaResponse> {
  return authRequest(`/production/formulas/${id}/deactivate`, { method: "POST" });
}

export function deleteFormula(id: string): Promise<void> {
  return authRequest(`/production/formulas/${id}`, { method: "DELETE" });
}
