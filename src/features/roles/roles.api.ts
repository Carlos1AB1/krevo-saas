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

export function getRoles(): Promise<RoleResponse[]> {
  return authRequest("/roles");
}

export function createRole(body: {
  name: string;
  description?: string;
}): Promise<RoleResponse> {
  return authRequest("/roles", { method: "POST", body: JSON.stringify(body) });
}
