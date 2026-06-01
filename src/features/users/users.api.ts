import { authRequest } from "@/features/auth/authRequest";

export interface UserRoleRef {
  id: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  organizationId: string;
  roles: UserRoleRef[];
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

export function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Paginated<UserResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  return authRequest(`/users?${qs.toString()}`);
}

export function createUser(body: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds?: string[];
}): Promise<UserResponse> {
  return authRequest("/users", { method: "POST", body: JSON.stringify(body) });
}

export function updateUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
  return authRequest(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function updateUserRoles(id: string, roleIds: string[]): Promise<UserResponse> {
  return authRequest(`/users/${id}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roleIds }),
  });
}
