import { apiFetch, apiRequest } from "@/lib/api";

export interface ContactRequestInput {
  fullName: string;
  email: string;
  companyName?: string;
  message: string;
  source?: string;
  turnstileToken: string;
}

export interface ContactRequestResponse {
  id: string;
  fullName: string;
  email: string;
  companyName: string | null;
  message: string;
  source: string | null;
  status: "PENDING" | "CONTACTED";
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequestListResponse {
  data: ContactRequestResponse[];
  total: number;
}

export function submitContactRequest(input: ContactRequestInput): Promise<ContactRequestResponse> {
  return apiRequest<ContactRequestResponse>("/contact-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchContactRequests(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ContactRequestListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch<ContactRequestListResponse>(`/contact-requests${qs ? `?${qs}` : ""}`);
}

export function updateContactRequestStatus(
  id: string,
  status: "PENDING" | "CONTACTED",
): Promise<ContactRequestResponse> {
  return apiFetch<ContactRequestResponse>(`/contact-requests/${id}`, {
    body: { status },
    method: "PATCH",
  });
}

export function replyToContactRequest(
  id: string,
  input: { subject: string; body: string },
): Promise<void> {
  return apiFetch<void>(`/contact-requests/${id}/reply`, {
    body: input,
    method: "POST",
  });
}
