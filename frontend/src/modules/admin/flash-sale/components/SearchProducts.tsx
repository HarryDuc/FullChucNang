"use client";
import React, { useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchProductsProps {
  onSearch: (searchTerm: string, page?: number) => void;
  isSearching?: boolean;
  placeholder?: string;
}

/**
 * Lỗi load liên tục sản phẩm thường do gọi onSearch mỗi lần debouncedSearchTerm thay đổi,
 * kể cả khi searchTerm rỗng ban đầu (""), dẫn đến gọi API khi mount.
 *
 * Giải pháp:
 * - Chỉ gọi onSearch khi submit form hoặc khi người dùng xóa hết text (searchTerm === "").
 * - Không tự động gọi onSearch khi debouncedSearchTerm thay đổi (trừ trường hợp xóa hết text).
 * - Đảm bảo không gọi onSearch("") khi component mount lần đầu.
 */

const SearchProducts = ({
  onSearch = (term: string, page?: number) => {},
  isSearching = false,
  placeholder = "Nhập tên sản phẩm cần tìm...",
}: SearchProductsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isFirstRender = useRef(true);

  // Khi người dùng xóa hết text, gọi onSearch("") ngay lập tức
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      onSearch("", 1); // Reset về trang 1 khi xóa hết text
    }
  };

  // Chỉ gọi search khi submit form (bấm nút hoặc enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, 1); // Bắt đầu tìm kiếm từ trang 1
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex rounded-md shadow-sm">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          disabled={isSearching}
          className="flex-1 block w-full rounded-l-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          title="Tìm kiếm"
          disabled={isSearching}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaSearch />
        </button>
      </div>
    </form>
  );
};

export default SearchProducts;
