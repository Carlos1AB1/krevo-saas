import { authRequest } from "@/features/auth/authRequest";

export interface RolePermission {
  action: string;
  subject: string;
  code: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  organizationId: string;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleInput {
  name?: string;
  description?: string;
  /** Permission codes (action:subject). Sending [] clears all permissions. */
  permissions?: string[];
}

export function getRoles(): Promise<RoleResponse[]> {
  return authRequest("/roles");
}

export function createRole(body: RoleInput & { name: string }): Promise<RoleResponse> {
  return authRequest("/roles", { method: "POST", body: JSON.stringify(body) });
}

export function updateRole(id: string, body: RoleInput): Promise<RoleResponse> {
  return authRequest(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function deleteRole(id: string): Promise<void> {
  return authRequest(`/roles/${id}`, { method: "DELETE" });
}
