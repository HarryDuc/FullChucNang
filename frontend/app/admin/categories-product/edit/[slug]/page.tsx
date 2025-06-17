"use client"; // ✅ Bắt buộc để xử lý Client Component

import EditCategoriesProductPage from "@/modules/admin/categories-product/pages/EditCategoriesProduct";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function CreateCategoriesProduct() {
  return (
    <LayoutAdmin>
      <EditCategoriesProductPage />
    </LayoutAdmin>
  );
}
