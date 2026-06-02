import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { Settings, User, Bell, Shield, Building, CreditCard, Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [{ title: "Ajustes · Krevo" }],
  }),
  component: () => (
    <RequirePermission action="manage" subject="organizations">
      <SettingsPage />
    </RequirePermission>
  ),
});

function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Ajustes</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Configuración del sistema y preferencias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">Guardar Cambios</Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20 flex xl:flex-row flex-col gap-6 items-start">
        <div className="w-full xl:max-w-xs space-y-1">
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-all">
              <Building className="size-4" />
              <span>Empresa</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <User className="size-4" />
              <span>Mi Perfil</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <Bell className="size-4" />
              <span>Notificaciones</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <Shield className="size-4" />
              <span>Seguridad</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <Blocks className="size-4" />
              <span>Integraciones</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
              <CreditCard className="size-4" />
              <span>Facturación</span>
            </button>
          </nav>
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <h3 className="font-semibold leading-none tracking-tight">Datos de la Empresa</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configura la información general de tu negocio para documentos y reportes.
              </p>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input id="companyName" defaultValue="Cafequipe S.A.S." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT / RUC</Label>
                  <Input id="nit" defaultValue="890.000.000-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input id="contactEmail" defaultValue="info@cafequipe.com.co" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" defaultValue="+57 317 6452651" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección Principal</Label>
                <Input id="address" defaultValue="Cra 12 No 9 - 59 Armenia, Quindío" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-destructive/20 bg-destructive/5 shadow-sm">
            <div className="p-5">
              <h3 className="font-semibold text-destructive">Zona de Peligro</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Opciones avanzadas y destructivas para tu cuenta.
              </p>
              <div className="mt-4">
                <Button variant="destructive" size="sm">
                  Borrar Cuenta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
