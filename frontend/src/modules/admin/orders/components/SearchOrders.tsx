// 📂 SearchOrders.tsx
"use client";

import { useState } from "react";
import { OrderWithCheckout, OrderService } from "../services/order.service";
import { FaSearch } from "react-icons/fa";

interface SearchOrdersProps {
  onSearchResult: (order: OrderWithCheckout | null) => void;
  onSearchNotFound: () => void;
  onClearSearch?: () => void;
}

const SearchOrders = ({
  onSearchResult,
  onSearchNotFound,
  onClearSearch,
}: SearchOrdersProps) => {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    // Nếu ô tìm kiếm trống, gọi hàm để hiển thị lại tất cả đơn hàng
    if (!slug.trim()) {
      if (onClearSearch) {
        onClearSearch();
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await OrderService.searchOrderBySlug(slug.trim());

      if (result) {
        onSearchResult(result);
      } else {
        setError("Không tìm thấy đơn hàng với mã này.");
        onSearchNotFound(); // Ẩn toàn bộ danh sách
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tìm kiếm đơn hàng.");
      onSearchNotFound(); // Ẩn toàn bộ danh sách trong trường hợp lỗi
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý sự kiện submit của form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)
    handleSearch(); // Gọi hàm tìm kiếm
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex rounded-md shadow-sm">
        <input
          type="text"
          placeholder="Nhập mã đơn hàng..."
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={loading}
          className="flex-1 block w-full rounded-l-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          title="Tìm kiếm"
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaSearch />
        </button>
      </div>
    </form>
  );
};

export default SearchOrders;
