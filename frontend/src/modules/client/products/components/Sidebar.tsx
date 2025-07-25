"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  useCategoryBySlug,
  useMainCategories,
  useSubCategories,
} from "../hooks/useClientProducts";
import { Category } from "../services/client.product.service";
import Filter from "./Filter";

const CategoryItem = ({
  category,
  level = 0,
}: {
  category: Category;
  level?: number;
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { subCategories, loading } = useSubCategories(category.id);
  const hasSub = subCategories.length > 0;

  const handleClick = () => {
    if (hasSub) {
      setExpanded((prev) => !prev);
    } else {
      router.push(`/category/${category.slug}`);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex justify-between items-center py-2 text-left text-sm font-medium text-gray-700 hover:text-blue-500 transition"
        style={{ paddingLeft: `${level * 5}px` }}>
        <span>{category.name}</span>
        {hasSub && (
          <span
            className={`ml-2 transform transition-transform duration-200 ${expanded ? "rotate-90" : ""
              }`}>
            <svg
              className="w-3 h-3 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
      </button>

      {expanded && hasSub && (
        <div className="ml-2 transition-all duration-300 ease-in-out">
          {loading ? (
            <p className="text-xs text-gray-400 pl-2">Đang tải...</p>
          ) : (
            subCategories.map((sub) => (
              <CategoryItem key={sub.id} category={sub} level={level + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { categories, loading, error } = useMainCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const currentCategoryId = searchParams.get('categoryId');
  const { category, loading: loadingCategory } = useCategoryBySlug(slug);

  // Parse current filters from URL
  const [selectedFilters, setSelectedFilters] = useState(() => {
    try {
      const filterParams = Object.fromEntries(
        Array.from(searchParams.entries()).filter(([key]) => key !== 'categoryId')
      );
      
      // Parse any JSON values
      return Object.fromEntries(
        Object.entries(filterParams).map(([key, value]) => {
          try {
            return [key, JSON.parse(value)];
          } catch {
            return [key, value];
          }
        })
      );
    } catch {
      return {};
    }
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setSelectedFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    
    // Keep categoryId if it exists
    if (currentCategoryId) {
      params.set('categoryId', currentCategoryId);
    }
    
    router.push(`?${params.toString()}`);
  };

  // Đóng sidebar khi click ra ngoài overlay (mobile only)
  const handleOverlayClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Nút mở sidebar (mobile only) */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Mở danh mục và bộ lọc"
        className="md:hidden p-2 bg-gray-100 text-gray-800 rounded border border-gray-300 inline-flex items-center justify-center text-xl font-bold w-full">
        <span className="ml-2">Danh mục và bộ lọc</span>
      </button>

      {/* Overlay (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar / Offcanvas */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-[#f5f5fa] shadow-lg border-r
          transform transition-transform duration-300 ease-in-out will-change-transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
           md:translate-x-0 md:shadow-none md:border-0 md:w-full md:h-auto md:sticky md:top-32 flex flex-col gap-4
        `}>
        {/* Bộ lọc */}
        <Filter
          categoryId={category?._id || currentCategoryId || ""}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          loading={loading || loadingCategory}
        />

        {/* Danh mục */}
        <div className="h-[90vh] w-full md:h-auto overflow-y-auto p-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Danh mục sản phẩm</h2>
          {loading && (
            <p className="text-sm text-gray-500">Đang tải danh mục...</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <ul className="space-y-2 p-0">
            {categories.map((cat) => (
              <li key={cat.id} className="rounded hover:bg-blue-50 transition-colors">
                <CategoryItem category={cat} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
