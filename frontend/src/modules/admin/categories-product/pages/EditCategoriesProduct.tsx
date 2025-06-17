"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoriesProductForm from "../components/CategoriesProductForm";
import {
  getCategoriesProductBySlug,
  updateCategoriesProduct,
} from "../services/categories-product.service";
import { CategoriesProduct } from "../types/categories-product.types";

const EditCategoriesProductPage = () => {
  const router = useRouter();
  const params = useParams(); // Trả về { slug: 'abc-xyz' }
  const slug = params.slug as string;
  const [category, setCategory] = useState<CategoriesProduct | null>(null);

  useEffect(() => {
    if (typeof slug === "string") {
      getCategoriesProductBySlug(slug).then(setCategory);
    }
  }, [slug]);

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    parentCategory?: string;
  }) => {
    if (!category) return;
    try {
      await updateCategoriesProduct(category.slug, data); // update bằng slug
      router.push("/admin/categories-product");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật danh mục:", error);
    }
  };

  if (!category)
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-700">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Chỉnh sửa danh mục: {category.name}
      </h1>
      <CategoriesProductForm category={category} onSuccess={handleUpdate} />
    </div>
  );
};

export default EditCategoriesProductPage;
