"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FaUserCircle,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaBlog,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SearchComponent from "./SearchComponent";
import { listenCartChange } from "../../../../../../utils/cartUtils";
import InfoBar from "./InfoBar";
import { useInfoWebsite } from "@/modules/client/common/hooks/useInfoWebsite";
import Image from "next/image";

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

const MenuPC = () => {
  const { contact, loading } = useInfoWebsite();
  // Giỏ hàng
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth(); // 🧠 Lấy info auth từ context
  const [isOpen, setIsOpen] = useState(false); // 👇 Dropdown menu toggle
  const [showInfoBar, setShowInfoBar] = useState(true);

  // Tính tổng tiền
  const getCartTotal = () =>
    cartItems.reduce((sum, item) => {
      const price = item.discountPrice ?? item.currentPrice ?? 0;
      return sum + price * item.quantity;
    }, 0);

  // Format VND
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");

  // Xóa sản phẩm
  const handleRemoveItem = (id: string, variant?: string) => {
    const updated = cartItems.filter(
      (item) => !(item._id === id && item.variant === variant)
    );
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
  };


  // Lắng nghe thay đổi localStorage cho giỏ hàng
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("cart");
      if (stored) setCartItems(JSON.parse(stored));
      else setCartItems([]);
    };

    handleStorage();
    const unsubscribe = listenCartChange(handleStorage);
    return () => unsubscribe();
  }, []);

  // Đóng popup khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Accessibility handlers for nav icons
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    onClick: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick();
    }
  };
  const handleCartClick = () => setIsCartOpen((open) => !open);

  const categories: { label: string; href: string }[] = [
    {
      label: "Gối Sofa",
      href: "/category/goi-sofa"
    },
    {
      label: "Mô hình xe Vintage",
      href: "/category/mo-hinh-xe-vintage"
    },
    {
      label: "Đồng hồ trang trí",
      href: "/category/dong-ho-trang-tri"
    },
    {
      label: "Tranh Canvas",
      href: "/category/tranh-canvas"
    },
    {
      label: "Quà tặng nghệ thuật",
      href: "/category/qua-tang-nghe-thuat"
    }
  ];

  // Hide InfoBar when not at top
  const handleScroll = useCallback(() => {
    if (window.scrollY === 0) {
      setShowInfoBar(true);
    } else {
      setShowInfoBar(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav className="w-full bg-white hidden md:flex">
      {/* Main content using grid */}
      <div className="container mx-auto z-50 px-2 sm:px-4 md:px-6 py-2">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 items-center">
          <div className="row-span-2 flex items-center">
            <Link
              href="/"
              className="flex items-center cursor-pointer select-none flex-shrink-0"
              tabIndex={0}
              aria-label="Trang chủ Decor & More"
            >
              <img
                src={contact?.logo || "/image/Logo_Decor-More.png"}
                alt="Logo"
                className="mr-2 w-16 h-16 object-contain"
                loading="lazy"
              />
            </Link>
          </div>
          {/* Grid item 2: Search bar */}
          <div className="col-span-2">
            <div className="flex items-center justify-center w-full max-w-full">
              <SearchComponent />
            </div>
          </div>
          {/* Grid item 3: Category menu */}
          <div className="col-span-2 col-start-2 row-start-2">
            <div className="flex flex-wrap items-center space-x-2 md:space-x-6 px-0 border-t border-b border-gray-100 bg-white h-10 w-full overflow-x-auto">
              {categories.map((category) => (
                <a
                  key={category.label}
                  href={category.href}
                  className="text-gray-700 text-xs md:text-sm font-medium hover:text-blue-600 focus:text-blue-600 transition-colors outline-none whitespace-nowrap px-2 md:px-0"
                  tabIndex={0}
                  aria-label={category.label}
                >
                  {category.label}
                </a>
              ))}
            </div>
          </div>
          {/* Grid item 4: Icons (Blog, User, Cart) */}
          <div className="col-start-4 row-start-1 flex items-center space-x-4 md:space-x-6 justify-end">
            <div className="relative">
              <Link
                href="/posts"
                className="flex items-center gap-2 cursor-pointer no-underline"
                tabIndex={0}
                aria-label="Bài viết"
              >
                <FaBlog className="text-xl text-gray-500" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  Blog
                </span>
              </Link>
            </div>
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                  tabIndex={0}
                  aria-label="Tài khoản"
                >
                  <FaUserCircle className="text-xl text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    Tài khoản
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 cursor-pointer no-underline"
                  tabIndex={0}
                  aria-label="Đăng nhập"
                >
                  <FaUserCircle className="text-xl text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    Đăng nhập
                  </span>
                </Link>
              )}
              {isAuthenticated && isOpen && (
                <div className="absolute right-0 mt-2 w-58 bg-white rounded shadow-lg overflow-hidden z-[99] border border-gray-200">
                  <p className="px-4 py-2 border-b text-sm font-semibold text-gray-700">
                    {user?.email}
                  </p>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-700 transition no-underline"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
            <div
              ref={cartRef}
              className="relative flex items-center cursor-pointer"
              tabIndex={0}
              aria-label="Giỏ hàng"
              onClick={handleCartClick}
              onKeyDown={(e) => handleKeyDown(e, handleCartClick)}
            >
              <FaShoppingCart className="text-xl text-blue-500" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {cartItems.length}
                </span>
              )}
              {isCartOpen && (
                <div className="cart-popup-container absolute right-0 mt-1 bg-white p-4 z-50 border border-gray-200 w-72 shadow-lg top-7">
                  {cartItems.length > 0 ? (
                    <>
                      {cartItems.map((item) => (
                        <div
                          key={`${item._id}-${item.variant}`}
                          className="flex items-center gap-3 py-2 border-b"
                        >
                          <div className="w-12 h-12 flex-shrink-0">
                            <Image
                              src={`${item.image}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              width={40}
                              height={40}
                              />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h5 className="text-sm font-medium text-gray-700">
                              {item.name}
                            </h5>
                            {item.variant && (
                              <div className="text-xs text-gray-500">
                                {item.variant}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">
                              {item.quantity} ×{" "}
                              {formatPrice(
                                item.discountPrice ??
                                  item.currentPrice ??
                                  item.price
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item._id, item.variant)
                            }
                            className="text-gray-400 hover:text-gray-700"
                          >
                            <span className="sr-only">Xóa</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="py-3 border-b border-gray-200">
                        <div className="flex justify-between font-medium text-gray-700">
                          <span>Tổng cộng:</span>
                          <span>{formatPrice(getCartTotal())}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        <Link
                          href="/cart"
                          className="bg-[#547dbb] text-white py-3 px-4 rounded-none text-center hover:bg-opacity-90 transition-colors no-underline font-medium"
                        >
                          Xem Giỏ Hàng
                        </Link>
                        <Link
                          href="/checkout"
                          className="bg-[#021737] text-white py-3 px-4 rounded-none text-center hover:bg-opacity-90 transition-colors no-underline font-medium"
                        >
                          Thanh Toán
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="py-3 text-center text-gray-500">
                      Giỏ hàng trống
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Grid item 5: Delivery location */}
          <div className="col-start-4 row-start-2 flex items-center text-gray-500 text-xs md:text-sm justify-end">
            <FaMapMarkerAlt className="text-lg mr-1" />
            <span>
              Giao đến:{" "}
              <span className="underline text-black font-medium cursor-pointer">
                Q. 1, P. Bến Nghé, Hồ Chí Minh
              </span>
            </span>
          </div>
        </div>
        {/* Info bar */}
        {showInfoBar && (
          <div>
            <InfoBar />
          </div>
        )}
      </div>
    </nav>
  );
};

export default MenuPC;
