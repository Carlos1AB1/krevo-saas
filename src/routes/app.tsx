import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { TrialBanner } from "@/features/billing/TrialBanner";
import { useAuth } from "@/features/auth/AuthProvider";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Krevo · App" }, { name: "robots", content: "noindex" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <RequireAuth>
      <AppLayoutContent />
    </RequireAuth>
  );
}

function AppLayoutContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const style: React.CSSProperties = {};
  if (user?.primaryColor) {
    (style as Record<string, string>)["--primary"] = user.primaryColor;
    (style as Record<string, string>)["--nuclear"] = user.primaryColor;
    (style as Record<string, string>)["--ring"] = user.primaryColor;
    (style as Record<string, string>)["--sidebar-primary"] = user.primaryColor;
    (style as Record<string, string>)["--sidebar-ring"] = user.primaryColor;
  }

  return (
    <div
      className={`flex min-h-screen w-full bg-background text-foreground${user?.theme === "dark" ? " dark" : ""}`}
      style={style}
    >
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onMobileMenuClick={() => setMobileOpen(true)} />
        <TrialBanner />
        <Outlet />
      </div>
    </div>
  );
}
