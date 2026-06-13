import { authRequest } from "@/features/auth/authRequest";

export interface OrganizationResponse {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  theme: string | null;
  isActive: boolean;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  slug?: string;
  name?: string;
  legalName?: string;
  taxId?: string;
  logoUrl?: string;
  primaryColor?: string;
  theme?: string;
  isActive?: boolean;
  currency?: string;
  timezone?: string;
}

export function getOrganizations(): Promise<OrganizationResponse[]> {
  return authRequest<OrganizationResponse[]>("/organizations");
}

export function getOrganization(id: string): Promise<OrganizationResponse> {
  return authRequest<OrganizationResponse>(`/organizations/${id}`);
}

export function updateOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationResponse> {
  return authRequest<OrganizationResponse>(`/organizations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function uploadOrganizationLogo(
  id: string,
  file: File,
): Promise<OrganizationResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return authRequest<OrganizationResponse>(`/organizations/${id}/logo`, {
    method: "POST",
    body: formData,
    // Do not set Content-Type header to let browser set boundary automatically
    headers: {
      "Accept": "application/json",
    },
  });
}
