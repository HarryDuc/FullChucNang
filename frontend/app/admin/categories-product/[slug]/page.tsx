'use client';
import dynamic from "next/dynamic";

// ✅ Load component chỉnh sửa danh mục (Client Component)
const EditCategoriesProductPage = dynamic(
  () => import("@/modules/admin/categories-product/pages/EditCategoriesProduct"),
  { ssr: false } // ✅ Vô hiệu hóa SSR vì đây là Client Component
);

export default function Page({ params }: { params: { slug: string } }) {
  console.log("📌 `slug` từ params:", params.slug); // ✅ Debug kiểm tra slug nhận được

  if (!params?.slug) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500 text-lg">
          ❌ Không tìm thấy danh mục hợp lệ.
        </p>
      </div>
    );
  }

  return <EditCategoriesProductPage slug={params.slug} />; // ✅ Truyền `slug` đúng cách
}
