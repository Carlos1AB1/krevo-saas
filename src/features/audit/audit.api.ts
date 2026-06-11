import { getAccessToken } from "@/features/auth/auth.storage";
import { authRequest } from "@/features/auth/authRequest";

export type AuditSeverity = "INFO" | "UPDATE" | "DELETE" | "SECURITY";

export type AuditModule =
  | "inventory"
  | "logistics"
  | "production"
  | "organizations"
  | "users"
  | "roles"
  | "auth";

export const AUDIT_ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "auth.login.succeeded", label: "Login exitoso" },
  { value: "auth.login.failed", label: "Login fallido" },
  { value: "inventory.product.updated", label: "Producto actualizado" },
  { value: "inventory.category.deleted", label: "Categoría eliminada" },
  { value: "logistics.receipt.approved", label: "Recepción aprobada" },
  { value: "logistics.receipt.rejected", label: "Recepción rechazada" },
  { value: "organization.updated", label: "Organización actualizada" },
];

export const AUDIT_MODULE_OPTIONS: { value: AuditModule; label: string }[] = [
  { value: "inventory", label: "Inventario" },
  { value: "logistics", label: "Logística" },
  { value: "production", label: "Producción" },
  { value: "organizations", label: "Organización" },
  { value: "users", label: "Usuarios" },
  { value: "roles", label: "Roles y permisos" },
  { value: "auth", label: "Seguridad / acceso" },
];

export interface AuditChangeField {
  field: string;
  label: string;
  before: string | null;
  after: string | null;
}

export interface AuditLogResponse {
  id: string;
  action: string;
  severity: AuditSeverity;
  module: AuditModule | null;
  userId: string | null;
  organizationId: string;
  ipAddress: string | null;
  entityType: string | null;
  entityId: string | null;
  entityLabel: string | null;
  summary: string | null;
  observation: string | null;
  recordCreatorId: string | null;
  recordCreatorName: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorDocumentId: string | null;
  actorRoles: string | null;
  relatedActorName: string | null;
  relatedActorRoleLabel: string | null;
  relatedActorDocumentId: string | null;
  changes: AuditChangeField[] | null;
  createdAt: string;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  module?: AuditModule;
  action?: string;
  userId?: string;
  severity?: AuditSeverity;
  from?: string;
  to?: string;
}

export function getAuditLogs(params?: AuditLogsParams): Promise<{
  data: AuditLogResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.module) qs.set("module", params.module);
  if (params?.action) qs.set("action", params.action);
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.severity) qs.set("severity", params.severity);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  return authRequest(`/audit/logs?${qs.toString()}`);
}

export type AuditExportFormat = "xlsx" | "pdf";

export interface AuditExportParams extends Omit<AuditLogsParams, "page" | "limit"> {
  format: AuditExportFormat;
}

export async function exportAuditLogs(params: AuditExportParams): Promise<Blob> {
  const qs = new URLSearchParams();
  qs.set("format", params.format);
  if (params.module) qs.set("module", params.module);
  if (params.action) qs.set("action", params.action);
  if (params.userId) qs.set("userId", params.userId);
  if (params.severity) qs.set("severity", params.severity);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const token = getAccessToken();
  const base = import.meta.env.VITE_API_URL as string;
  const res = await fetch(`${base}/audit/logs/export?${qs.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("No se pudo exportar la auditoría");
  }
  return res.blob();
}
