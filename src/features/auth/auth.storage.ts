const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Lee el claim `exp` de un JWT sin validar la firma (solo para decisiones de UX
 * en el cliente, nunca para autorización).
 */
function getTokenExpiryMs(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Indica si el access token está expirado (o a punto de expirar dentro del
 * margen indicado). Si no se puede leer la expiración, devuelve `false` para
 * conservar el flujo de reintento por 401 existente.
 */
export function isAccessTokenExpired(skewSeconds = 30): boolean {
  const token = getAccessToken();
  if (!token) return true;

  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false;

  return Date.now() >= expiryMs - skewSeconds * 1000;
}
