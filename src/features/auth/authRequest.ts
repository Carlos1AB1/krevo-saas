import { ApiError, apiRequest } from "@/lib/api";
import { refreshSession } from "./auth.api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  saveTokens,
} from "./auth.storage";

export async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let accessToken = getAccessToken();

  // Refresco proactivo: si el token ya expiró, lo renovamos antes de la
  // petición para evitar un 401 esperado en la consola.
  if (accessToken && isAccessTokenExpired() && getRefreshToken()) {
    try {
      const refreshed = await refreshSession();
      saveTokens(refreshed.accessToken, refreshed.refreshToken);
      accessToken = refreshed.accessToken;
    } catch {
      // Si el refresh falla aquí, dejamos que la petición original maneje el 401.
    }
  }

  try {
    return await apiRequest<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.statusCode !== 401) {
      throw error;
    }

    try {
      const refreshed = await refreshSession();

      saveTokens(refreshed.accessToken, refreshed.refreshToken);

      return await apiRequest<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    } catch (refreshError) {
      clearTokens();
      throw refreshError;
    }
  }
}
