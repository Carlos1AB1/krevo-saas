import { apiRequest } from "@/lib/api";
import { getRefreshToken } from "./auth.storage";
import type { AuthTokensResponse, AuthUser, LoginInput, MessageResponse } from "./auth.types";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  orgName: string;
}

export interface TokensOnlyResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function login(input: LoginInput): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe(accessToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function refreshSession(): Promise<AuthTokensResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  return apiRequest<AuthTokensResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(accessToken: string, refreshToken?: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export function register(input: RegisterInput): Promise<TokensOnlyResponse> {
  return apiRequest<TokensOnlyResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function switchOrganization(
  accessToken: string,
  organizationId: string,
): Promise<TokensOnlyResponse> {
  return apiRequest<TokensOnlyResponse>("/auth/switch-organization", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ organizationId }),
  });
}

export interface GoogleTokenPayload {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
  purpose: "google_register";
  exp: number;
}

export function decodeGoogleTokenPayload(token: string): GoogleTokenPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    return JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/"))) as GoogleTokenPayload;
  } catch {
    return null;
  }
}

export interface GoogleRegisterInput {
  pendingGoogleToken: string;
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
}

export function registerWithGoogleToken(input: GoogleRegisterInput): Promise<TokensOnlyResponse> {
  return apiRequest<TokensOnlyResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
