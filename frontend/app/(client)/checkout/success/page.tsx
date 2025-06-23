"use client";

import { useEffect, useState } from "react";
import {  useSearchParams } from "next/navigation";
import { paypalService } from "@/modules/client/checkout/services/paypalService";
import Link from "next/link";

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderSlug, setOrderSlug] = useState<string>("");

  useEffect(() => {
    const handlePayPalSuccess = async () => {
      try {
        setIsLoading(true);

        // Get the order slug from localStorage
        const slug = localStorage.getItem("orderSlug");
        if (!slug) {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        setOrderSlug(slug);

        // Get the PayPal order ID from the URL
        const paypalOrderId = searchParams.get("token");
        if (!paypalOrderId) {
          throw new Error("Không tìm thấy mã giao dịch PayPal");
        }

        // Update the order status to paid
        await paypalService.updateOrderStatus(slug, paypalOrderId);

        // Clear the cart
        localStorage.removeItem("cart");

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error processing PayPal success:", error);
        setError(error.message || "Đã xảy ra lỗi khi xử lý thanh toán");
        setIsLoading(false);
      }
    };

    handlePayPalSuccess();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Đang xử lý thanh toán...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Lỗi thanh toán</h1>
        <p className="mb-6">{error}</p>
        <Link
          href="/checkout"
          className="bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-800"
        >
          Quay lại thanh toán
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold mb-2 text-green-700">Thanh toán thành công!</h1>
      <p className="text-xl mb-8">Cảm ơn bạn đã mua hàng tại Decor & More</p>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Link
          href={`/account/orders/${orderSlug}`}
          className="bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-800"
        >
          Xem chi tiết đơn hàng
        </Link>
        <Link
          href="/"
          className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}