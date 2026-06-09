import { getAccessToken } from "@/lib/session";

<<<<<<< HEAD
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "/api/v1";
=======
type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function resolveApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

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
>>>>>>> f698c07b86644b79163902570e94252aebca3537

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

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const { body, headers: optionHeaders, ...requestOptions } = options;
  const token = getAccessToken();
  const headers = new Headers(optionHeaders);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...requestOptions,
    body: serializeRequestBody(body, headers),
    headers,
  };

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

function serializeRequestBody(body: unknown, headers: Headers): RequestInit["body"] | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof FormData !== "undefined" && body instanceof FormData) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}
