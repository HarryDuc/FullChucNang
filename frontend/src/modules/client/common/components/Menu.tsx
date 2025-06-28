"use client";

import { usePathname } from "next/navigation";
import MenuMobile from "./Menu/MenuMobile";
import MenuPC from "./Menu/MenuPc";
import TopBar from "./Menu/TopBar";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const Menu = () => {
  const pathname = usePathname();
  const { hasPermission, user } = useAuth();

  // Check if we're on a post detail page
  const isPostDetailPage = pathname?.startsWith("/posts/");
  const isProductDetailPage = pathname?.startsWith("/san-pham/");
  const postSlug = isPostDetailPage ? pathname.split("/").pop() : null;
  const productSlug = isProductDetailPage ? pathname.split("/").pop() : null;
  const canEditPost = hasPermission("posts", "update") || user?.role === "admin";
  const canEditProduct = hasPermission("products", "update") || user?.role === "admin";
  const showEditButton = isPostDetailPage && canEditPost && postSlug;
  const showEditProductButton = isProductDetailPage && canEditProduct && productSlug;

  // Height of the edit bar (for offset)
  const editBarHeight = showEditButton ? 44 : 0; // 44px is py-2 px-4 (approx)

  return (
    <>
      <style jsx global>{`
        /* Global styles for both PC and Mobile menus */
        .submenu-product-item {
          border: 1px solid #d9ab17;
          padding: 8px 12px;
          text-align: center;
          color: #555;
          font-size: 15px;
          font-weight: 400;
          min-width: 160px;
          display: block;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .submenu-product-item:hover {
          border-color: #d26d00;
          color: #d26d00;
          background-color: rgba(242, 242, 242, 0.5);
        }

        /* Submenu container styling */
        .submenu-container {
          background-color: white;
          border: 1px solid #d9ab17;
          z-index: 50;
        }
      `}</style>
      {/* Sửa bài viết bar sticky top-0 */}
      {showEditButton && (
        <div className="sticky top-0 z-[100] shadow bg-blue-700 text-white py-2 px-4">
          <div className="container mx-auto flex justify-end">
            <Link href={`/admin/posts/`} target="_blank" className="text-sm font-semibold hover:underline mr-4">
              Trang admin bài viết
            </Link>
            <Link
              href={`/admin/posts/edit/${postSlug}`}
              target="_blank"
              className="text-sm font-semibold hover:underline"
            >
              Sửa bài viết
            </Link>
          </div>
        </div>
      )}
      {showEditProductButton && (
        <div className="sticky top-0 z-[100] shadow bg-blue-700 text-white py-2 px-4">
          <div className="container mx-auto flex justify-end">
            <Link href={`/admin/products/`} target="_blank" className="text-sm font-semibold hover:underline mr-4">
              Trang admin sản phẩm
            </Link>
            <Link
              href={`/admin/products/edit/${productSlug}`}
              target="_blank"
              className="text-sm font-semibold hover:underline"
            >
              Sửa sản phẩm
            </Link>
          </div>
        </div>
      )}
      <TopBar />
      {/* Navbar sticky dưới thanh sửa bài viết nếu có */}
      <div
        className="sticky z-50 shadow"
        style={{
          top: showEditButton || showEditProductButton ? 36 : 0, // 44px = py-2 px-4 height
        }}
      >
        <MenuPC />
        <MenuMobile />
      </div>
    </>
  );
};

export default Menu;
