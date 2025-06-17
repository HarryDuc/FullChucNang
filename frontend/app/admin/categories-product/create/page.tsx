"use client"; // ✅ Bắt buộc để xử lý Client Component

import CreateCategoriesProductPage from "@/modules/admin/categories-product/pages/CreateCategoriesProduct";
import LayoutAdmin from "@/modules/admin/common/layouts/AdminLayout";

export default function CreateCategoriesProduct() {
  return (
    <LayoutAdmin>
      <CreateCategoriesProductPage />
    </LayoutAdmin>
  );
}
