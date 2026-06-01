import { ApiError, apiRequest } from "@/lib/api";
import { refreshSession } from "./auth.api";
import { clearTokens, getAccessToken, saveTokens } from "./auth.storage";

export async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();

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
