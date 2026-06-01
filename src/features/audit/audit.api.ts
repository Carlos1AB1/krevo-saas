import { authRequest } from "@/features/auth/authRequest";

export interface AuditLogResponse {
  id: string;
  action: string;
  userId: string | null;
  organizationId: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
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
  if (params?.action) qs.set("action", params.action);
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  return authRequest(`/audit/logs?${qs.toString()}`);
}
