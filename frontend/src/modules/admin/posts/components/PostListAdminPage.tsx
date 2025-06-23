// src/modules/posts/components/PostList.tsx
"use client";

import React, { useState } from "react";
import { usePosts } from "@/modules/admin/posts/hooks/usePosts";
import { Post } from "@/modules/admin/posts/models/post.model";
import SearchProducts from "./SearchProducts";

/**
 * Hàm định dạng ngày giờ từ chuỗi ISO thành định dạng hiển thị
 * @param dateInput Chuỗi ISO hoặc đối tượng Date
 * @returns Object chứa date và time đã định dạng
 */
const formatDateTime = (
  dateInput?: string | Date
): { date: string; time: string } => {
  if (!dateInput) return { date: "Không xác định", time: "Không xác định" };

  // Tạo đối tượng Date từ chuỗi ISO
  const date = new Date(dateInput);

  // Format ngày tháng theo định dạng Việt Nam
  const dateStr = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC", // Quan trọng: sử dụng múi giờ UTC
  });

  // Format giờ phút theo định dạng 24 giờ
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC", // Quan trọng: sử dụng múi giờ UTC
  });

  return { date: dateStr, time: timeStr };
};

const PostList: React.FC = () => {
  const {
    postsQuery,
    hardDeleteMutation,
    page,
    setPage,
    limit,
    searchTerm,
    setSearchTerm,
  } = usePosts();
  const [isSearching, setIsSearching] = useState(false);

  // Xử lý xóa bài viết với confirm
  const handleDelete = async (id: string, slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        await hardDeleteMutation.mutateAsync(slug);
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
      }
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (term: string) => {
    setIsSearching(true);
    setPage(1); // reset về trang 1 khi search mới
    setSearchTerm(term.trim());
    setIsSearching(false);
  };

  if (postsQuery.isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (postsQuery.isError) {
    return <p>Đã xảy ra lỗi khi tải bài viết.</p>;
  }

  const posts = postsQuery.data?.data ?? [];
  const total = postsQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold mb-4">Danh sách bài viết</h2>
        <a
          href="/admin/posts/create"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition inline-block"
        >
          Thêm mới bài viết
        </a>
        <div className="w-full md:w-1/2">
          <SearchProducts
            onSearch={handleSearch}
            isSearching={isSearching}
            placeholder="Nhập tên bài viết cần tìm..."
          />
        </div>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="p-3 border">STT</th>
            <th className="p-3 border">Tiêu đề</th>
            <th className="p-3 border">Tác giả</th>
            <th className="p-3 border">Giờ đăng</th>
            <th className="p-3 border">Ngày đăng</th>
            <th className="p-3 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post: Post, index: number) => {
            const { date, time } = formatDateTime(post.publishedDate);
            return (
              <tr key={post.slug} className="hover:bg-gray-100">
                <td className="p-3 border">{(page - 1) * limit + index + 1}</td>
                <td className="p-3 border">{post.name}</td>
                <td className="p-3 border">{post.author || "Không rõ"}</td>
                <td className="p-3 border">{time}</td>
                <td className="p-3 border">{date}</td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <a
                      href={`/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                        Xem
                      </button>
                    </a>

                    <a
                      href={`/admin/posts/edit/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                        Sửa
                      </button>
                    </a>

                    <button
                      onClick={() => handleDelete(post.id, post.slug)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          ← Trang trước
        </button>

        <span>{`Trang ${page} / ${totalPages}`}</span>

        <button
          onClick={() =>
            setPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={page >= totalPages}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Trang sau →
        </button>
      </div>
    </div>
  );
};

export default PostList;
