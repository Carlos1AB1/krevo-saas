import { createFileRoute } from "@tanstack/react-router";
import { DashboardContent } from "@/components/app/dashboard-content";
import { useAuth } from "@/features/auth/AuthProvider";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Dashboard · Krevo" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <main className="flex-1 flex flex-col">
        <DashboardContent />
      </main>
    </>
  );
}
