import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app/app-topbar";
import { StockLotsView } from "@/components/app/stock-lots";

export const Route = createFileRoute("/app/stock")({
  head: () => ({ meta: [{ title: "Stock & Lotes · Nuclear WMS" }] }),
  component: StockPage,
});

function StockPage() {
  return (
    <>
      <AppTopbar breadcrumb={[{ label: "Inventario", to: "/app" }, { label: "Stock & Lotes" }]} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1480px] p-4 lg:p-6">
          <StockLotsView />
        </div>
      </main>
    </>
  );
}
