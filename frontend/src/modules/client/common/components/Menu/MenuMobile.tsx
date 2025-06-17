"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import SearchComponent from "./SearchComponent";
import { useAuth } from "@/context/AuthContext";
import { listenCartChange } from "../../../../../../utils/cartUtils";
import { useInfoWebsite } from "@/modules/client/common/hooks/useInfoWebsite";

// Sample cart item interface
interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  slug?: string;
  currentPrice?: number;
  discountPrice?: number;
  sku?: string;
}

const MenuMobile = () => {
  // State for managing mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isDecorationOpen, setIsDecorationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLifestyleOpen, setIsLifestyleOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { contact } = useInfoWebsite();
  // Remove unused state "isOpen" and "setIsOpen"

  useEffect(() => {
    setIsLoading(false); // Data from context is ready
  }, [isAuthenticated]);

  // State for cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Retrieve cart data from localStorage on component mount
  useEffect(() => {
    const handleStorage = () => {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } else {
        setCartItems([]);
      }
    };

    // Initial cart load
    handleStorage();

    // Listen for cart changes
    const unsubscribe = listenCartChange(handleStorage);

    // Lock scrolling when mobile menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  if (isLoading) {
    return null;
  }

  // Toggle main menu open/close and reset submenus when closing
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProductsOpen(false);
    setIsStyleOpen(false);
    setIsDecorationOpen(false);
    setIsGuideOpen(false);
    setIsLifestyleOpen(false);
  };

  // Toggle a specific submenu and close others
  const toggleSubmenu = (
    menuName: "products" | "style" | "decoration" | "guide" | "lifestyle"
  ) => {
    // Close all submenus first
    setIsProductsOpen(false);
    setIsStyleOpen(false);
    setIsDecorationOpen(false);
    setIsGuideOpen(false);
    setIsLifestyleOpen(false);

    // Open or close the specific submenu
    switch (menuName) {
      case "products":
        setIsProductsOpen((prev) => !prev);
        break;
      case "style":
        setIsStyleOpen((prev) => !prev);
        break;
      case "decoration":
        setIsDecorationOpen((prev) => !prev);
        break;
      case "guide":
        setIsGuideOpen((prev) => !prev);
        break;
      case "lifestyle":
        setIsLifestyleOpen((prev) => !prev);
        break;
    }
  };

  return (
    <div className="md:hidden">
      {/* Mobile menu header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto p-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="logo">
                <img
                  src={contact?.logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  loading="lazy"
                />
              </Link>
              <div className="ml-2">
                <div className="text-[#021737] text-lg font-bold">
                  Décor & More
                </div>
                <div className="text-[#f4811f] text-xs">
                  Bring Your Home To Life
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile search form */}
              <SearchComponent isMobile={true} />

              {/* Cart button */}
              <Link
                href="/cart"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <IoCartOutline size={24} className="text-[#e6be20]" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Menu toggle button */}
              <button
                onClick={toggleMenu}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[99]"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Sliding mobile menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[100] transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        {/* Mobile menu header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={contact?.logo}
              alt="Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <div>
              <div className="text-[#021737] font-bold">Décor & More</div>
              <div className="text-[#f4811f] text-xs">
                Bring Your Home To Life
              </div>
            </div>
          </div>
          <button
            onClick={toggleMenu}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Mobile navigation links */}
        <ul className="px-4 py-2 space-y-3">
          <li>
            <Link href="/" onClick={toggleMenu} className="nav-link">
              Trang Chủ
            </Link>
          </li>

          {/* Products menu */}
          <li>
            <div className="flex items-center justify-between">
              <Link
                href="category"
                onClick={toggleMenu}
                className="nav-link flex-grow no-underline"
              >
                Sản Phẩm
              </Link>
              <button onClick={() => toggleSubmenu("products")} className="p-2">
                <IoIosArrowDown
                  className={`transition-transform duration-500 ease-in-out ${
                    isProductsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`pl-4 space-y-2 overflow-hidden transition-all duration-500 ease-in-out ${
                isProductsOpen ? "max-h-[500px] mt-2" : "max-h-0"
              }`}
            >
              <Link
                href="/category/home-decor"
                onClick={toggleMenu}
                className="block font-bold text-gray-900 hover:text-[#d9ab17] mb-2 no-underline"
              >
                HOME DECOR
              </Link>
              {/* Other product links */}
              <Link
                href="/category/decor-cao-cap"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Decor Cao Cấp
              </Link>
              <Link
                href="/category/goi-sofa"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Gối Sofa
              </Link>
              <Link
                href="/category/tranh-canvas"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Tranh Canvas
              </Link>
              <Link
                href="/category/ban-ghe"
                onClick={toggleMenu}
                className="block font-bold text-gray-900 hover:text-[#d9ab17] mt-4 mb-2 no-underline"
              >
                BÀN GHẾ
              </Link>
              <Link
                href="/category/tham-trang-tri"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Thảm Trang Trí
              </Link>
              <Link
                href="/category/qua-tang-nghe-thuat"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Quà Tặng Nghệ Thuật
              </Link>
              <Link
                href="/category/do-gom"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Đồ Gốm
              </Link>
              <Link
                href="/category/dong-ho-trang-tri"
                onClick={toggleMenu}
                className="block font-bold text-gray-900 hover:text-[#d9ab17] mt-4 mb-2 no-underline"
              >
                ĐỒNG HỒ TRANG TRÍ
              </Link>
              <Link
                href="/category/mo-hinh-xe-vintage"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Mô Hình Xe Vintage
              </Link>
              <Link
                href="/category/ke-tu"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Kệ Tủ
              </Link>
              <Link
                href="/category/san-pham-khac"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 pl-2 no-underline"
              >
                Sản Phẩm Khác
              </Link>
            </div>
          </li>

          {/* Style menu */}
          <li>
            <div className="flex items-center justify-between">
              <Link
                href="/category/style"
                onClick={toggleMenu}
                className="nav-link flex-grow no-underline"
              >
                Style
              </Link>
              <button onClick={() => toggleSubmenu("style")} className="p-2">
                <IoIosArrowDown
                  className={`transition-transform duration-300 ${
                    isStyleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                isStyleOpen ? "max-h-[500px] mt-2" : "max-h-0"
              }`}
            >
              <Link
                href="/category/minimalist"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Minimalist
              </Link>
              <Link
                href="/category/scandinavian"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Scandinavian
              </Link>
              <Link
                href="/category/vintage"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Vintage
              </Link>
              <Link
                href="/category/neo-classical"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Neo-Classical
              </Link>
              <Link
                href="/category/abstract"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Abstract
              </Link>
            </div>
          </li>

          {/* Decoration / Blog menu */}
          <li>
            <div className="flex items-center justify-between">
              <Link
                href="/posts"
                onClick={toggleMenu}
                className="nav-link flex-grow no-underline"
              >
                BLOG
              </Link>
              <button
                onClick={() => toggleSubmenu("decoration")}
                className="p-2"
              >
                <IoIosArrowDown
                  className={`transition-transform duration-300 ${
                    isDecorationOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                isDecorationOpen ? "max-h-[500px] mt-2" : "max-h-0"
              }`}
            >
              <Link
                // href="/trang-tri/chia-se-kinh-nghiem"
                href="/posts"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Trang Trí Nhà Cửa
              </Link>
              <Link
                // href="/trang-tri/phong-cach-trang-tri"
                href="/posts"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Lifestyle
              </Link>
              <Link
                href="/posts"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Cẩm Nang
              </Link>
            </div>
          </li>

          {/* Guide menu */}
          {/* <li>
            <div className="flex items-center justify-between">
              <Link
                href="/services"
                onClick={toggleMenu}
                className="nav-link flex-grow no-underline"
              >
                Cẩm Nang
              </Link>
              <button onClick={() => toggleSubmenu("guide")} className="p-2">
                <IoIosArrowDown
                  className={`transition-transform duration-300 ${
                    isGuideOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                isGuideOpen ? "max-h-[500px] mt-2" : "max-h-0"
              }`}
            >
              <Link
                href="/cam-nang/si-ctv"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                SI - CTV
              </Link>
              <Link
                href="/cam-nang/kinh-doanh"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Kinh Doanh
              </Link>
            </div>
          </li> */}

          {/* Lifestyle menu */}
          {/* <li>
            <div className="flex items-center justify-between">
              <Link
                href="/lifestyle"
                onClick={toggleMenu}
                className="nav-link flex-grow no-underline"
              >
                Lifestyle
              </Link>
              <button
                onClick={() => toggleSubmenu("lifestyle")}
                className="p-2"
              >
                <IoIosArrowDown
                  className={`transition-transform duration-300 ${
                    isLifestyleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                isLifestyleOpen ? "max-h-[500px] mt-2" : "max-h-0"
              }`}
            >
              <Link
                href="/lifestyle/kien-thuc-noi-that"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Kiến Thức Nội Thất
              </Link>
              <Link
                href="/lifestyle/sang-tao-trang-tri"
                onClick={toggleMenu}
                className="block text-gray-600 hover:text-gray-900 no-underline"
              >
                Sáng Tạo Trang Trí
              </Link>
            </div>
          </li> */}

          {/* Account section */}
          <li className="border-t pt-4 mt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={toggleMenu}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded shadow hover:shadow-lg transition-all duration-200"
                >
                  Hồ Sơ Cá Nhân
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="block w-full text-center mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded shadow hover:shadow-lg transition-all duration-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded shadow hover:shadow-lg transition-all duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={toggleMenu}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded shadow hover:shadow-lg transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>

      <style jsx global>{`
        .nav-link {
          color: #374151;
          font-weight: 500;
          text-transform: uppercase;
          padding: 1px 10px;
          display: block;
          position: relative;
        }

        .nav-link:hover {
          color: #e6be20;
        }

        /* Styling for submenu product items on mobile */
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
      `}</style>
    </div>
  );
};

export default MenuMobile;
