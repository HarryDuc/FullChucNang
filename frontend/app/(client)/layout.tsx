import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/modules/admin/common/providers/QueryProvider";
import { ProductsProvider } from "@/context/ProductsContext";
import ContactFloatingButtons from "@/modules/client/common/components/PhoneNumber";

export const metadata = {
  title: "Decor & More - Mua sắm đồ trang trí",
  description: "Cửa hàng đồ trang trí nhà cửa, nội thất và quà tặng hàng đầu",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProductsProvider>
          {children}
        </ProductsProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
