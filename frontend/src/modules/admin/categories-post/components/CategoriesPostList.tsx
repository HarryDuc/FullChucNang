"use client";

import { useCategoryPosts } from "../hooks/useCategoriesPost";
import { CategoryPost } from "../models/categories-post.model";
import { useState } from "react";

const CategoriesPostList = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { listQuery, hardDeleteMutation } = useCategoryPosts(page, limit);

  const handleDelete = async (slug: string) => {
    if (!slug) return alert("❌ Không thể xoá vì thiếu slug!");

    const confirmDelete = confirm("❗ Xác nhận xoá vĩnh viễn danh mục?");
    if (!confirmDelete) return;

    try {
      await hardDeleteMutation.mutateAsync(slug);
      alert("✅ Đã xoá thành công!");
    } catch (error) {
      console.error("❌ Xoá thất bại:", error);
      alert("❌ Xoá thất bại!");
    }
  };

  if (listQuery.isLoading) {
    return <p className="p-4 text-gray-600">Đang tải danh mục bài viết...</p>;
  }

  const hasNextPage = !!listQuery.data && listQuery.data.length >= limit;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        📚 Danh sách danh mục bài viết
      </h1>

      <div className="mb-4">
        <a
          href="/admin/categories-post/create"
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
              <th className="py-3 px-4 text-left border-b">STT</th>
              <th className="py-3 px-4 text-left border-b">Tên danh mục</th>
              <th className="py-3 px-4 text-left border-b">Danh mục cha</th>
              <th className="py-3 px-4 text-left border-b">Slug</th>
              <th className="py-3 px-4 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.data && listQuery.data.length > 0 ? (
              listQuery.data.map((category: CategoryPost, index: number) => {
                // Tìm danh mục cha (nếu có)
                const parentCategory = category.parent
                  ? listQuery.data.find(
                      (cat: CategoryPost) => cat._id === category.parent
                    )
                  : null;

                return (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="py-3 px-4 border-b font-medium">
                      {category.name}
                    </td>
                    <td className="py-3 px-4 border-b text-gray-600">
                      {parentCategory ? parentCategory.name : "Không có"}
                    </td>
                    <td className="py-3 px-4 border-b text-gray-500">
                      {category.slug}
                    </td>
                    <td className="py-3 px-4 border-b text-center space-x-2">
                      <a
                        href={`/admin/categories-post/edit/${category.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded inline-block"
                      >
                        ✏️ Sửa
                      </a>

                      <button
                        onClick={() => handleDelete(category.slug)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                      >
                        🗑️ Xoá
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ← Trước
        </button>
        <span className="text-sm">Trang {page}</span>
        <button
          disabled={!hasNextPage}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default CategoriesPostList;
