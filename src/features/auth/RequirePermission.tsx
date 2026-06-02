import { Navigate } from "@tanstack/react-router";
import { useAuth } from "./AuthProvider";
import { can, type Action, type Subject } from "./permissions";

interface Props {
  action: Action;
  subject: Subject;
  children: React.ReactNode;
}

export function RequirePermission({ action, subject, children }: Props) {
  const { user } = useAuth();
  if (!user || !can(user.permissions, action, subject)) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
