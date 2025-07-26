"use client";
import React, { useState } from "react";
import { GoChevronDown, GoChevronRight } from "react-icons/go";
import ProductFilterSelector from '../../../client/products/components/ProductFilterSelector';

// Định nghĩa kiểu Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory: string | null;
  subCategories: string[];
  description: string;
  level: number; // Dùng level
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number; // Số lượng sản phẩm trong danh mục
  filterableAttributes?: Record<string, any>; // Thuộc tính có thể lọc
  children?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  __v?: number; // Version
}

interface CategoryTreeProps {
  categories: Category[];
  selectedCategoryNames: string[];
  handleCategoryChange: (category: Category, checked: boolean) => void;
  loading?: boolean;
  error?: string;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategoryNames,

  handleCategoryChange,
  loading = false,
  error,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (categoryId: string) => {
    setExpandedNodes((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allCategoryIds = categories.map(cat => cat._id);
    setExpandedNodes(new Set(allCategoryIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Hàm đệ quy hiển thị node
  const renderNode = (category: Category): React.ReactNode => {
    // Tìm children
    const children = categories.filter(
      (cat) =>
        cat.parentCategory === category._id && cat.level === category.level + 1
    );

    const hasChildren = children.length > 0;
    // Nếu danh mục được chọn (đang mở) thì hiện checkbox checked
    const isChecked = selectedCategoryNames.includes(category._id);
    const isExpanded = expandedNodes.has(category._id);

    // Hiển thị icon mũi tên nếu có con
    const arrowIcon = hasChildren ? (
      <button
        type="button"
        onClick={() => toggleNode(category._id)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        {isExpanded ? (
          <GoChevronDown className="text-gray-600 w-4 h-4" />
        ) : (
          <GoChevronRight className="text-gray-600 w-4 h-4" />
        )}
      </button>
    ) : null;

    return (
      <div key={category._id} className="mb-1">
        {/* Hàng chứa checkbox, tên danh mục và icon (nếu có) */}
        <div className="flex items-center gap-2 py-1">
          <label
            htmlFor={category._id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded flex-1"
          >
            <input
              type="checkbox"
              id={category._id}
              checked={isChecked}
              onChange={(e) => handleCategoryChange(category, e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span 
              className={`text-sm flex-1 ${
                category.isActive ? 'text-gray-700' : 'text-gray-400 line-through'
              }`}
              title={`${category.name} (${category.slug})${category.description ? ` - ${category.description}` : ''}`}
            >
              {category.name}
              {!category.isActive && (
                <span className="text-xs text-red-500 ml-1">(Không hoạt động)</span>
              )}
            </span>
            {hasChildren && (
              <span 
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                title={`${children.length} danh mục con`}
              >
                {children.length}
              </span>
            )}
            {category.subCategories && category.subCategories.length > 0 && (
              <span 
                className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded ml-1"
                title={`${category.subCategories.length} subcategories`}
              >
                {category.subCategories.length}
              </span>
            )}
            {category.productCount !== undefined && (
              <span 
                className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded ml-1"
                title={`${category.productCount} sản phẩm`}
              >
                {category.productCount}
              </span>
            )}
            {category.filterableAttributes && Object.keys(category.filterableAttributes).length > 0 && (
              <span 
                className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded ml-1"
                title={`${Object.keys(category.filterableAttributes).length} thuộc tính lọc`}
              >
                {Object.keys(category.filterableAttributes).length}
              </span>
            )}
            {category.children && category.children.length > 0 && (
              <span 
                className="text-xs text-indigo-500 bg-indigo-100 px-2 py-1 rounded ml-1"
                title={`${category.children.length} children`}
              >
                {category.children.length}
              </span>
            )}
            {/* {category.__v !== undefined && (
              <span 
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-1"
                title={`Version ${category.__v}`}
              >
                v{category.__v}
              </span>
            )} */}
          </label>
          {hasChildren && arrowIcon}
        </div>



        {/* Render danh mục con nếu node được mở */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1 border-l border-gray-200 pl-3">
            {children.map((child) => renderNode(child))}
          </div>
        )}

        {/* Hiển thị level indicator */}
        {/* {category.level > 0 && (
          <div className="ml-2 text-xs text-gray-400">
            Level {category.level}
            {category.parentCategory && (
              <span className="ml-1">
                (Parent: {categories.find(cat => cat._id === category.parentCategory)?.name || 'Unknown'})
              </span>
            )}
            {category.createdAt && (
              <span className="ml-1">
                (Tạo: {new Date(category.createdAt).toLocaleDateString('vi-VN')})
              </span>
            )}
            {category.updatedAt && category.updatedAt !== category.createdAt && (
              <span className="ml-1">
                (Cập nhật: {new Date(category.updatedAt).toLocaleDateString('vi-VN')})
              </span>
            )}
            {category.__v !== undefined && category.__v > 0 && (
              <span className="ml-1">
                (Version: {category.__v})
              </span>
            )}
            {category.updatedAt && category.updatedAt !== category.createdAt && (
              <span className="ml-1">
                (Cập nhật: {new Date(category.updatedAt).toLocaleDateString('vi-VN')})
              </span>
            )}
          </div>
        )} */}
      </div>
    );
  };

  // Lấy danh mục top-level: level=0
  const topCategories = categories.filter((cat) => cat.level === 0);

  return (
    <div className="border border-gray-300 rounded">
      {/* Header với các nút điều khiển */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Danh mục sản phẩm</span>
          {selectedCategoryNames.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {selectedCategoryNames.length} đã chọn
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Mở tất cả
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Đóng tất cả
          </button>
        </div>
      </div>
      
      {/* Nội dung danh mục */}
      <div className="overflow-y-auto p-3">
        {loading ? (
          <div className="text-gray-500 text-sm text-center py-4">
            Đang tải danh mục...
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center py-4">
            {error}
          </div>
        ) : topCategories.length > 0 ? (
          topCategories.map((cat) => renderNode(cat))
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            Không có danh mục nào
          </div>
        )}
      </div>

      {/* Hiển thị danh mục đã chọn */}
      {selectedCategoryNames.length > 0 && (
        <div className="p-3 bg-blue-50 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Danh mục đã chọn:</div>
          <div className="flex flex-wrap gap-1">
            {selectedCategoryNames.map((categoryId, index) => {
              const category = categories.find(cat => cat._id === categoryId);
              return (
                <span
                  key={categoryId}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {category?.name || categoryId}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTree;
