import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { NuclearLogo } from "@/components/nuclear-ui/nuclear-logo";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Krevo · App" }, { name: "robots", content: "noindex" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RequireAuth>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar — hamburger + logo, only visible below lg */}
          <div className="lg:hidden sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              <Menu className="size-5" />
            </button>
            <NuclearLogo withWordmark />
          </div>

          <Outlet />
        </div>
      </div>
    </RequireAuth>
  );
}
