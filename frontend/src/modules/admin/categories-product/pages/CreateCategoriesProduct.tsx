"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoriesProductForm from "../components/CategoriesProductForm";
import { createCategoriesProduct } from "../services/categories-product.service";
import { removeVietnameseTones } from "@/common/utils/slug.utils";

const CreateCategoriesProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: {
    name: string;
    description?: string;
    parentCategory?: string;
  }) => {
    setLoading(true);
    try {
      const slug = removeVietnameseTones(data.name); // ✅ Tạo slug từ tên
      await createCategoriesProduct({ ...data, slug });
      alert("🎉 Tạo danh mục thành công!");
      router.push("/admin/categories-product"); // ✅ Điều hướng sau khi tạo thành công
    } catch (error) {
      console.error("❌ Lỗi khi tạo danh mục:", error);
      alert("❌ Lỗi khi tạo danh mục. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Tạo danh mục sản phẩm mới với nhiều cấp
      </h1>

      <div className="rounded-xl">
        <CategoriesProductForm onSuccess={handleCreate} />
        {loading && (
          <p className="mt-4 text-yellow-600 font-medium">⏳ Đang xử lý...</p>
        )}
      </div>
    </div>
  );
};

export default CreateCategoriesProduct;
