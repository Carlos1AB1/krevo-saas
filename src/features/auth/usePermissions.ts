import { useAuth } from "./AuthProvider";
import { can, type Action, type Subject } from "./permissions";

export function usePermissions() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  return (action: Action, subject: Subject) => can(perms, action, subject);
}
