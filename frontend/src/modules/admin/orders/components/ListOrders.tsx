"use client";

import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { useRouter } from "next/navigation";
import { OrderStatus } from "../models/order.models";
import SearchOrders from "./SearchOrders";
import { OrderWithCheckout } from "../services/order.service";
import { OrderService } from "../services/order.service";
import EmailManagement from "./EmailManagement";

const ListOrders = () => {
  const {
    orders,
    loading,
    error,
    deleteOrder,
    updateOrderStatus,
    updatePaymentStatus,
  } = useOrders();
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<OrderWithCheckout | null>(
    null
  );
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [showEmailManagement, setShowEmailManagement] = useState(false);

  const handleDelete = async (slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      await deleteOrder(slug);
    }
  };

  const handleStatusChange = async (slug: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(slug);
      await updateOrderStatus(slug, newStatus);

      // Nếu đang ở chế độ tìm kiếm đơn hàng
      if (searchResult && searchResult.slug === slug) {
        const updated = await OrderService.searchOrderBySlug(slug);
        setSearchResult(updated);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePaymentStatusChange = async (
    checkoutSlug: string,
    newStatus: "pending" | "paid" | "failed"
  ) => {
    try {
      setUpdatingPayment(checkoutSlug);
      await updatePaymentStatus(checkoutSlug, newStatus);

      // Nếu đang tìm đơn hàng và có checkout slug khớp
      if (searchResult?.checkout?.slug === checkoutSlug) {
        const updated = await OrderService.searchOrderBySlug(
          searchResult.slug!
        );
        setSearchResult(updated);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const calculateTotalItems = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Render danh sách đơn hàng, sắp xếp từ ngày mới nhất xuống (descending by createdAt)
   * - Nếu có searchResult thì chỉ hiển thị đơn đó
   * - Nếu không, sắp xếp orders theo createdAt mới nhất trước
   */
  const renderOrders = () => {
    // Nếu có searchResult thì chỉ hiển thị đơn đó, không cần sort
    const displayOrders = searchResult
      ? [searchResult]
      : [...orders].sort((a, b) => {
        // Nếu thiếu createdAt thì để xuống cuối
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA // mới nhất trước
      })

    if (searchNotFound) {
      return (
        <tr>
          <td colSpan={8} className="text-center p-4 text-red-500 font-medium">
            Không tìm thấy đơn hàng với mã này.
          </td>
        </tr>
      )
    }

    if (displayOrders.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center p-4">
            Không có đơn hàng nào.
          </td>
        </tr>
      )
    }

    return displayOrders.map((order, index) => {
      const uniqueKey = order.slug || `order-${index}`
      return (
        <tr key={uniqueKey} className="border hover:bg-gray-50">
          <td className="border p-2 text-center">{index + 1}</td>
          <td className="border p-2">{order.slug || 'Không có'}</td>
          <td className="border p-2 text-center">
            {calculateTotalItems(order.orderItems)}
          </td>
          <td className="border p-2">
            {order.totalPrice.toLocaleString()} VND
          </td>
          <td className="border p-2">
            {updatingStatus === order.slug ? (
              <span>Đang cập nhật...</span>
            ) : (
              <select
                value={order.status}
                onChange={e =>
                  handleStatusChange(order.slug!, e.target.value as OrderStatus)
                }
                className={`p-1 rounded border ${getStatusColor(
                  order.status
                )} cursor-pointer`}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            )}
          </td>
          <td className="border p-2">
            {order.checkout ? (
              updatingPayment === order.checkout.slug ? (
                <span>Đang cập nhật...</span>
              ) : (
                <div>
                  <select
                    value={order.checkout.paymentStatus}
                    onChange={e =>
                      handlePaymentStatusChange(
                        order.checkout?.slug || '',
                        e.target.value as 'pending' | 'paid' | 'failed'
                      )
                    }
                    className={`p-1 rounded border ${getPaymentStatusColor(
                      order.checkout.paymentStatus
                    )} cursor-pointer`}
                  >
                    <option value="pending">Chờ thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="failed">Thanh toán thất bại</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.checkout.paymentMethod === 'cash' && 'Tiền mặt'}
                    {order.checkout.paymentMethod === 'bank' && 'Chuyển khoản'}
                    {order.checkout.paymentMethod === 'payos' && 'PayOS'}
                    {order.checkout.paymentMethod === 'paypal' && 'PayPal'}
                  </div>
                </div>
              )
            ) : (
              <div>
                <span className="text-gray-500">
                  Chưa có thông tin thanh toán
                </span>
                <div className="text-xs text-red-500 mt-1">
                  Thiếu liên kết đơn thanh toán
                </div>
              </div>
            )}
          </td>
          <td className="border p-2">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('vi-VN')
              : 'Không có'}
          </td>
          <td className="border p-2">
            <a
              href={`/admin/orders/detail/${order.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-2 py-1 rounded mr-2 inline-block"
            >
              Chi tiết
            </a>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => handleDelete(order.slug!)}
            >
              Xóa
            </button>
          </td>
        </tr>
      )
    })
  }

  if (loading) return <p>Đang tải danh sách đơn hàng...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  // Show email management if toggled
  if (showEmailManagement) {
    return (
      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Quản lý Email Đơn hàng</h1>
          <button
            onClick={() => setShowEmailManagement(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ← Quay lại Danh sách
          </button>
        </div>
        <EmailManagement />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Danh sách đơn hàng</h1>
        <button
          onClick={() => setShowEmailManagement(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Quản lý Email
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <SearchOrders
          onSearchResult={(order) => {
            setSearchResult(order);
            setSearchNotFound(false); // reset nếu tìm thấy
          }}
          onSearchNotFound={() => {
            setSearchResult(null);
            setSearchNotFound(true); // đánh dấu không tìm thấy
          }}
          onClearSearch={() => {
            setSearchResult(null);
            setSearchNotFound(false); // Xóa cả trạng thái không tìm thấy
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Mã đơn hàng</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Tổng tiền</th>
              <th className="border p-2">Trạng thái đơn hàng</th>
              <th className="border p-2">Trạng thái thanh toán</th>
              <th className="border p-2">Ngày tạo</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>{renderOrders()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ListOrders;
