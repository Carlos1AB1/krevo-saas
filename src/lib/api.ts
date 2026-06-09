function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function resolveApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    return normalizeApiBaseUrl(configuredUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3100/api/v1";
  }

  throw new Error("Missing VITE_API_URL environment variable.");
}

export const API_BASE_URL = resolveApiBaseUrl();

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
