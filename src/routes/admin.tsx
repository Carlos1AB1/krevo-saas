import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getCurrentUser, logout } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await getCurrentUser().catch(() => null);

    if (!user) {
      throw redirect({
        search: { redirect: "/admin" },
        to: "/login",
      });
    }

    if (!user.isPlatformAdmin) {
      logout();
      throw redirect({
        search: { forbidden: "1", redirect: "/admin" },
        to: "/login",
      });
    }
  },
  head: () => ({
    meta: [{ title: "SuperAdmin · Krevo" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
