import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Calendar, AlertTriangle, Snowflake, MapPin, Loader2, Package, Hash, Tag, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { getLots, createLot, getProducts, type LotResponse } from "@/features/inventory/inventory.api";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

type Bucket = "all" | "expired" | "7d" | "30d" | "90d" | "ok";

const buckets: { key: Bucket; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "7d", label: "≤ 7 días" },
  { key: "30d", label: "≤ 30 días" },
  { key: "90d", label: "≤ 90 días" },
  { key: "ok", label: "> 90 días" },
];

function daysToExpiry(expirationDate: string | null): number {
  if (!expirationDate) return 9999;
  return differenceInDays(parseISO(expirationDate), new Date());
}

function bucketOf(days: number): Exclude<Bucket, "all"> {
  if (days <= 0) return "expired";
  if (days <= 7) return "7d";
  if (days <= 30) return "30d";
  if (days <= 90) return "90d";
  return "ok";
}

const bucketCls: Record<Exclude<Bucket, "all">, string> = {
  expired: "bg-destructive text-destructive-foreground",
  "7d": "bg-destructive/15 text-destructive",
  "30d": "bg-warning/15 text-warning",
  "90d": "bg-info/15 text-info",
  ok: "bg-success/15 text-success",
};

export function StockLotsView() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [bucket, setBucket] = useState<Bucket>("all");
  const [selectedLot, setSelectedLot] = useState<LotResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newExpiration, setNewExpiration] = useState("");
  const [newProductionDate, setNewProductionDate] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "lots", { status: "ACTIVE", limit: 100 }],
    queryFn: () => getLots({ status: "ACTIVE", limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ["inventory", "products", { limit: 200 }],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const products = productsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: createLot,
    onSuccess: () => {
      toast.success("Lote creado correctamente");
      setCreateOpen(false);
      resetCreateForm();
      qc.invalidateQueries({ queryKey: ["inventory", "lots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetCreateForm() {
    setNewProductId("");
    setNewLotNumber("");
    setNewQuantity(1);
    setNewExpiration("");
    setNewProductionDate("");
  }

  function handleCreateLot() {
    if (!newProductId) { toast.error("Selecciona un producto"); return; }
    if (!newLotNumber.trim()) { toast.error("El número de lote es requerido"); return; }
    if (newQuantity <= 0) { toast.error("La cantidad debe ser mayor a 0"); return; }
    createMutation.mutate({
      productId: newProductId,
      lotNumber: newLotNumber.trim(),
      quantity: newQuantity,
      expirationDate: newExpiration || undefined,
      productionDate: newProductionDate || undefined,
    });
  }

  const lots = data?.data ?? [];

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return lots
      .filter((l) => {
        const days = daysToExpiry(l.expirationDate);
        if (bucket !== "all" && bucketOf(days) !== bucket) return false;
        if (!ql) return true;
        return (
          l.lotNumber.toLowerCase().includes(ql) ||
          l.product.sku.toLowerCase().includes(ql) ||
          l.product.name.toLowerCase().includes(ql) ||
          (l.storageLocation?.code ?? "").toLowerCase().includes(ql)
        );
      })
      .sort((a, b) => daysToExpiry(a.expirationDate) - daysToExpiry(b.expirationDate));
  }, [lots, q, bucket]);

  const counts = useMemo(() => {
    const map: Record<Exclude<Bucket, "all">, number> = { expired: 0, "7d": 0, "30d": 0, "90d": 0, ok: 0 };
    lots.forEach((l) => {
      map[bucketOf(daysToExpiry(l.expirationDate))]++;
    });
    return map;
  }, [lots]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inventario · Trazabilidad
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
            Stock & Lotes · FEFO
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Cargando…" : `${lots.length} lotes activos · Ordenados por fecha de vencimiento más cercana`}
          </p>
        </div>
        <Button variant="nuclear" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Nuevo Lote
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BucketCard tone="destructive" icon={AlertTriangle} label="Vencen ≤ 7 días" count={counts["7d"]} active={bucket === "7d"} onClick={() => setBucket(bucket === "7d" ? "all" : "7d")} />
        <BucketCard tone="warning" icon={Calendar} label="Vencen ≤ 30 días" count={counts["30d"]} active={bucket === "30d"} onClick={() => setBucket(bucket === "30d" ? "all" : "30d")} />
        <BucketCard tone="info" icon={Calendar} label="Vencen ≤ 90 días" count={counts["90d"]} active={bucket === "90d"} onClick={() => setBucket(bucket === "90d" ? "all" : "90d")} />
        <BucketCard tone="success" icon={Snowflake} label="Más de 90 días" count={counts.ok} active={bucket === "ok"} onClick={() => setBucket(bucket === "ok" ? "all" : "ok")} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lote, SKU, producto o ubicación…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1">
          {buckets.map((b) => (
            <button key={b.key} type="button" onClick={() => setBucket(b.key)}
              className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                bucket === b.key ? "border-nuclear bg-nuclear/10 text-nuclear" : "border-border bg-background text-muted-foreground hover:bg-accent")}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Cargando lotes…
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No fue posible cargar los lotes. Verifica que el servidor esté activo.
        </div>
      )}

      {!isLoading && !isError && (
        <ul className="space-y-2">
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Sin lotes en este rango.
            </li>
          ) : (
            filtered.map((l, i) => <LotRow key={l.id} lot={l} index={i} onDetail={() => setSelectedLot(l)} />)
          )}
        </ul>
      )}

      {/* Create Lot Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); resetCreateForm(); } }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo Lote</SheetTitle>
            <SheetDescription>Registra un lote de inventario para un producto existente.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Producto</Label>
              <select
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— Seleccionar producto —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Número de lote</Label>
              <Input
                value={newLotNumber}
                onChange={(e) => setNewLotNumber(e.target.value)}
                placeholder="Ej: LOT-2024-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min={0.001}
                  step={0.001}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha vencimiento</Label>
                <Input
                  type="date"
                  value={newExpiration}
                  onChange={(e) => setNewExpiration(e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Fecha producción (opcional)</Label>
                <Input
                  type="date"
                  value={newProductionDate}
                  onChange={(e) => setNewProductionDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancelar</Button>
            <Button variant="nuclear" disabled={createMutation.isPending} onClick={handleCreateLot}>
              {createMutation.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</>
                : "Registrar Lote"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedLot} onOpenChange={(v) => !v && setSelectedLot(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedLot && (() => {
            const days = daysToExpiry(selectedLot.expirationDate);
            const b = bucketOf(days);
            return (
              <>
                <SheetHeader>
                  <div className={cn("inline-flex w-fit rounded-lg px-3 py-1.5 text-xs font-bold font-mono", bucketCls[b])}>
                    {days <= 0 ? "VENCIDO" : days >= 9999 ? "Sin vencimiento" : `Vence en ${days} días`}
                  </div>
                  <SheetTitle>{selectedLot.product.name}</SheetTitle>
                  <SheetDescription>Lote {selectedLot.lotNumber} · {selectedLot.product.sku}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard icon={Hash} label="Número de lote" value={selectedLot.lotNumber} />
                    <InfoCard icon={Package} label="Cantidad disponible" value={`${selectedLot.quantity.toLocaleString("es-CO")} un`} />
                    <InfoCard icon={Tag} label="Estado"
                      value={selectedLot.status === "ACTIVE" ? "Activo" : selectedLot.status === "DEPLETED" ? "Agotado" : selectedLot.status === "EXPIRED" ? "Vencido" : "Cuarentena"} />
                    <InfoCard icon={MapPin} label="Ubicación"
                      value={selectedLot.storageLocation?.code ?? "Sin asignar"} />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-3 text-sm">
                    <Row label="Producto" value={selectedLot.product.name} />
                    <Row label="SKU" value={selectedLot.product.sku} mono />
                    <Row label="Fecha producción"
                      value={selectedLot.productionDate
                        ? format(parseISO(selectedLot.productionDate), "dd MMM yyyy", { locale: es })
                        : "—"} />
                    <Row label="Fecha vencimiento"
                      value={selectedLot.expirationDate
                        ? format(parseISO(selectedLot.expirationDate), "dd MMM yyyy", { locale: es })
                        : "Sin vencimiento"} />
                    {selectedLot.supplierRef && <Row label="Ref. proveedor" value={selectedLot.supplierRef} mono />}
                    {selectedLot.notes && <Row label="Notas" value={selectedLot.notes} />}
                    <Row label="Registrado el"
                      value={format(parseISO(selectedLot.createdAt), "dd MMM yyyy HH:mm", { locale: es })} />
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="size-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className={cn("text-xs font-medium text-right", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function BucketCard({ icon: Icon, label, count, tone, active, onClick }: {
  icon: typeof Calendar; label: string; count: number;
  tone: "destructive" | "warning" | "info" | "success"; active: boolean; onClick: () => void;
}) {
  const toneText = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning" : tone === "info" ? "text-info" : "text-success";
  const toneBg = tone === "destructive" ? "bg-destructive/10" : tone === "warning" ? "bg-warning/10" : tone === "info" ? "bg-info/10" : "bg-success/10";

  return (
    <button type="button" onClick={onClick}
      className={cn("group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5",
        active ? "border-nuclear shadow-[var(--shadow-nuclear)]" : "border-border")}>
      <div className="flex items-center justify-between">
        <span className={cn("grid size-8 place-items-center rounded-md", toneBg, toneText)}><Icon className="size-4" /></span>
        {active && <span className="rounded-full bg-nuclear/15 px-1.5 py-0.5 text-[10px] font-semibold text-nuclear">Filtrado</span>}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-display text-2xl font-semibold", toneText)}>{count}</p>
    </button>
  );
}

function LotRow({ lot, index, onDetail }: { lot: LotResponse; index: number; onDetail: () => void }) {
  const days = daysToExpiry(lot.expirationDate);
  const b = bucketOf(days);
  const dateLabel = lot.expirationDate
    ? parseISO(lot.expirationDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" })
    : "Sin vencimiento";
  const receivedAt = parseISO(lot.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

  return (
    <motion.li initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40 md:grid-cols-[auto_1fr_auto_auto_auto]">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold", bucketCls[b])}>
        {days <= 0 ? "VENC" : days >= 9999 ? "∞" : `${days}d`}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{lot.product.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {lot.product.sku} · Lote <span className="text-foreground">{lot.lotNumber}</span> · Recibido {receivedAt}
        </p>
      </div>
      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <MapPin className="size-3.5" />
        {lot.storageLocation ? lot.storageLocation.code : "Sin ubicación"}
      </div>
      <div className="hidden text-right md:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vence</p>
        <p className="font-mono text-xs text-foreground">{dateLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs">
          {lot.quantity.toLocaleString("es-CO")} un
        </span>
        <Button size="sm" variant="outline" onClick={onDetail}>Detalle</Button>
      </div>
    </motion.li>
  );
}
