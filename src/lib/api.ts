import { getAccessToken } from "@/lib/session";

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
    return "/api/v1";
  }

  throw new Error("Missing VITE_API_URL environment variable.");
}

export const API_BASE_URL = resolveApiBaseUrl();

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export class ApiError extends Error {
  data?: unknown;
  details: string | string[];
  status: number;
  statusCode: number;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusCode = status;
    this.data = data;
    this.details = readApiErrorDetails(data) ?? message;
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
          ].find(
            (value) =>
              (typeof value === "string" && value.trim().length > 0) ||
              (Array.isArray(value) && value.length > 0),
          )
        : null;

  if (typeof messageFromPayload === "string") {
    return messageFromPayload;
  }

  if (Array.isArray(messageFromPayload)) {
    return messageFromPayload.filter((item) => typeof item === "string").join(" ");
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

function readApiErrorDetails(payload: unknown): string | string[] | null {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = Reflect.get(payload, "message");
    if (typeof message === "string" || Array.isArray(message)) {
      return message;
    }
  }

  if (typeof payload === "string") {
    return payload;
  }

  return null;
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

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse = {
      statusCode: response.status,
      message: "No fue posible completar la operación.",
    };

    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // El backend no respondió JSON.
    }

    const rawMessage = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : errorBody.message;

    const message = translateErrorMessage(rawMessage, errorBody.statusCode);

    throw new ApiError(message, errorBody.statusCode, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function translateErrorMessage(rawMessage: string, status: number): string {
  if (!rawMessage) return "No fue posible completar la operación.";

  const msgMap: Record<string, string> = {
    // Auth & Users
    "Invalid credentials.": "Correo o contraseña incorrectos.",
    "User email already exists.": "Este correo ya está registrado en la plataforma.",
    "User not found.": "Usuario no encontrado.",
    "Invalid token.": "Tu sesión ha expirado. Inicia sesión de nuevo.",
    "Captcha verification token is required.": "Completa la verificación de seguridad.",
    "Captcha verification token is invalid.": "La verificación de seguridad no es válida.",
    "Captcha verification failed. Please try again.":
      "No pudimos validar la verificación de seguridad. Intenta de nuevo.",
    "Captcha verification action mismatch. Please try again.":
      "La verificación de seguridad no coincide con esta acción. Intenta de nuevo.",
    "Captcha verification service is unavailable.":
      "La verificación de seguridad no está disponible. Intenta de nuevo en unos minutos.",

    // Inventory
    "Product SKU already exists in this tenant.": "Ya existe un producto con este SKU.",
    "Insufficient stock for this operation.": "No hay stock suficiente para esta operación.",
    "Insufficient stock to fulfill dispatch line.": "No hay stock suficiente para este despacho.",

    // Default Prisma Unique Constraint
    "Unique constraint failed on the fields: (`email`)": "El correo ingresado ya existe.",
  };

  if (msgMap[rawMessage]) return msgMap[rawMessage];

  if (rawMessage.includes("Unique constraint failed")) {
    return "Ya existe un registro con esta información en el sistema.";
  }

  if (status === 400 && rawMessage.includes("must be")) {
    return "Los datos ingresados no son válidos. Por favor verifica el formulario.";
  }

  return rawMessage;
}
