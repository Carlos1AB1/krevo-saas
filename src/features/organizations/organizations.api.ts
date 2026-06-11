import { authRequest } from "@/features/auth/authRequest";

export interface OrganizationResponse {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  logoUrl: string | null;
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
