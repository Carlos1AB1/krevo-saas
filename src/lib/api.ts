const API_URL = import.meta.env.VITE_API_URL;

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  details: string | string[];

  constructor(response: ApiErrorResponse) {
    const message = Array.isArray(response.message)
      ? response.message.join(", ")
      : response.message;

    super(message);

    this.name = "ApiError";
    this.statusCode = response.statusCode;
    this.details = response.message;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

    throw new ApiError(errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
