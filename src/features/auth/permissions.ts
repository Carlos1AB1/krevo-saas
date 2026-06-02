export type Action = "create" | "read" | "update" | "delete" | "manage";
export type Subject =
  | "organizations"
  | "users"
  | "roles"
  | "permissions"
  | "inventory"
  | "production"
  | "logistics"
  | "audit";

/** manage:X implica cualquier acción sobre X */
export function can(permissions: string[], action: Action, subject: Subject): boolean {
  if (permissions.includes(`${action}:${subject}`)) return true;
  if (action !== "manage" && permissions.includes(`manage:${subject}`)) return true;
  return false;
}
