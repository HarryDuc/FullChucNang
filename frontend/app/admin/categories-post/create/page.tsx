import CategoriesPostCreate from "@/modules/admin/categories-post/components/CategoriesPostCreate";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function CategoriesProductPage() {
  return (
    <LayoutAdmin>
      <CategoriesPostCreate />
    </LayoutAdmin>
  );
}
