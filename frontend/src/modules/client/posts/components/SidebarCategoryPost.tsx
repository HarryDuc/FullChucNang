"use client";
import React, { useState } from "react";
import Link from "next/link";
import type { CategoryPostTree } from "@/modules/admin/categories-post/models/categories-post.model";
import { GoChevronDown, GoChevronRight } from "react-icons/go";
import { useCategoryPosts } from "@/modules/admin/categories-post/hooks/useCategoriesPost";

const SidebarCategoryPost: React.FC = () => {
  const { categories, isLoading, isError } = useCategoryPosts();
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

  if (isLoading) {
    return <SidebarCategorySkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-2">
        <p className="text-red-500 text-sm">
          Không thể tải danh mục. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-gray-500 text-sm">Chưa có danh mục nào.</p>
      </div>
    );
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Hàm đệ quy hiển thị node
  const renderNode = (category: CategoryPostTree): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.includes(category._id);

    const arrowIcon = hasChildren ? (
      isExpanded ? (
        <GoChevronDown className="text-gray-600" />
      ) : (
        <GoChevronRight className="text-gray-600" />
      )
    ) : null;

    return (
      <li key={category._id} className="py-1">
        <div className="flex items-center group">
          <Link
            href="#"
            className="text-gray-700 hover:text-[#021737] transition-colors flex items-center flex-grow group-hover:font-medium"
          >
            <span>{category.name}</span>
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category._id);
              }}
              className="ml-2 p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              {arrowIcon}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
            {category.children.map((child: CategoryPostTree) => (
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
  const topCategories = categories.filter(
    (cat: CategoryPostTree) => cat.level === 0 && !cat.isDeleted
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8">
      <h3 className="text-lg font-bold mb-4 border-b pb-2 text-[#021737]">
        Danh Mục Bài Viết
      </h3>
      {topCategories.length > 0 ? (
        <ul className="space-y-1">
          {topCategories.map((cat: CategoryPostTree) => (
            <React.Fragment key={cat._id}>{renderNode(cat)}</React.Fragment>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          Chưa có danh mục nào.
        </p>
      )}
      <div className="mt-4 pt-2 border-t">
        <Link
          href="#"
          className="text-[#021737] hover:underline text-sm font-medium inline-flex items-center"
        >
          Xem tất cả bài viết
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
};

export default SidebarCategoryPost;
