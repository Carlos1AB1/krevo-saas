import { authRequest } from "@/features/auth/authRequest";
import { apiRequest } from "@/lib/api";

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

export interface InvitationResponse {
  id: string;
  email: string;
  organizationId: string;
  invitedById: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  roleIds: string[];
}

export function inviteMember(body: { email: string; roleIds?: string[] }): Promise<InvitationResponse> {
  return authRequest("/users/invite", { method: "POST", body: JSON.stringify(body) });
}

export function getInvitationByToken(token: string): Promise<InvitationResponse> {
  return apiRequest<InvitationResponse>(`/users/invitations/${token}`);
}

export function acceptInvitation(
  token: string,
  body: { firstName: string; lastName: string; password: string },
): Promise<void> {
  return apiRequest<void>(`/users/invitations/${token}/accept`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateUserProfile(
  id: string,
  body: { firstName?: string; lastName?: string },
): Promise<UserResponse> {
  return authRequest(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function changePassword(
  id: string,
  body: { currentPassword: string; newPassword: string },
): Promise<void> {
  return authRequest(`/users/${id}/password`, { method: "PATCH", body: JSON.stringify(body) });
}
