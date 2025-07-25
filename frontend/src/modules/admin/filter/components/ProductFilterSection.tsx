"use client";

import React from 'react';
import { PriceRangeFilter } from './PriceRangeFilter';
import { usePriceRangeFilter } from '../hooks/usePriceRangeFilter';

export const ProductFilterSection = () => {
  const {
    selectedRange,
    handleRangeChange,
    getPriceRangeFilter,
    resetFilter
  } = usePriceRangeFilter();

  const handleApplyFilter = () => {
    const filters = getPriceRangeFilter();
    console.log('Applied filters:', filters);
    // Gọi API hoặc cập nhật query params ở đây
  };

  return (
    <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Bộ lọc sản phẩm</h3>
          <p className="mt-1 text-sm text-gray-500">
            Lọc sản phẩm theo khoảng giá
          </p>
        </div>

        <PriceRangeFilter
          value={selectedRange}
          onChange={handleRangeChange}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleApplyFilter}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Áp dụng
          </button>
          
          <button
            type="button"
            onClick={resetFilter}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Đặt lại
          </button>
        </div>

        {/* Debug section - có thể xóa trong production */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Debug info:</p>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto">
            {JSON.stringify(getPriceRangeFilter(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}; 