export function LogoCloud() {
  const stack = ["TanStack", "React 19", "TypeScript", "PostgreSQL", "NestJS", "Tailwind v4"];
  return (
    <section className="border-y border-border bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono mb-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Construido sobre tecnología que confías
        </p>
        <div className="grid grid-cols-3 items-center gap-6 sm:grid-cols-6">
          {stack.map((s) => (
            <div
              key={s}
              className="font-display text-center text-sm font-medium text-muted-foreground/80 grayscale transition-all hover:text-foreground hover:grayscale-0"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
