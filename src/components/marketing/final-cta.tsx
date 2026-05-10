import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-10 text-center shadow-[var(--shadow-elevated)] sm:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{ backgroundImage: "var(--gradient-reactor)", filter: "blur(80px)" }}
          />
          <div
            aria-hidden
            className="bg-grid-nuclear absolute inset-0 opacity-20"
            style={{ color: "white" }}
          />
          <div className="relative">
            <h2
              className="font-display mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
              style={{ color: "var(--background)" }}
            >
              Adiós Excel. <span className="text-gradient-nuclear">Hola control real.</span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-balance text-base sm:text-lg"
              style={{ color: "color-mix(in oklab, var(--background) 70%, transparent)" }}
            >
              14 días Pro gratis. Sin tarjeta. Tu CEDI te lo va a agradecer.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="plasma" size="xl">
                <Link to="/register">
                  Encender mi reactor
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/contact">Hablar con ventas</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
