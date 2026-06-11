import { cn } from "@/lib/utils";

interface NuclearLogoProps {
  className?: string;
  imgClassName?: string;
  withWordmark?: boolean;
}

/**
 * Logo Oficial de Krevo:
 * Cubo isométrico central rodeado de órbitas electrónicas en 3D.
 * Implementado con capas SVG de alta precisión para lograr intersección 3D perfecta
 * y transparencia total sobre cualquier color de fondo sin necesidad de máscaras sólidas.
 */
export function NuclearLogo({ className, imgClassName, withWordmark = false }: NuclearLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <img
        src="/logo.png"
        alt="Krevo Logo"
        className={cn("shrink-0 object-contain", imgClassName ?? "size-20")}
      />
      {withWordmark ? (
        <span className="font-display text-xl font-bold tracking-tight text-current">Krevo</span>
      ) : null}
    </span>
  );
}
