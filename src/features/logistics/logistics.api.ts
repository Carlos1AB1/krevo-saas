import { authRequest } from "@/features/auth/authRequest";

export interface ReceiptActor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ReceiptLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  lotId: string | null;
  lotNumber: string | null;
  quantity: number;
  unitCost: number | null;
  notes: string | null;
  expirationDate: string | null;
  storageLocationId: string | null;
}

export interface ReceiptResponse {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  supplier: string | null;
  notes: string | null;
  receivedAt: string | null;
  approvedAt: string | null;
  organizationId: string;
  createdBy: ReceiptActor;
  approvedBy: ReceiptActor | null;
  lines: ReceiptLine[];
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

export function getReceipts(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<ReceiptResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  return authRequest(`/logistics/receipts?${qs.toString()}`);
}

export interface CreateReceiptLineInput {
  productId: string;
  quantity: number;
  lotId?: string;
  unitCost?: number;
  notes?: string;
  expirationDate?: string;
  storageLocationId?: string;
}

export interface CreateReceiptInput {
  supplier?: string;
  notes?: string;
  receivedAt?: string;
  lines: CreateReceiptLineInput[];
}

export function createReceipt(input: CreateReceiptInput): Promise<ReceiptResponse> {
  return authRequest("/logistics/receipts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function approveReceipt(id: string): Promise<ReceiptResponse> {
  return authRequest(`/logistics/receipts/${id}/approve`, { method: "POST" });
}

export function rejectReceipt(id: string, reason?: string): Promise<ReceiptResponse> {
  return authRequest(`/logistics/receipts/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ── Dispatches ────────────────────────────────────────────────────────────────

export interface DispatchLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  lotId: string | null;
  lotNumber: string | null;
  requestedQty: number;
  pickedQty: number;
  notes: string | null;
}

export interface DispatchResponse {
  id: string;
  status: "PENDING" | "PICKING" | "APPROVED" | "DISPATCHED";
  destination: string | null;
  notes: string | null;
  dispatchedAt: string | null;
  approvedAt: string | null;
  organizationId: string;
  createdBy: ReceiptActor;
  approvedBy: ReceiptActor | null;
  lines: DispatchLine[];
  createdAt: string;
  updatedAt: string;
}

export function getDispatches(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<DispatchResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  return authRequest(`/logistics/dispatches?${qs.toString()}`);
}

export function confirmPicking(id: string): Promise<DispatchResponse> {
  return authRequest(`/logistics/dispatches/${id}/picking`, { method: "POST" });
}

export function approveDispatch(id: string): Promise<DispatchResponse> {
  return authRequest(`/logistics/dispatches/${id}/approve`, { method: "POST" });
}

export interface CreateDispatchLineInput {
  productId: string;
  requestedQty: number;
  notes?: string;
}

export interface CreateDispatchInput {
  destination?: string;
  notes?: string;
  lines: CreateDispatchLineInput[];
}

export function createDispatch(input: CreateDispatchInput): Promise<DispatchResponse> {
  return authRequest("/logistics/dispatches", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
