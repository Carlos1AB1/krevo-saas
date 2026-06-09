export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

export type CurrentUser = {
  email: string;
  id: string;
  isPlatformAdmin: boolean;
  name: string;
};

const TOKENS_STORAGE_KEY = "krevo.auth.tokens";
const USER_STORAGE_KEY = "krevo.auth.user";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredTokens(): AuthTokens | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(TOKENS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    window.localStorage.removeItem(TOKENS_STORAGE_KEY);
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKENS_STORAGE_KEY);
}

export function getStoredUser(): CurrentUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: CurrentUser) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function clearSessionStorage() {
  clearStoredTokens();
  clearStoredUser();
}

export function getAccessToken() {
  return getStoredTokens()?.accessToken ?? null;
}
