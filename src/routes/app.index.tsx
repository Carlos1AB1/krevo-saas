import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app/app-topbar";
import { DashboardContent } from "@/components/app/dashboard-content";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Dashboard · Nuclear WMS" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <AppTopbar breadcrumb={[{ label: "Dashboard" }]} />
      <main className="flex-1">
        <DashboardContent />
      </main>
    </>
  );
}
