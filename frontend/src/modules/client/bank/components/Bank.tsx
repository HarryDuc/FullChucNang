"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CheckoutBank = () => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderSlug, setOrderSlug] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    console.log("Bank component mounted");
    const qrUrlFromStorage = localStorage.getItem("qrUrl");
    const orderSlugFromStorage = localStorage.getItem("orderSlug");
    console.log("QR URL from storage:", qrUrlFromStorage);
    console.log("Order slug from storage:", orderSlugFromStorage);

    setQrUrl(qrUrlFromStorage);
    setOrderSlug(orderSlugFromStorage);
  }, []);

  const handleConfirmed = () => {
    console.log("Payment confirmed");
    setConfirmed(true);
    clearCartAndStorage();
  };

  const handleCancel = () => {
    console.log("Payment cancelled");
    // 🧹 Xoá các item trong localStorage
    localStorage.removeItem("orderSlug");
    localStorage.removeItem("qrUrl");

    // 🔁 Điều hướng về trang Checkout
    window.location.href = "/checkout";
  };

  const clearCartAndStorage = () => {
    console.log("Clearing cart and storage");
    localStorage.removeItem("qrUrl");
    localStorage.removeItem("orderSlug");
    localStorage.removeItem("cart");
    // Nếu có giỏ hàng localStorage, có thể gọi clearCart() nếu muốn

    // 🧠 Gửi sự kiện để các thành phần khác biết cart đã clear
    window.dispatchEvent(new Event("cart-updated"));
  };

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="bg-white border p-8 shadow-md">
          <div className="text-green-600 inline-block p-6 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-4 text-gray-800">
            ĐẶT HÀNG THÀNH CÔNG
          </h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn quý khách đã đặt hàng tại Decor & More. Đơn hàng của quý
            khách đã được tiếp nhận và đang được xử lý. Mã đơn hàng của quý
            khách là:{" "}
            <span className="font-medium text-blue-900">{orderSlug}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ liên hệ với quý khách trong thời gian sớm nhất để xác
            nhận đơn hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-blue-900 text-white px-8 py-3 no-underline hover:bg-blue-800 transition duration-300"
            >
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4 text-blue-900">
        Chuyển khoản ngân hàng
      </h1>
      {qrUrl ? (
        <>
          <img
            src={qrUrl}
            alt="QR chuyển khoản"
            className="mx-auto w-[75%] h-[75%] mb-6 border"
            onError={(e) => {
              console.error("Error loading QR image:", e);
              e.currentTarget.src = "/images/qr-error.png"; // Fallback image
            }}
          />
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng quét mã QR để thanh toán. Sau khi chuyển khoản xong, nhấn
            nút "Tôi đã chuyển khoản".
          </p>
        </>
      ) : (
        <div>
          <p className="text-lg p-3 animate-pulse text-gray-500">
            Vui lòng chờ...
          </p>
          <p className="text-sm text-gray-600">
            Nếu không thấy mã QR hiển thị sau 5 giây, vui lòng nhấn nút Hủy và
            thử lại.
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleCancel}
          className="px-6 py-3 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
        >
          Hủy
        </button>
        <button
          onClick={handleConfirmed}
          className="px-6 py-3 rounded bg-blue-900 text-white hover:bg-blue-800 transition"
          disabled={!qrUrl}
        >
          Tôi đã chuyển khoản
        </button>
      </div>
    </div>
  );
};

export default CheckoutBank;
