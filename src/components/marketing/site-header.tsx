import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Producto", to: "/features" },
  { label: "Precios", to: "/pricing" },
  { label: "Sobre", to: "/about" },
  { label: "Contacto", to: "/contact" },
] as const;

interface SiteHeaderProps {
  transparentHero?: boolean;
}

export function SiteHeader({ transparentHero = false }: SiteHeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHeaderDark = !scrolled && transparentHero;

  useEffect(() => {
    const onScroll = () => {
      const threshold = transparentHero ? window.innerHeight * 2.3 : 8;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [transparentHero]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white"
          : cn("border-b border-transparent", transparentHero && "dark text-foreground")
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-8">
        {/* Left: Logo */}
        <div className="flex flex-1 justify-start items-center">
          <Link to="/" aria-label="Krevo — inicio" className="flex items-center">
            <NuclearLogo withWordmark className={isHeaderDark ? "text-white" : "text-foreground"} />
          </Link>
        </div>

        {/* Center: Nav Links (100% Geometric Center) */}
        <nav className={cn(
          "hidden items-center gap-8 text-sm md:flex h-full",
          isHeaderDark ? "text-white/80" : "text-muted-foreground"
        )}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "transition-colors flex items-center h-full",
                isHeaderDark ? "hover:text-white" : "hover:text-foreground"
              )}
              activeProps={{ className: isHeaderDark ? "text-white" : "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Buttons & Mobile Toggle */}
        <div className="flex flex-1 justify-end items-center gap-2 h-full">
          <div className="hidden items-center gap-2 md:flex h-full">
            <Button asChild variant="ghost" size="sm" className={isHeaderDark ? "text-white hover:bg-white/10" : ""}>
              <Link to="/login" className="flex items-center">Iniciar sesión</Link>
            </Button>
            <Button asChild variant="plasma" size="sm" className="flex items-center">
              <Link to="/contact">
                Solicitar demo
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "rounded-md p-2 md:hidden flex items-center",
              isHeaderDark ? "text-white" : "text-foreground"
            )}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-white md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild variant="ghost">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="plasma">
                <Link to="/contact">Solicitar demo</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
