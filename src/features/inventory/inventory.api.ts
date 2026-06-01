import { authRequest } from "@/features/auth/authRequest";

export interface LotProductRef {
  id: string;
  sku: string;
  name: string;
}

export interface LotLocationRef {
  id: string;
  code: string;
}

export interface LotResponse {
  id: string;
  lotNumber: string;
  status: "ACTIVE" | "DEPLETED" | "QUARANTINE" | "EXPIRED";
  quantity: number;
  productionDate: string | null;
  expirationDate: string | null;
  supplierRef: string | null;
  notes: string | null;
  organizationId: string;
  productId: string;
  product: LotProductRef;
  storageLocationId: string | null;
  storageLocation: LotLocationRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface MovementProductRef {
  id: string;
  sku: string;
  name: string;
}

export interface MovementLotRef {
  id: string;
  lotNumber: string;
}

export interface MovementUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface MovementResponse {
  id: string;
  type: "RECEIPT" | "DISPATCH" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  stockAfter: number;
  reference: string | null;
  notes: string | null;
  organizationId: string;
  productId: string;
  product: MovementProductRef;
  lotId: string | null;
  lot: MovementLotRef | null;
  createdById: string;
  createdBy: MovementUserRef;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LotsParams {
  page?: number;
  limit?: number;
  status?: string;
  productId?: string;
}

export interface MovementsParams {
  page?: number;
  limit?: number;
  type?: string;
  productId?: string;
  from?: string;
  to?: string;
}

export function getLots(params?: LotsParams): Promise<Paginated<LotResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  if (params?.productId) qs.set("productId", params.productId);
  return authRequest(`/inventory/lots?${qs.toString()}`);
}

export function getMovements(params?: MovementsParams): Promise<Paginated<MovementResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.type) qs.set("type", params.type);
  if (params?.productId) qs.set("productId", params.productId);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  return authRequest(`/inventory/movements?${qs.toString()}`);
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: "KG" | "L" | "UN" | "G" | "ML" | "BOX";
  abcClass: "A" | "B" | "C";
  minStock: number;
  maxStock: number | null;
  isPerishable: boolean;
  isActive: boolean;
  organizationId: string;
  categoryId: string;
  category: ProductCategoryRef;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export function getProducts(params?: ProductsParams): Promise<Paginated<ProductResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.categoryId) qs.set("categoryId", params.categoryId);
  if (params?.search) qs.set("search", params.search);
  return authRequest(`/inventory/products?${qs.toString()}`);
}

export function createProduct(body: {
  sku: string;
  name: string;
  description?: string;
  unit: string;
  categoryId: string;
  minStock?: number;
  isPerishable?: boolean;
}): Promise<ProductResponse> {
  return authRequest("/inventory/products", { method: "POST", body: JSON.stringify(body) });
}

// ── Storage Locations (Bodegas) ───────────────────────────────────────────────

export interface StorageLocationResponse {
  id: string;
  warehouse: "BODEGA_3" | "BODEGA_4" | "BODEGA_12";
  zone: "A" | "B" | "C" | "D";
  code: string;
  description: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export function getStorageLocations(): Promise<StorageLocationResponse[]> {
  return authRequest("/inventory/locations");
}

export function createStorageLocation(body: {
  warehouse: string;
  zone: string;
  code: string;
  description?: string;
}): Promise<StorageLocationResponse> {
  return authRequest("/inventory/locations", { method: "POST", body: JSON.stringify(body) });
}

export function getCategories(): Promise<{ id: string; name: string; description: string | null }[]> {
  return authRequest("/inventory/categories");
}

export function createCategory(body: {
  name: string;
  description?: string;
}): Promise<{ id: string; name: string; description: string | null }> {
  return authRequest("/inventory/categories", { method: "POST", body: JSON.stringify(body) });
}

export function createLot(body: {
  lotNumber: string;
  productId: string;
  quantity: number;
  expirationDate?: string;
  productionDate?: string;
  notes?: string;
}): Promise<LotResponse> {
  return authRequest("/inventory/lots", { method: "POST", body: JSON.stringify(body) });
}
