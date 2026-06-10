import { authRequest } from "@/features/auth/authRequest";

export interface PermissionResponse {
  id: string;
  action: string;
  subject: string;
  code: string;
  description?: string | null;
  createdAt: string;
}

/** Global permission catalog (action:subject) exposed by the backend. */
export function getPermissions(): Promise<PermissionResponse[]> {
  return authRequest("/permissions");
}

export interface PermissionModule {
  subject: string;
  label: string;
  permissions: PermissionResponse[];
}

const SUBJECT_LABELS: Record<string, string> = {
  organizations: "Organización",
  users: "Usuarios",
  roles: "Roles",
  permissions: "Permisos",
  inventory: "Inventario",
  production: "Producción",
  logistics: "Logística",
  audit: "Auditoría",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Crear",
  read: "Leer",
  update: "Actualizar",
  delete: "Eliminar",
  manage: "Gestionar (todo)",
};

const ACTION_ORDER = ["read", "create", "update", "delete", "manage"];

export function subjectLabel(subject: string): string {
  return SUBJECT_LABELS[subject] ?? subject;
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

/** Groups a flat permission list into modules (by subject) for matrix/selector UIs. */
export function groupByModule(perms: PermissionResponse[]): PermissionModule[] {
  const map = new Map<string, PermissionResponse[]>();

  for (const permission of perms) {
    const bucket = map.get(permission.subject) ?? [];
    bucket.push(permission);
    map.set(permission.subject, bucket);
  }

  return [...map.entries()]
    .map(([subject, permissions]) => ({
      subject,
      label: subjectLabel(subject),
      permissions: permissions.sort(
        (a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
