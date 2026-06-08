import { getAccessToken } from "@/lib/session";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "http://localhost:3100";

export class ApiError extends Error {
  data?: unknown;
  status: number;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function apiUrl(path: string) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
  };

  if (requestInit.body && typeof requestInit.body !== "string") {
    requestInit.body = JSON.stringify(requestInit.body);
  }

  const response = await fetch(apiUrl(path), requestInit);
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(readableApiErrorMessage(response.status, payload), response.status, payload);
  }

  return payload as T;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function readableApiErrorMessage(status: number, payload: unknown) {
  const messageFromPayload =
    typeof payload === "string"
      ? payload
      : typeof payload === "object" && payload !== null
        ? [
            Reflect.get(payload, "message"),
            Reflect.get(payload, "error"),
            Reflect.get(payload, "detail"),
          ].find((value) => typeof value === "string" && value.trim().length > 0)
        : null;

  if (typeof messageFromPayload === "string") {
    return messageFromPayload;
  }

  switch (status) {
    case 400:
      return "La solicitud al backend es inválida.";
    case 401:
      return "Tu sesión no es válida o expiró. Inicia sesión de nuevo.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no existe en el backend.";
    case 409:
      return "El backend reportó un conflicto con la operación solicitada.";
    case 422:
      return "El backend rechazó los datos enviados.";
    case 500:
      return "El backend tuvo un error interno.";
    default:
      return `La solicitud falló con estado ${status}.`;
  }
}
