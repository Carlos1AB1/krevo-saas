import { createFileRoute } from "@tanstack/react-router";
import { ProductsTable } from "@/components/app/products-table";

export const Route = createFileRoute("/app/products")({
  head: () => ({ meta: [{ title: "Productos · Krevo" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1480px] p-4 lg:p-6">
          <ProductsTable />
        </div>
      </main>
    </>
  );
}
