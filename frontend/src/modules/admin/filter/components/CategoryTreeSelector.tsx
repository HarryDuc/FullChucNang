"use client";
import React, { useState } from "react";
import { GoChevronDown, GoChevronRight } from "react-icons/go";

// Định nghĩa kiểu Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory: string | null;
  subCategories: string[];
  description: string;
  level: number;
  isActive: boolean;
}

interface CategoryTreeSelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
}

const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
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
    const isSelected = selectedCategories.includes(category._id);
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
            htmlFor={`cat-${category._id}`}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded flex-1"
          >
            <input
              type="checkbox"
              id={`cat-${category._id}`}
              checked={isSelected}
              onChange={(e) => onCategoryChange(category._id, e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 flex-1">{category.name}</span>
            {hasChildren && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {children.length}
              </span>
            )}
          </label>
          {hasChildren && arrowIcon}
        </div>

        {/* Render danh mục con nếu node được mở */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1 border-l border-gray-200 pl-3">
            {children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Lấy danh mục top-level: level=0
  const topCategories = categories.filter((cat) => cat.level === 0);

  return (
    <div className="border border-gray-300 rounded">
      {/* Header với các nút điều khiển */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Danh mục sản phẩm</span>
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
        {topCategories.length > 0 ? (
          topCategories.map((cat) => renderNode(cat))
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            Không có danh mục nào
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTreeSelector; 