import ListOrders from "@/modules/admin/orders/components/ListOrders";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function CategoriesProductPage() {
  return (
    <LayoutAdmin>
      <ListOrders />
    </LayoutAdmin>
  );
}
