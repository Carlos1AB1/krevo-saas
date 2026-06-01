import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getMe, login, logout, refreshSession } from "./auth.api";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth.storage";
import type { AuthUser } from "./auth.types";

interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  reloadSession: () => Promise<void>;
}

export function useAuthSession(): AuthSession {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reloadSession(): Promise<void> {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getMe(accessToken);
      setUser(currentUser);
    } catch {
      try {
        const refreshed = await refreshSession();

        saveTokens(refreshed.accessToken, refreshed.refreshToken);
        setUser(refreshed.user);
      } catch {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loginUser(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({ email, password });

      saveTokens(response.accessToken, response.refreshToken);

      const currentUser = await getMe(response.accessToken);
      setUser(currentUser);

      return true;
    } catch (error) {
      clearTokens();
      setUser(null);
      setError(getFriendlyError(error));

      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function logoutUser(): Promise<void> {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    try {
      if (accessToken) {
        await logout(accessToken, refreshToken ?? undefined);
      }
    } catch {
      // Aunque falle el backend, la sesión local debe cerrarse.
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  useEffect(() => {
    void reloadSession();
  }, []);

  return {
    user,
    isLoading,
    error,
    loginUser,
    logoutUser,
    reloadSession,
  };
}

function getFriendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (Array.isArray(error.details)) {
      return error.details[0] ?? "Solicitud inválida.";
    }

    return error.details;
  }

  return "No fue posible completar la operación.";
}
