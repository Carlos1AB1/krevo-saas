import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getMe, login, logout, refreshSession, register, type RegisterInput } from "./auth.api";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth.storage";
import type { AuthUser } from "./auth.types";

interface AuthSession {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (input: RegisterInput) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  reloadSession: () => Promise<void>;
  clearError: () => void;
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
        const refreshedUser = await getMe(refreshed.accessToken);
        setUser(refreshedUser);
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

  async function registerUser(input: RegisterInput): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await register(input);
      saveTokens(tokens.accessToken, tokens.refreshToken);
      const newUser = await getMe(tokens.accessToken);
      setUser(newUser);
      return true;
    } catch (err) {
      clearTokens();
      setUser(null);
      setError(getFriendlyError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    isLoading,
    error,
    loginUser,
    registerUser,
    logoutUser,
    reloadSession,
    clearError: () => setError(null),
  };
}

const BACKEND_ERROR_MAP: Record<string, string> = {
  "Invalid credentials.": "Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
  "Invalid token.": "Tu sesión ha expirado. Inicia sesión de nuevo.",
  "Invalid tenant context.": "Error en el contexto de sesión. Inicia sesión de nuevo.",
  "Invalid refresh token.": "Tu sesión ha expirado. Inicia sesión de nuevo.",
  "Refresh token expired.": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
  "User not found.": "No existe una cuenta con ese email.",
  "User is inactive.": "Tu cuenta está desactivada. Contacta al administrador.",
  "Organization not found.": "La organización no fue encontrada. Contacta al administrador.",
  "User email already exists.": "Ya existe una cuenta con ese email. Intenta iniciar sesión.",
  "Organization slug already exists.": "Ya existe una organización con ese nombre. Prueba con otro.",
};

function getFriendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    const raw = Array.isArray(error.details)
      ? (error.details[0] ?? "")
      : error.details;

    if (BACKEND_ERROR_MAP[raw]) return BACKEND_ERROR_MAP[raw];

    if (error.statusCode === 429)
      return "Demasiados intentos fallidos. Espera un momento antes de intentar de nuevo.";
    if (error.statusCode >= 500)
      return "Error interno del servidor. Intenta de nuevo en unos minutos.";
    if (error.statusCode === 401)
      return "No autorizado. Verifica tus credenciales e intenta de nuevo.";

    return raw || "Ocurrió un error inesperado. Intenta de nuevo.";
  }

  if (error instanceof TypeError && error.message.includes("fetch"))
    return "Sin conexión con el servidor. Verifica tu red e intenta de nuevo.";

  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
