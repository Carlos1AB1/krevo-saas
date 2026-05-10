import { createFileRoute } from "@tanstack/react-router";
import { Truck, Plus, Search, Filter, Mail, Phone, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/suppliers")({
  head: () => ({
    meta: [{ title: "Proveedores · Krevo" }],
  }),
  component: SuppliersPage,
});

const mockSuppliers = [
  {
    id: "SUP-MILK-01",
    name: "Lácteos del Quindío S.A.",
    category: "Lácteos e Insumos",
    contact: "Roberto Castaño",
    email: "pedidos@lacteosquindio.com.co",
    phone: "+57 315 123 4567",
    status: "active",
    leadTime: "1 día",
  },
  {
    id: "SUP-COF-02",
    name: "Fincas Cafeteras Unidas",
    category: "Materia Prima (Café)",
    contact: "Héctor Jaramillo",
    email: "ventas@fincascafeteras.com",
    phone: "+57 311 987 6543",
    status: "active",
    leadTime: "3 días",
  },
  {
    id: "SUP-PACK-03",
    name: "Empaques Artesanales Eje",
    category: "Embalaje y Guascas",
    contact: "María Teresa Soto",
    email: "contacto@empaqueseje.com",
    phone: "+57 301 555 1234",
    status: "inactive",
    leadTime: "4 días",
  },
  {
    id: "SUP-SUG-04",
    name: "Ingenio Providencia",
    category: "Azúcar y Endulzantes",
    contact: "Camilo Fernández",
    email: "c.fernandez@ingenioprovidencia.com",
    phone: "+57 320 444 8888",
    status: "active",
    leadTime: "2 días",
  },
];

function SuppliersPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Directorio de proveedores y transportistas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 size-4" />
            <span>Filtros</span>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            <span>Añadir Proveedor</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Label htmlFor="search-suppliers" className="sr-only">
                Buscar proveedor por nombre, ID o email
              </Label>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-suppliers"
                placeholder="Buscar proveedor por nombre, ID o email..."
                className="pl-9 h-10 bg-card shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mockSuppliers.map((sup) => (
              <div
                key={sup.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-nuclear/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-nuclear/10 text-nuclear">
                      <Factory className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold leading-none text-foreground">{sup.name}</h2>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{sup.id}</span>
                        <span>•</span>
                        <span>{sup.category}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sup.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {sup.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="mr-2 size-4" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 size-4" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="mr-2 size-4" />
                    <span>Lead time: {sup.leadTime}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="w-full text-xs" size="sm">
                    Ver Catálogo
                  </Button>
                  <Button variant="default" className="w-full text-xs" size="sm">
                    Generar OC
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
