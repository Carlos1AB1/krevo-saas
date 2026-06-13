import { apiFetch, ApiError } from "@/lib/api";
import {
  clearSessionStorage,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
  type AuthTokens,
  type CurrentUser,
} from "@/lib/session";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string | null;
  tokens?: AuthTokens;
  user?: CurrentUser;
};

let currentUserCache: CurrentUser | null = getStoredUser();

export async function login(payload: LoginPayload) {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    body: payload,
    method: "POST",
  });

  const tokens = extractTokens(response);

  if (!tokens?.accessToken) {
    throw new ApiError("El backend no devolvió un accessToken válido.", 500, response);
  }

  setStoredTokens(tokens);

  const user = response.user ?? (await getCurrentUser({ forceRefresh: true }));

  if (!user) {
    throw new ApiError("No fue posible obtener el usuario autenticado.", 500, response);
  }

  setCurrentUser(user);
  return user;
}

export async function getCurrentUser(options: { forceRefresh?: boolean } = {}) {
  if (!options.forceRefresh && currentUserCache) {
    return currentUserCache;
  }

  try {
    const user = await apiFetch<CurrentUser>("/auth/me", {
      method: "GET",
    });
    setCurrentUser(user);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      logout();
      return null;
    }

    if (currentUserCache) {
      return currentUserCache;
    }

    throw error;
  }
}

export function logout() {
  clearCurrentUserCache();
  clearSessionStorage();
}

export function setCurrentUser(user: CurrentUser) {
  currentUserCache = user;
  setStoredUser(user);
}

export function clearCurrentUserCache() {
  currentUserCache = null;
}

function extractTokens(response: LoginResponse) {
  if (response.tokens?.accessToken) {
    return response.tokens;
  }

  if (response.accessToken) {
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
    } satisfies AuthTokens;
  }

  return null;
}
