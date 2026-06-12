export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  permissions: string[];
  trialEndsAt?: string | null;
  subscriptionStatus?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  theme?: string | null;
  isPlatformAdmin?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}
