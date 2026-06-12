import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the organization logo URL to a browser-loadable path.
 * /uploads/* paths are not proxied by TanStack Start, so we route through
 * the API endpoint which goes through the working /api proxy.
 */
export function resolveOrganizationLogoSrc(
  orgId: string | undefined,
  logoUrl: string | null | undefined,
): string | null {
  if (!logoUrl || !orgId) return null;
  return `/api/v1/organizations/${orgId}/logo`;
}
