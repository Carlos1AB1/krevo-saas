import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, AlertTriangle, Snowflake, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lots, type Lot } from "@/lib/wms-mock";
import { cn } from "@/lib/utils";

type Bucket = "all" | "expired" | "7d" | "30d" | "90d" | "ok";

const buckets: { key: Bucket; label: string; cls: string }[] = [
  { key: "all", label: "Todos", cls: "" },
  { key: "7d", label: "≤ 7 días", cls: "text-destructive" },
  { key: "30d", label: "≤ 30 días", cls: "text-warning" },
  { key: "90d", label: "≤ 90 días", cls: "text-info" },
  { key: "ok", label: "> 90 días", cls: "text-success" },
];

function bucketOf(d: number): Exclude<Bucket, "all"> {
  if (d <= 0) return "expired";
  if (d <= 7) return "7d";
  if (d <= 30) return "30d";
  if (d <= 90) return "90d";
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
  const [q, setQ] = useState("");
  const [bucket, setBucket] = useState<Bucket>("all");

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return lots
      .filter((l) => {
        if (bucket !== "all" && bucketOf(l.daysToExpiry) !== bucket) return false;
        if (!ql) return true;
        return (
          l.lot.toLowerCase().includes(ql) ||
          l.sku.toLowerCase().includes(ql) ||
          l.productName.toLowerCase().includes(ql) ||
          l.warehouse.toLowerCase().includes(ql)
        );
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [q, bucket]);

  const counts = useMemo(() => {
    const map: Record<Exclude<Bucket, "all">, number> = {
      expired: 0,
      "7d": 0,
      "30d": 0,
      "90d": 0,
      ok: 0,
    };
    lots.forEach((l) => {
      map[bucketOf(l.daysToExpiry)]++;
    });
    return map;
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Inventario · Trazabilidad
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Stock & Lotes · FEFO
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lots.length} lotes activos · Ordenados por fecha de vencimiento más cercana
        </p>
      </div>

      {/* Bucket cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BucketCard
          tone="destructive"
          icon={AlertTriangle}
          label="Vencen ≤ 7 días"
          count={counts["7d"]}
          active={bucket === "7d"}
          onClick={() => setBucket(bucket === "7d" ? "all" : "7d")}
        />
        <BucketCard
          tone="warning"
          icon={Calendar}
          label="Vencen ≤ 30 días"
          count={counts["30d"]}
          active={bucket === "30d"}
          onClick={() => setBucket(bucket === "30d" ? "all" : "30d")}
        />
        <BucketCard
          tone="info"
          icon={Calendar}
          label="Vencen ≤ 90 días"
          count={counts["90d"]}
          active={bucket === "90d"}
          onClick={() => setBucket(bucket === "90d" ? "all" : "90d")}
        />
        <BucketCard
          tone="success"
          icon={Snowflake}
          label="Más de 90 días"
          count={counts.ok}
          active={bucket === "ok"}
          onClick={() => setBucket(bucket === "ok" ? "all" : "ok")}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar lote, SKU, producto o bodega…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {buckets.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBucket(b.key)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                bucket === b.key
                  ? "border-nuclear bg-nuclear/10 text-nuclear"
                  : "border-border bg-background text-muted-foreground hover:bg-accent",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lots list — FEFO order */}
      <ul className="space-y-2">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Sin lotes en este rango.
          </li>
        ) : (
          filtered.map((l, i) => <LotRow key={l.lot} lot={l} index={i} />)
        )}
      </ul>
    </div>
  );
}

function BucketCard({
  icon: Icon,
  label,
  count,
  tone,
  active,
  onClick,
}: {
  icon: typeof Calendar;
  label: string;
  count: number;
  tone: "destructive" | "warning" | "info" | "success";
  active: boolean;
  onClick: () => void;
}) {
  const toneText =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "info"
          ? "text-info"
          : "text-success";
  const toneBg =
    tone === "destructive"
      ? "bg-destructive/10"
      : tone === "warning"
        ? "bg-warning/10"
        : tone === "info"
          ? "bg-info/10"
          : "bg-success/10";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5",
        active ? "border-nuclear shadow-[var(--shadow-nuclear)]" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("grid size-8 place-items-center rounded-md", toneBg, toneText)}>
          <Icon className="size-4" />
        </span>
        {active && (
          <span className="rounded-full bg-nuclear/15 px-1.5 py-0.5 text-[10px] font-semibold text-nuclear">
            Filtrado
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 font-display text-2xl font-semibold", toneText)}>{count}</p>
    </button>
  );
}

function LotRow({ lot, index }: { lot: Lot; index: number }) {
  const b = bucketOf(lot.daysToExpiry);
  const date = new Date(lot.expiry).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40 md:grid-cols-[auto_1fr_auto_auto_auto]"
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold",
          bucketCls[b],
        )}
      >
        {lot.daysToExpiry <= 0 ? "VENC" : `${lot.daysToExpiry}d`}
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{lot.productName}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {lot.sku} · Lote <span className="text-foreground">{lot.lot}</span> · Recibido{" "}
          {lot.receivedAt}
        </p>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <MapPin className="size-3.5" />
        {lot.warehouse} · {lot.bin}
      </div>

      <div className="hidden text-right md:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Vence
        </p>
        <p className="font-mono text-xs text-foreground">{date}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs">
          {lot.qty.toLocaleString("es-CO")} un
        </span>
        <Button size="sm" variant="outline">
          Detalle
        </Button>
      </div>
    </motion.li>
  );
}
