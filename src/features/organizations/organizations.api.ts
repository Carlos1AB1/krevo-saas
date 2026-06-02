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

export function getOrganizations(): Promise<OrganizationResponse[]> {
  return authRequest<OrganizationResponse[]>("/organizations");
}
