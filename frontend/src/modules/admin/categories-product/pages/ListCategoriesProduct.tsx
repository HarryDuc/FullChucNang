"use client";

import { useCategoriesProduct } from "../hooks/useCategoriesProduct";
import Link from "next/link";
import { deleteCategoriesProduct } from "../services/categories-product.service";
import { useRouter } from "next/navigation";

const ListCategoriesProduct = () => {
  const { categoriesProduct, loading, refetch } = useCategoriesProduct();
  const router = useRouter();

  const handleDelete = async (slug: string) => {
    if (!slug) {
      alert("❌ Không thể xoá vì thiếu slug!");
      return;
    }

    const confirmDelete = confirm(
      "❗ Bạn có chắc chắn muốn xoá danh mục này không?"
    );
    if (!confirmDelete) return;

    try {
      await deleteCategoriesProduct(slug);
      alert("✅ Danh mục đã bị xoá thành công!");
      refetch(); // Refetch lại dữ liệu sau khi xoá
    } catch (error) {
      console.error("❌ Lỗi khi xoá danh mục:", error);
      alert("❌ Xoá thất bại, vui lòng thử lại!");
    }
  };

  if (loading)
    return <p className="p-4 text-gray-600">Đang tải danh mục sản phẩm...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Danh sách danh mục sản phẩm</h1>

      <div className="mb-4">
        <a
          href="/admin/categories-product/create"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Thêm danh mục
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left border-b border-gray-300">
                STT
              </th>
              <th className="py-3 px-4 text-left border-b border-gray-300">
                Tên danh mục
              </th>
              <th className="py-3 px-4 text-left border-b border-gray-300">
                Slug
              </th>
              <th className="py-3 px-4 text-center border-b border-gray-300">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {categoriesProduct.length > 0 ? (
              categoriesProduct.map((category, index) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 font-medium">
                    {category.name}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-500 max-w-[200px] whitespace-normal break-words">
                    {category.slug}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center">
                    <a
                      href={`/admin/categories-product/detail/${category.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded mr-2 mb-2"
                    >
                      Xem
                    </a>

                    <a
                      href={`/admin/categories-product/edit/${category.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded mr-2 mb-2"
                    >
                      ✏️ Sửa
                    </a>
                    <button
                      onClick={() => handleDelete(category.slug)}
                      className="inline-block bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded mb-2"
                    >
                      🗑️ Xoá
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  Không có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCategoriesProduct;
