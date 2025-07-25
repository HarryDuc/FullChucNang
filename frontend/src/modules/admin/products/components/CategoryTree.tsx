"use client";
import React from "react";
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
}

interface CategoryTreeProps {
  categories: Category[];
  selectedCategoryNames: string[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  handleCategoryChange: (category: Category, checked: boolean) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategoryNames,
  selectedFilters,
  onFilterChange,
  handleCategoryChange,
}) => {
  // Hàm đệ quy hiển thị node
  const renderNode = (category: Category): React.ReactNode => {
    // Tìm children
    const children = categories.filter(
      (cat) =>
        cat.parentCategory === category._id && cat.level === category.level + 1
    );

    const hasChildren = children.length > 0;
    // Nếu danh mục được chọn (đang mở) thì hiện checkbox checked
    const isOpen = selectedCategoryNames.includes(category.name);

    // Hiển thị icon mũi tên nếu có con
    const arrowIcon = hasChildren ? (
      isOpen ? (
        <GoChevronDown className="text-gray-600" />
      ) : (
        <GoChevronRight className="text-gray-600" />
      )
    ) : null;

    return (
      <div key={category._id} className="mb-2">
        {/* Hàng chứa checkbox, tên danh mục và icon (nếu có) */}
        <div className="flex items-center gap-1">
          <label
            htmlFor={category._id}
            className="flex items-center gap-1 cursor-pointer"
          >
            <input
              type="checkbox"
              id={category._id}
              checked={isOpen}
              onChange={(e) => handleCategoryChange(category, e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">{category.name}</span>
          </label>
          {hasChildren && arrowIcon}
        </div>

        {/* Hiển thị bộ lọc nếu danh mục được chọn */}
        {isOpen && !hasChildren && (
          <div className="ml-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <ProductFilterSelector
              categoryId={category._id}
              selectedFilters={selectedFilters}
              onChange={onFilterChange}
            />
          </div>
        )}

        {/* Render danh mục con nếu node được mở */}
        {hasChildren && isOpen && (
          <div className="ml-6 mt-1">
            {children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Lấy danh mục top-level: level=0
  const topCategories = categories.filter((cat) => cat.level === 0);

  return <div>{topCategories.map((cat) => renderNode(cat))}</div>;
};

export default CategoryTree;
