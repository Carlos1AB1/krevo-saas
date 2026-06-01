import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/app-sidebar";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Krevo · App" }, { name: "robots", content: "noindex" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  );
}
