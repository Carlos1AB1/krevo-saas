import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app/app-topbar";
import { StockLotsView } from "@/components/app/stock-lots";
import { StockKardexView } from "@/components/app/stock-kardex";
import { StockPoliciesView } from "@/components/app/stock-policies";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/stock")({
  head: () => ({ meta: [{ title: "Gestión de Inventarios (WMS) · Nuclear" }] }),
  component: StockPage,
});

function StockPage() {
  return (
    <>
      <AppTopbar breadcrumb={[{ label: "WMS", to: "/app" }, { label: "Gestión de Inventarios" }]} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1480px] p-4 lg:p-6">
          <Tabs defaultValue="lots" className="w-full">
            <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="lots">Lotes & FEFO</TabsTrigger>
              <TabsTrigger value="kardex">Kárdex Digital</TabsTrigger>
              <TabsTrigger value="policies">Políticas y Modelos</TabsTrigger>
            </TabsList>
            <TabsContent value="lots" className="mt-0 outline-none">
              <StockLotsView />
            </TabsContent>
            <TabsContent value="kardex" className="mt-0 outline-none">
              <StockKardexView />
            </TabsContent>
            <TabsContent value="policies" className="mt-0 outline-none">
              <StockPoliciesView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
