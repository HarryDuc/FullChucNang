"use client";
import React from "react";
import { useCategoryPosts } from "@/modules/admin/categories-post/hooks/useCategoriesPost";
import type { CategoryPost } from "../models/categories-post.model";

interface ParentCategoryPostProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const ParentCategoryPost: React.FC<ParentCategoryPostProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { listQuery: categoriesQuery } = useCategoryPosts(1, 100);

  // Không hiển thị loading, chỉ trả về div trống khi đang tải
  if (categoriesQuery.isLoading) {
    return <div className="h-12"></div>;
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

  const parentCategories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data.filter((cat: CategoryPost) => cat.level === 0)
    : [];

  return (
    <div className="flex gap-2 pb-2 min-w-max">
      <button
        key="all"
        onClick={() => onCategoryChange("all")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === "all"
            ? "bg-[#021737] text-white"
            : "bg-gray-100 text-[#021737] hover:bg-[#021737] hover:text-white"
          }`}
      >
        Tất cả
      </button>

      {parentCategories.map((cat: CategoryPost) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat.slug
              ? "bg-[#021737] text-white"
              : "bg-gray-100 text-[#021737] hover:bg-[#021737] hover:text-white"
            }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default ParentCategoryPost;