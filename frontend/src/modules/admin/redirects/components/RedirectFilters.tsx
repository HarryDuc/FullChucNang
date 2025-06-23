"use client";
import React, { useState } from 'react';

interface FiltersProps {
  onFilter: (filters: any) => void;
  initialFilters?: {
    path?: string;
    type?: string;
    statusCode?: string;
    isActive?: string;
  };
}

const RedirectFilters: React.FC<FiltersProps> = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    path: initialFilters.path || '',
    type: initialFilters.type || '',
    statusCode: initialFilters.statusCode || '',
    isActive: initialFilters.isActive || ''
  });

  // Xử lý thay đổi input - filter ngay lập tức khi có thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters); // Gọi filter ngay lập tức
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = {
      path: '',
      type: '',
      statusCode: '',
      isActive: ''
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
      <form className="flex flex-wrap gap-3" onSubmit={(e) => e.preventDefault()}>
        <div className="min-w-[200px] flex-grow">
          <input
            type="text"
            name="path"
            value={filters.path}
            onChange={handleChange}
            placeholder="Tìm theo đường dẫn"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="min-w-[150px]">
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Tất cả loại</option>
            <option value="product">Sản phẩm</option>
            <option value="post">Bài viết</option>
            <option value="category">Danh mục</option>
            <option value="page">Trang</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="min-w-[150px]">
          <select
            name="statusCode"
            value={filters.statusCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Tất cả mã</option>
            <option value="301">301 - Vĩnh viễn</option>
            <option value="302">302 - Tạm thời</option>
            <option value="307">307 - Tạm thời</option>
            <option value="308">308 - Vĩnh viễn</option>
          </select>
        </div>

        <div className="min-w-[120px]">
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Kích hoạt</option>
            <option value="false">Vô hiệu</option>
          </select>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Đặt lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default RedirectFilters; 