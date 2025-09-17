"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMainCategories,
  useSubCategories,
} from "../hooks/useClientProducts";
import { Category } from "../services/client.product.service";

// CategoryItem tối ưu giao diện, bỏ bg, đơn giản dễ nhìn
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

  // Khi nhấn vào tên danh mục, luôn đi tới link
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/category/${category.slug}`);
  };

  // Khi nhấn vào icon mũi tên, chỉ mở/đóng danh mục con
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div>
      <div
        className={`
          flex items-center justify-between w-full py-2 px-1 rounded transition cursor-pointer group border-l-2
          ${expanded ? "border-yellow-400" : "border-transparent"} hover:bg-gray-50
        `}
      >
        <span
          onClick={handleCategoryClick}
          className={`
            flex-1 truncate
            text-sm font-medium
            text-gray-800
            group-hover:text-yellow-600
            transition
          `}
          style={{ minWidth: 0 }}
        >
          {category.name}
        </span>
        {hasSub && (
          <button
            type="button"
            onClick={handleToggleExpand}
            className={`
              ml-2 p-1 rounded-full
              transition
              text-gray-500
              hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-yellow-400
            `}
            aria-label={expanded ? "Thu gọn" : "Mở rộng"}
            tabIndex={0}
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${expanded ? "rotate-90 text-yellow-600" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {expanded && hasSub && (
        <div className="ml-2 border-l-2 border-yellow-100 pl-2 mt-1 transition-all duration-300 ease-in-out">
          {loading ? (
            <p className="text-xs text-gray-400 pl-2 py-1">Đang tải...</p>
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

  // Đóng sidebar khi click ra ngoài overlay (mobile only)
  const handleOverlayClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Nút mở sidebar (mobile only) */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Mở danh mục sản phẩm"
        className="md:hidden p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 shadow font-semibold w-full flex items-center justify-center gap-2"
      >
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Danh mục sản phẩm</span>
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
          fixed z-50 top-0 left-0 h-full w-72 bg-white shadow-2xl border-r border-gray-200
          transform transition-transform duration-300 ease-in-out will-change-transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:shadow-none md:border-0 md:w-full md:h-auto md:sticky md:top-32 flex justify-center items-start
        `}
        style={{ maxWidth: "320px" }}
      >
        {/* Danh mục */}
        <div className="h-[90vh] w-full md:h-auto overflow-y-auto p-4 pr-1 bg-white rounded-xl shadow border border-gray-100 mt-4 md:mt-0">
          <h2 className="text-xl font-bold mb-4 text-yellow-700 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            Danh mục sản phẩm
          </h2>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <svg className="w-4 h-4 animate-spin text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Đang tải danh mục...
            </div>
          )}
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          <ul className="space-y-1 p-0">
            {categories.map((cat) => (
              <li key={cat.id} className="transition-colors">
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
