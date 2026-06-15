import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, UserCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { updateUserProfile, changePassword } from "@/features/users/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Mi perfil · Krevo" }] }),
  component: ProfilePage,
});

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function ProfilePage() {
  const { user, reloadSession } = useAuth();

  // — Info personal
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const isInfoDirty =
    firstName !== (user?.firstName ?? "") || lastName !== (user?.lastName ?? "");

  // — Contraseña
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isSavingPwd, setIsSavingPwd] = useState(false);

  const handleSaveInfo = async () => {
    if (!user?.id || !isInfoDirty) return;
    setIsSavingInfo(true);
    try {
      await updateUserProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await reloadSession();
      toast.success("Perfil actualizado");
    } catch {
      toast.error("No fue posible guardar los cambios.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;
    if (newPwd.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setIsSavingPwd(true);
    try {
      await changePassword(user.id, { currentPassword: currentPwd, newPassword: newPwd });
      toast.success("Contraseña actualizada correctamente.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      toast.error(msg ?? "No fue posible cambiar la contraseña.");
    } finally {
      setIsSavingPwd(false);
    }
  };

  const isPwdReady = currentPwd.length > 0 && newPwd.length >= 8 && confirmPwd.length > 0;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <UserCircle className="size-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Mi perfil</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">{user?.email}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto w-full max-w-lg space-y-6">

          {/* ── Información personal ─────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <h3 className="font-semibold leading-none tracking-tight">Información personal</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nombre que aparecerá en la plataforma y en los correos.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="bg-muted/40 cursor-default"
                />
                <p className="text-xs text-muted-foreground">
                  El correo no puede modificarse desde aquí.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!isInfoDirty || isSavingInfo}
                  onClick={handleSaveInfo}
                >
                  {isSavingInfo ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Guardando…
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Cambiar contraseña ───────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <h3 className="font-semibold leading-none tracking-tight">Cambiar contraseña</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mínimo 8 caracteres. Te recomendamos usar una combinación de letras, números y
                símbolos.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Contraseña actual</Label>
                <PasswordInput
                  id="currentPwd"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPwd">Nueva contraseña</Label>
                <PasswordInput
                  id="newPwd"
                  value={newPwd}
                  onChange={setNewPwd}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirmar nueva contraseña</Label>
                <PasswordInput
                  id="confirmPwd"
                  value={confirmPwd}
                  onChange={setConfirmPwd}
                  placeholder="Repite la nueva contraseña"
                />
                {confirmPwd.length > 0 && newPwd !== confirmPwd && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!isPwdReady || isSavingPwd}
                  onClick={handleChangePassword}
                >
                  {isSavingPwd ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Cambiando…
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Sesión ──────────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-5 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Organización:</span>{" "}
              {user?.organizationName}
            </p>
            <p className="mt-1">
              Roles: {user?.roles.join(", ") || "—"} · {user?.permissions.length} permisos activos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
