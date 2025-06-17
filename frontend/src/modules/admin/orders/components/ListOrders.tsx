"use client";

import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { useRouter } from "next/navigation";
import { OrderStatus } from "../models/order.models";
import SearchOrders from "./SearchOrders";
import { OrderWithCheckout } from "../services/order.service";
import { OrderService } from "../services/order.service";

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

  const renderOrders = () => {
    const displayOrders = searchResult ? [searchResult] : orders;

    if (searchNotFound) {
      return (
        <tr>
          <td colSpan={8} className="text-center p-4 text-red-500 font-medium">
            Không tìm thấy đơn hàng với mã này.
          </td>
        </tr>
      );
    }

    if (displayOrders.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center p-4">
            Không có đơn hàng nào.
          </td>
        </tr>
      );
    }

    return displayOrders.map((order, index) => {
      const uniqueKey = order.slug || `order-${index}`;
      return (
        <tr key={uniqueKey} className="border hover:bg-gray-50">
          <td className="border p-2 text-center">{index + 1}</td>
          <td className="border p-2">{order.slug || "Không có"}</td>
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
                onChange={(e) =>
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
                <select
                  value={order.checkout.paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusChange(
                      order.checkout?.slug || "",
                      e.target.value as "pending" | "paid" | "failed"
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
              )
            ) : (
              <span className="text-gray-500">Chưa có thông tin</span>
            )}
          </td>
          <td className="border p-2">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("vi-VN")
              : "Không có"}
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
      );
    });
  };

  if (loading) return <p>Đang tải danh sách đơn hàng...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Danh sách đơn hàng</h1>

      <div className="mb-4 flex justify-between items-center">
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded mb-4"
          onClick={() => router.push("/orders/create")}
        >
          + Tạo đơn hàng
        </button>
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
