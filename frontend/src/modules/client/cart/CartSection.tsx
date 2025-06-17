"use client";;
import Link from "next/link";
import { useState, useEffect } from "react";
import { CartItem, getCart, updateQuantity, removeFromCart, getCartTotal, listenCartChange } from "../../../../utils/cartUtils";
import toast from "react-hot-toast";
import Head from "next/head";
import CartProductTable from './components/CartProductTable';
import CartProductCard from './components/CartProductCard';
import CartSummary from './components/CartSummary';
import CartEmpty from './components/CartEmpty';
import CartCoupon from './components/CartCoupon';

const CartSection = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValid, setCouponValid] = useState<boolean | null>(null);

  // Lấy dữ liệu giỏ hàng từ localStorage khi component được mount
  useEffect(() => {
    const loadCart = () => {
      const cart = getCart();
      setCartItems(cart);
    };

    // Lấy giỏ hàng khi component mount
    loadCart();

    // Đăng ký lắng nghe sự thay đổi giỏ hàng
    const unsubscribe = listenCartChange(loadCart);

    // Hủy đăng ký khi component unmount
    return unsubscribe;
  }, []);

  const handleRemoveItem = (_id: string, variant?: string, slug?: string, cartItemId?: string) => {
    const updatedItems = removeFromCart(_id, variant, slug, cartItemId);
    setCartItems(updatedItems);

    // Thêm thông báo khi xóa sản phẩm
    toast.success(
      <div className="flex items-center">
        <div className="mr-2 text-xl">🗑️</div>
        <span className="font-medium">Đã xóa sản phẩm</span>
      </div>,
      {
        duration: 2000,
        style: {
          maxWidth: '95vw',
          padding: '10px 15px',
        },
      }
    );
  };

  const handleQuantityChange = (_id: string, newQuantity: number, variant?: string, slug?: string) => {
    if (newQuantity < 1) return;
    const updatedItems = updateQuantity(_id, newQuantity, variant, slug);
    setCartItems(updatedItems);
  };

  const getSubtotal = () => {
    return getCartTotal(cartItems);
  };

  const getDiscount = () => {
    // Demo: giả lập giảm giá cố định 50,000đ nếu có mã giảm giá
    return couponValid ? 50000 : 0;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscount();
  };

  const handleApplyCoupon = () => {
    // Xử lý mã giảm giá (demo)
    if (!couponCode.trim()) {
      setCouponMessage("Vui lòng nhập mã giảm giá");
      setCouponValid(null);
      return;
    }

    // Giả lập mã giảm giá hợp lệ là "DECOR10" (demo)
    if (couponCode.trim().toUpperCase() === "DECOR10") {
      setCouponMessage("Áp dụng mã giảm giá thành công!");
      setCouponValid(true);

      // Thêm thông báo khi áp dụng mã giảm giá thành công
      toast.success(
        <div className="flex items-center">
          <div className="mr-2 text-xl">🎉</div>
          <div className="flex flex-col">
            <span className="font-medium">Áp dụng mã giảm giá thành công</span>
            <span className="text-xs mt-1 text-gray-600">Đã giảm 50.000đ</span>
          </div>
        </div>,
        {
          duration: 2000,
          style: {
            maxWidth: '95vw',
            padding: '10px 15px',
          },
        }
      );
    } else {
      setCouponMessage("Mã giảm giá không hợp lệ");
      setCouponValid(false);

      // Thêm thông báo khi mã giảm giá không hợp lệ
      toast.error(
        <div className="flex items-center">
          <div className="mr-2 text-xl">❌</div>
          <span className="font-medium">Mã giảm giá không hợp lệ</span>
        </div>,
        {
          duration: 2000,
          style: {
            maxWidth: '95vw',
            padding: '10px 15px',
          },
        }
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  return (
    <>
      <Head>
        <title>Giỏ Hàng Của Bạn | Trang Mua Sắm</title>
        <meta
          name="description"
          content="Kiểm tra giỏ hàng, cập nhật số lượng và áp dụng mã giảm giá để mua sắm tiện lợi cùng trải nghiệm tuyệt vời."
        />
        <meta
          name="keywords"
          content="giỏ hàng, mua sắm, giảm giá, DECOR10, sản phẩm, thanh toán"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://decorandmore.vn/gio-hang" />
      </Head>

      <div className="cart-page bg-gray-50">
        <div className=" mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 pb-2 border-b">
            <h1 className="text-xl md:text-2xl font-semibold text-blue-900">
              GIỎ HÀNG CỦA BẠN
            </h1>
            <Link
              href="/category"
              className="flex items-center mt-2 md:mt-0 text-sm md:text-base text-blue-900 hover:text-blue-700 no-underline transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Tiếp tục mua hàng
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <CartEmpty />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              <div className="lg:col-span-2">
                {/* Desktop version - hiển thị dạng bảng */}
                <CartProductTable
                  cartItems={cartItems}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveItem={handleRemoveItem}
                  formatPrice={formatPrice}
                />
                {/* Coupon input for desktop */}
                {/* <div className="hidden md:block bg-white border rounded-md mb-8 p-4 md:p-6">
                  <CartCoupon
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    handleApplyCoupon={handleApplyCoupon}
                    couponMessage={couponMessage}
                    couponValid={couponValid}
                  />
                </div> */}
                {/* Mobile version - hiển thị dạng card */}
                <CartProductCard
                  cartItems={cartItems}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveItem={handleRemoveItem}
                  formatPrice={formatPrice}
                />
                {/* Coupon input for mobile */}
                <div className="md:hidden bg-white border rounded-md p-4 mt-4">
                  <CartCoupon
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    handleApplyCoupon={handleApplyCoupon}
                    couponMessage={couponMessage}
                    couponValid={couponValid}
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <CartSummary
                  cartItems={cartItems}
                  getSubtotal={getSubtotal}
                  getTotal={getTotal}
                  formatPrice={formatPrice}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSection;