"use client";

import { useEffect, useState } from "react";
import { getCategoriesProductBySlug } from "@/modules/admin/categories-product/services/categories-product.service";
import ProductPage from "../../pages/Products";

interface CategoryPageProps {
  slug: string;
}

interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  level: number;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ slug }) => {
  const [categoryData, setCategoryData] = useState<CategorySummary | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const data = await getCategoriesProductBySlug(slug);

        if (!data?._id || !data?.name || !data?.slug) {
          throw new Error("Dữ liệu danh mục không hợp lệ.");
        }

        const formattedData: CategorySummary = {
          id: data._id,
          name: data.name,
          slug: data.slug,
          level: data.level ?? 0, // Nếu không có level, mặc định là 0
        };

        setCategoryData(formattedData);
      } catch (err) {
        setError(
          `Không thể tải thông tin danh mục. Chi tiết lỗi: ${String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  if (!categoryData) return <p>Không tìm thấy danh mục sản phẩm.</p>;

  // return <ProductListPage categoryData={categoryData} />;
  return <ProductPage slug={slug}/>;
};

export default CategoryPage;
