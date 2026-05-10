import { Check, X } from "lucide-react";
import { SectionHeading } from "@/components/nuclear-ui/section-heading";
import { cn } from "@/lib/utils";

const rows: {
  feature: string;
  excel: boolean;
  legacy: "yes" | "no" | "limited";
  nuclear: boolean;
}[] = [
  { feature: "Multi-tenant nativo", excel: false, legacy: "no", nuclear: true },
  { feature: "Trazabilidad por lote (FEFO)", excel: false, legacy: "limited", nuclear: true },
  { feature: "ROP dinámico con lead time real", excel: false, legacy: "limited", nuclear: true },
  { feature: "Pareto / ABC automático", excel: false, legacy: "no", nuclear: true },
  { feature: "Tiempo real (WebSockets)", excel: false, legacy: "no", nuclear: true },
  { feature: "App operario PWA + escáner", excel: false, legacy: "limited", nuclear: true },
  { feature: "Pasarela COP (ePayco/Wompi)", excel: false, legacy: "no", nuclear: true },
  { feature: "Auditoría inmutable", excel: false, legacy: "limited", nuclear: true },
];

function Cell({ value }: { value: boolean | "limited" | "yes" | "no" }) {
  if (value === true || value === "yes")
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="size-4" />
      </span>
    );
  if (value === "limited")
    return (
      <span className="font-mono inline-flex h-7 items-center justify-center rounded-full bg-warning/15 px-2 text-[11px] font-medium text-warning">
        Limitado
      </span>
    );
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
      <X className="size-4" />
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="relative bg-surface-2/40">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading
          eyebrow="Comparativa"
          title={
            <>
              Excel ya cumplió. <span className="text-gradient-nuclear">El relevo llegó</span>.
            </>
          }
          description="Mira lo que cambia cuando dejas atrás la planilla y los WMS legacy."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2/60">
              <tr>
                <th className="px-5 py-4 text-left font-medium text-muted-foreground">
                  Característica
                </th>
                <th className="px-5 py-4 text-center font-medium text-muted-foreground">Excel</th>
                <th className="px-5 py-4 text-center font-medium text-muted-foreground">
                  WMS legacy
                </th>
                <th
                  className={cn(
                    "px-5 py-4 text-center font-semibold text-foreground",
                    "bg-gradient-to-b from-nuclear/10 to-transparent",
                  )}
                >
                  Nuclear WMS
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.feature}
                  className={cn("border-b border-border/60", i % 2 === 1 && "bg-surface-2/20")}
                >
                  <td className="px-5 py-3.5">{r.feature}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell value={r.excel} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell value={r.legacy} />
                  </td>
                  <td className="bg-nuclear/5 px-5 py-3.5 text-center">
                    <Cell value={r.nuclear} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
