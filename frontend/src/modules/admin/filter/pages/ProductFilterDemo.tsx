"use client";

import React from 'react';
import { ProductFilterSection } from '../components/ProductFilterSection';

export default function ProductFilterDemo() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar với bộ lọc */}
          <div className="w-full md:w-80">
            <ProductFilterSection />
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Danh sách sản phẩm
              </h2>
              <p className="text-gray-500">
                Chọn bộ lọc bên trái để lọc sản phẩm theo khoảng giá
              </p>
              
              {/* Placeholder cho danh sách sản phẩm */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-lg p-4 h-48 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 