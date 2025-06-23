import { ProductsProvider } from "@/context/ProductsContext";
import ClientLayout from "@/modules/client/common/layouts/ClientLayout";

export const metadata = {
  title: "Decor & More - Mua sắm đồ trang trí",
  description: "Cửa hàng đồ trang trí nhà cửa, nội thất và quà tặng hàng đầu",
};

export default function ClientLayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      <ProductsProvider>{children}</ProductsProvider>
    </ClientLayout>
  );
}
