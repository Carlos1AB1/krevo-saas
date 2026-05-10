import { Link } from "@tanstack/react-router";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { LiveBadge } from "@/components/nuclear-ui/live-badge";

const cols: { title: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    title: "Producto",
    links: [
      { label: "Características", to: "/features" },
      { label: "Precios", to: "/pricing" },
      { label: "Solicitar demo", to: "/contact" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", to: "/about" },
      { label: "Contacto", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos", to: "/legal/terms" },
      { label: "Privacidad", to: "/legal/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[2fr_3fr]">
        <div className="space-y-4">
          <NuclearLogo withWordmark />
          <p className="max-w-sm text-sm text-muted-foreground">
            El cerebro de tu Centro de Distribución. Hecho en Colombia para LATAM.
          </p>
          <LiveBadge label="Status · todos los servicios operativos" />
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display mb-3 text-sm font-semibold text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) =>
                  l.to ? (
                    <li key={l.label}>
                      <Link to={l.to} className="text-muted-foreground hover:text-foreground">
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a href={l.href} className="text-muted-foreground hover:text-foreground">
                        {l.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Krevo. Todos los derechos reservados.</p>
          <p className="font-mono">v0.1 · es-CO · COP</p>
        </div>
      </div>
    </footer>
  );
}
