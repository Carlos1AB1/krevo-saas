import { cn } from "@/lib/utils";

interface NuclearLogoProps {
  className?: string;
  withWordmark?: boolean;
}

/**
 * Logo Oficial de Nuclear WMS:
 * Cubo isométrico central rodeado de órbitas electrónicas en 3D.
 * Implementado con capas SVG de alta precisión para lograr intersección 3D perfecta
 * y transparencia total sobre cualquier color de fondo sin necesidad de máscaras sólidas.
 */
export function NuclearLogo({ className, withWordmark = false }: NuclearLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <img src="/logo.png" alt="Krevo Logo" className="size-18 shrink-0 object-contain" />
      {withWordmark ? (
        <span className="font-display text-xl font-bold tracking-tight text-foreground">Krevo</span>
      ) : null}
    </span>
  );
}
