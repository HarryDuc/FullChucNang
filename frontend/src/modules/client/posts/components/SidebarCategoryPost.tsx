"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCategoryPosts } from "@/modules/admin/categories-post/hooks/useCategoriesPost";
import type { CategoryPost } from "../models/categories-post.model";
import { GoChevronDown, GoChevronRight } from "react-icons/go";

const SidebarCategoryPost: React.FC = () => {
  const { listQuery: categoriesQuery } = useCategoryPosts(1, 100);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Skeleton for sidebar
  const SidebarCategorySkeleton = () => (
    <div className="bg-gray-50 p-6 rounded-lg mb-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <ul className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-2 border-t">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );

  if (categoriesQuery.isLoading) {
    return (
      <SidebarCategorySkeleton />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <div className="text-center py-2">
        <p className="text-red-500 text-sm">
          Không thể tải danh mục. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Hàm đệ quy hiển thị node
  const renderNode = (category: CategoryPost): React.ReactNode => {
    // Tìm children
    const children = categories.filter(
      (cat) =>
        cat.parent === category._id && cat.level === (category.level || 0) + 1
    );

    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.includes(category._id);

    // Hiển thị icon mũi tên nếu có con
    const arrowIcon = hasChildren ? (
      isExpanded ? (
        <GoChevronDown className="text-gray-600" />
      ) : (
        <GoChevronRight className="text-gray-600" />
      )
    ) : null;

    return (
      <li key={category._id}>
        <div className="flex items-center">
          <Link
            // href={`/posts/category/${category.slug}`}
            href="#"
            className="text-gray-700 hover:text-[#021737] transition-colors flex items-center flex-grow"
          >
            <span>{category.name}</span>
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category._id);
              }}
              className="ml-2 p-1"
            >
              {arrowIcon}
            </button>
          )}
        </div>

        {/* Render danh mục con nếu node được mở */}
        {hasChildren && isExpanded && (
          <ul className="ml-6 mt-1 space-y-2">
            {children.map((child) => (
              <React.Fragment key={child._id}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </ul>
        )}
      </li>
    );
  };

  // Lấy danh mục top-level: level=0
  const topCategories = categories.filter((cat) => cat.level === 0);

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Danh Mục</h3>
      <ul className="space-y-2">
        {topCategories.map((cat) => (
          <React.Fragment key={cat._id}>{renderNode(cat)}</React.Fragment>
        ))}
      </ul>
      <div className="mt-4 pt-2 border-t">
        <Link
          href="#"
          className="text-[#021737] hover:underline text-sm font-medium"
        >
          Xem tất cả danh mục →
        </Link>
      </div>
    </div>
  );
};

export default SidebarCategoryPost;
