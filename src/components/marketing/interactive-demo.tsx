import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { cn } from "@/lib/utils";

interface Row {
  sku: string;
  nombre: string;
  bodega: string;
  stock: number;
  rop: number;
  abc: "A" | "B" | "C";
  fefoDias: number;
}

const data: Row[] = [
  {
    sku: "SKU-0042",
    nombre: "Arequipe x 250g",
    bodega: "CEDI Norte",
    stock: 1240,
    rop: 800,
    abc: "A",
    fefoDias: 4,
  },
  {
    sku: "SKU-0117",
    nombre: "Arequipe x 500g",
    bodega: "CEDI Norte",
    stock: 320,
    rop: 600,
    abc: "A",
    fefoDias: 9,
  },
  {
    sku: "SKU-0089",
    nombre: "Bocadillo veleño",
    bodega: "CEDI Sur",
    stock: 2110,
    rop: 1500,
    abc: "A",
    fefoDias: 21,
  },
  {
    sku: "SKU-0205",
    nombre: "Manjar artesanal",
    bodega: "CEDI Norte",
    stock: 80,
    rop: 250,
    abc: "B",
    fefoDias: 38,
  },
  {
    sku: "SKU-0311",
    nombre: "Cocadas premium",
    bodega: "CEDI Sur",
    stock: 540,
    rop: 400,
    abc: "B",
    fefoDias: 60,
  },
  {
    sku: "SKU-0420",
    nombre: "Panela orgánica",
    bodega: "CEDI Centro",
    stock: 4200,
    rop: 3000,
    abc: "C",
    fefoDias: 180,
  },
];

type Filter = "all" | "alerta" | "fefo" | "A";

export function InteractiveDemo() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("all");

  const rows = useMemo(() => {
    return data.filter((r) => {
      if (q && !`${r.sku} ${r.nombre} ${r.bodega}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (f === "alerta" && r.stock > r.rop) return false;
      if (f === "fefo" && r.fefoDias > 14) return false;
      if (f === "A" && r.abc !== "A") return false;
      return true;
    });
  }, [q, f]);

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Pruébalo aquí mismo"
          title={
            <>
              El producto, <span className="text-gradient-nuclear">en tus dedos</span>.
            </>
          }
          description="Filtra, busca y siente la densidad de información. Esta es una mini-tabla real, no una imagen."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar SKU, nombre o bodega…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
                aria-label="Buscar inventario"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              {(
                [
                  { k: "all", l: "Todos" },
                  { k: "alerta", l: "Bajo ROP" },
                  { k: "fefo", l: "FEFO ≤14d" },
                  { k: "A", l: "Pareto A" },
                ] as { k: Filter; l: string }[]
              ).map((b) => (
                <Button
                  key={b.k}
                  size="sm"
                  variant={f === b.k ? "nuclear" : "outline"}
                  onClick={() => setF(b.k)}
                >
                  {b.l}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Bodega</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">ROP</th>
                  <th className="px-4 py-3 text-center font-medium">ABC</th>
                  <th className="px-4 py-3 text-right font-medium">FEFO</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const bajo = r.stock <= r.rop;
                  const fefoTone =
                    r.fefoDias <= 7 ? "destructive" : r.fefoDias <= 30 ? "warning" : "muted";
                  return (
                    <tr
                      key={r.sku}
                      className="border-b border-border/60 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-mono text-foreground">{r.sku}</td>
                      <td className="px-4 py-3">{r.nombre}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.bodega}</td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono tabular-nums",
                          bajo && "text-destructive",
                        )}
                      >
                        {r.stock.toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                        {r.rop.toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "font-mono inline-block min-w-6 rounded px-1.5 py-0.5 text-[11px] font-semibold",
                            r.abc === "A" && "bg-nuclear/15 text-nuclear",
                            r.abc === "B" && "bg-reactor/15 text-reactor",
                            r.abc === "C" && "bg-muted text-muted-foreground",
                          )}
                        >
                          {r.abc}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "font-mono rounded-full px-2 py-0.5 text-[11px]",
                            fefoTone === "destructive" && "bg-destructive/10 text-destructive",
                            fefoTone === "warning" && "bg-warning/10 text-warning",
                            fefoTone === "muted" && "text-muted-foreground",
                          )}
                        >
                          {r.fefoDias}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      Ningún SKU coincide. Ajusta tus filtros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
